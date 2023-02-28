
async function loadComments() {
    const container = document.querySelector('#hn-comments')

    if (container) {
        const res = await fetch(`/hn-comments/${encodeURIComponent(window.postName)}`)
            .then(res => res.status === 200 ? res.json() : undefined)

        if (res) {
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
}

window.addEventListener('load', loadComments)
