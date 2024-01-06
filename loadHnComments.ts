import { html, ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_YEAR } from "./utils/misc.ts"

type PostComments = {
    postId: string,
    html: string
}

const COMMENTS_CACHE = new Map<string, { data: PostComments | null, timestamp: number }>()
const POST_COMMENTS_LOADING = new Map<string, boolean>()
const COMMENTS_CACHE_LIFETIME = 60 * 1000 // one minute

export default async function getCommentsCached(postName: string) {
    const cached = COMMENTS_CACHE.get(postName)

    if (!cached) {
        // if comments not cached at all, block while loading them
        const data = await loadAndRender(postName)
        COMMENTS_CACHE.set(postName, { data, timestamp: Date.now() })
        return data
    } else {
        if (!POST_COMMENTS_LOADING.get(postName) && (Date.now() - cached.timestamp > COMMENTS_CACHE_LIFETIME)) {
            try {
                // if comments are cached but expired, start updating them but return cached for now
                POST_COMMENTS_LOADING.set(postName, true)
                loadAndRender(postName)
                    .then(data =>
                        COMMENTS_CACHE.set(postName, { data, timestamp: Date.now() }))
                    .finally(() => POST_COMMENTS_LOADING.set(postName, false))
            } catch {
            }
        }

        return cached.data
    }
}

async function loadAndRender(postName: string) {
    const postId = await getPostId(postName)

    const data = await getCommentData(postId).then(data => data?.kids)

    if (data == null) {
        return null
    }

    const html = data.map(renderComments).join('') ?? null

    return { postId, html }
}

async function getPostId(postName: string) {
    return await fetch(`https://hn.algolia.com/api/v1/search?tags=story&query=${encodeURIComponent('brandons.me/blog/' + postName)}`)
        .then(res => res.json())
        .then(res => res.hits[0]?.objectID)
        ?? await fetch(`https://hn.algolia.com/api/v1/search?tags=story&query=${encodeURIComponent('brandonsmith.ninja/blog/' + postName)}`)
            .then(res => res.json())
            .then(res => res.hits[0]?.objectID)
}

async function getCommentData(id: string) {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())

    if (!res) {
        return undefined
    }

    const { by, text, time, kids } = res

    return {
        id,
        by,
        text: text?.replace(/<p>/gi, '<br><br>')?.replace(/<\/p>/gi, ''),
        time,
        kids: kids && (await Promise.all(kids.map(getCommentData))).filter(item => item.text)
    }
}

function renderComments({ id, by, text, time, kids }: Comment): string {
    const date = new Date(time * 1000)
    const isMe = by === 'brundolf'

    return html`
        <div class="comment-heading ${isMe ? 'me' : ''}">
            ${isMe ? `<img class="me" src="/img/me.jpeg" />` : ''}
        
            ${text ? `<a class="by" href="https://news.ycombinator.com/user?id=${by}" target="_blank">
                ${by ?? ''}
            </a>` : ''}
            |
            ${text ? `<a class="time" href="https://news.ycombinator.com/item?id=${id}" target="_blank">
                ${ago(date)}
            </a>` : ''}
        </div>
        ${text ? html`<div class="text ${isMe ? 'me' : ''}">${text}</div>` : ''}
        ${kids ?
            html`<div class="children">
            ${kids.map(renderComments).join('')}
        </div>`
            : ''}
    `
}

type Comment = {
    id: string,
    time: number,
    by?: string,
    text?: string,
    kids?: readonly Comment[]
}

function ago(date: Date) {
    const span = Date.now() - date.valueOf()

    if (span > ONE_YEAR) {
        const years = Math.floor(span / ONE_YEAR)
        return `${years} year${s(years)} ago`
    }
    if (span > ONE_MONTH) {
        const months = Math.floor(span / ONE_MONTH)
        return `${months} month${s(months)} ago`
    }
    if (span > ONE_DAY) {
        const days = Math.floor(span / ONE_DAY)
        return `${days} day${s(days)} ago`
    }
    if (span > ONE_HOUR) {
        const hours = Math.floor(span / ONE_HOUR)
        return `${hours} hour${s(hours)} ago`
    }

    const minutes = Math.floor(span / ONE_MINUTE)
    return `${minutes} minute${s(minutes)} ago`
}

const s = (num: number) => num === 1 ? '' : 's'
