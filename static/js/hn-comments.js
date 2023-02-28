
async function loadComments() {
    const container = document.querySelector('#hn-comments')
    const res = await fetch(`/hn-comments/${encodeURIComponent(window.postName)}`)
        .then(res => res.status === 200 ? res.json() : undefined)

    if (container && res) {
        container.innerHTML = `
            <h4>
                Comments from
                <a href="https://news.ycombinator.com/item?id=${res.postId}" target="_blank">
                    Hacker News</a>:
            </h4>
            ${res.html}
        `
    }
}

window.addEventListener('load', loadComments)
