
const { html } = require('../../utils/misc')

module.exports = (post) => 
    html`
        <div class="post-preview">
            <a href="/blog/${post.slug}">
                ${post.meta.title}
            </a>

            <div class="flex-spacer"></div>

            <span>
                ${post.meta.date}
            </span>
        </div>
    `