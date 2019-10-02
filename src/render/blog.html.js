
const { html } = require('../utils/misc')
const { getBlogPost } = require('../utils/loading')

const { head, footer } = require('./fragments/boilerplate')
const bio = require('./fragments/bio')
const homeLink = require('./fragments/home-link')

module.exports = (postName) => 
    getBlogPost(postName)
        .then(post => html`
            <!DOCTYPE html>
            <html lang="en">

                ${head()}

                <body>
                    <link rel="stylesheet" type="text/css" href="/css/pages/blog.css">

                    ${bio()}

                    <article class="main">
                        ${homeLink()}
                    
                        <h1 class="blog-heading">
                            <span>${post.meta.title}</span>

                            <div class="flex-spacer"></div>

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