const fetch = require('node-fetch')

const COMMENTS_CACHE = new Map()
const POST_COMMENTS_LOADING = new Map()
const COMMENTS_CACHE_LIFETIME = 60 * 1000 // one minute

module.exports = async function getCommentsCached(postName) {
    const cached = COMMENTS_CACHE.get(postName)

    if (!cached) {
        // if comments not cached at all, block while loading them
        const { postId, html } = await loadAndRender(postName)
        COMMENTS_CACHE.set(postName, { postId, html, timestamp: Date.now() })
        return { html, postId }
    } else if (!POST_COMMENTS_LOADING.get(postName) && (Date.now() - cached.timestamp > COMMENTS_CACHE_LIFETIME)) {
        // if comments are cached but expired, start updating them but return cached for now
        POST_COMMENTS_LOADING.set(postName, true)
        loadAndRender(postName)
            .then(({ postId, html }) =>
                COMMENTS_CACHE.set(postName, { postId, html, timestamp: Date.now() }))
            .finally(() => POST_COMMENTS_LOADING.set(postName, false))

        return { postId: cached.postId, html: cached.html }
    } else {
        // if cached and not expired, just return
        return { postId: cached.postId, html: cached.html }
    }
}

async function loadAndRender(postName) {
    const postId = await getPostId(postName)

    const data = await getCommentData(postId).then(data => data?.kids)
    const html = data?.map(renderComments).join('')

    return { postId, html }
}

async function getPostId(postName) {
    return await fetch(`https://hn.algolia.com/api/v1/search?tags=story&query=${encodeURIComponent('brandons.me/blog/' + postName)}`)
            .then(res => res.json())
            .then(res => res.hits[0]?.objectID)
        ?? await fetch(`https://hn.algolia.com/api/v1/search?tags=story&query=${encodeURIComponent('brandonsmith.ninja/blog/' + postName)}`)
            .then(res => res.json())
            .then(res => res.hits[0]?.objectID)
}

async function getCommentData(id) {
    const { by, text, time, kids } = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())

    return {
        id,
        by,
        text: text?.replace(/<p>/gi, '<br><br>')?.replace(/<\/p>/gi, ''),
        time,
        kids: kids && (await Promise.all(kids.map(getCommentData))).filter(item => item.text)
    }
}

function renderComments({ id, by, text, time, kids }) {
    const date = new Date(time * 1000)
    const isMe = by === 'brundolf'

    return `
        <div class="comment-heading ${isMe ? 'me' : ''}">
            ${isMe ? `<img class="me" src="/img/me.jpeg" />` : ''}

            ${text ? `<a class="by" href="https://news.ycombinator.com/user?id=${by}" target="_blank">
                ${by}
            </a>` : ''}
            |
            ${text ? `<a class="time" href="https://news.ycombinator.com/item?id=${id}" target="_blank">
                ${ago(date)}
            </a>` : ''}
        </div>
        ${text ? `<div class="text ${isMe ? 'me' : ''}">${text}</div>` : ''}
        ${kids ?
            `<div class="children">
                ${kids.map(renderComments).join('')}
            </div>`
            : ''}
    `
}

function ago(date) {
    const span = Date.now() - date

    if (span > ONE_YEAR) {
        return `${Math.floor(span / ONE_YEAR)} years ago`
    }
    if (span > ONE_MONTH) {
        return `${Math.floor(span / ONE_MONTH)} months ago`
    }
    if (span > ONE_DAY) {
        return `${Math.floor(span / ONE_DAY)} days ago`
    }
    if (span > ONE_HOUR) {
        return `${Math.floor(span / ONE_HOUR)} hours ago`
    }

    return `${Math.floor(span / ONE_MINUTE)} minutes ago`
}

const ONE_MINUTE = 60 * 1000
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR
const ONE_MONTH = 30 * ONE_DAY
const ONE_YEAR = 365 * ONE_DAY