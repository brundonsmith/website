
const { html } = require('../utils/misc')
const { getBlogPost } = require('../utils/loading')

const head = require('./fragments/head')
const footer = require('./fragments/footer')
const bio = require('./fragments/bio')
const homeLink = require('./fragments/home-link')
const author = require('./fragments/author')

module.exports = (postName) => 
    getBlogPost(postName)
        .then(post => html`
            <!DOCTYPE html>
            <html itemscope itemtype="http://schema.org/Article" lang="en">

                ${head()}

                <body>

                    ${bio()}

                    <article class="main" itemProp="articleBody">
                        ${homeLink()}
                    
                        <h1 class="blog-heading">
                            <span itemProp="headling">
                                ${post.meta.title}
                            </span>

                            <span style="display:none" itemProp="wordCount">${post.wordCount}</span>

                            <div class="flex-spacer"></div>

                            ${author()}

                            <time datetime="${post.meta.date}" itemProp="datePublished">
                                ${post.meta.date}
                            </time>
                        </h1>

                        ${post.html}

                    </article>
                    
                    ${footer()}
                </body>
            </html>
        `)