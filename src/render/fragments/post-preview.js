
const { html } = require('../../utils/misc')
const author = require('./author')

module.exports = (post) => 
    html`
        <a class="post-preview" href="/blog/${post.slug}" aria-label="${post.meta.title}" itemscope itemtype="http://schema.org/Article">
        
            <span itemProp="headline">
                ${post.meta.title}
            </span>

            &nbsp;

            <span class="read-length">
                ${Math.max(Math.round(post.wordCount / 200), 1)} minute read
                <span style="display:none" itemProp="wordCount">${post.wordCount}</span>
            </span>

            <div class="flex-spacer"></div>

            ${author()}

            <time datetime="${post.meta.date}" itemProp="datePublished">
                ${post.meta.date}
            </time>
        </a>
    `