
const { html } = require('./misc/utils');
const { boilerplate } = require('./fragments/boilerplate')

const blogList = (posts) =>
    boilerplate(html`
        ${posts
            .sort((a, b) => new Date(b.meta.Date) - new Date(a.meta.Date))
            .map(post => html`
                <article class="blog">
                    <h2 class="blog-title">
                        <a href="/blog/${post.slug}">
                            ${post.meta.title}
                        </a>
                    </h2>
                    ${post.html}
                </article>
            `)}
    `)

module.exports = { blogList }
