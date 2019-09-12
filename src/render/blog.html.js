
const { html, given } = require('../utils/misc')
const { getBlogPost } = require('../utils/loading')

const { head, nav, footer } = require('./fragments/boilerplate')

module.exports = (postName) => 
    getBlogPost(postName)
        .then(post => html`
            <!DOCTYPE html>
            <html>

                ${head()}

                <body>
                    <link rel="stylesheet" type="text/css" href="/css/pages/blog.css">

                    ${nav()}
                    
                    <article class="main">
                        <h1 class="blog-heading">
                            <span>${post.meta.title}</span>

                            <div class="flex-spacer"></div>

                            <span class="date">
                                ${post.meta.date}
                            </span>
                        </h1>

                        ${post.html}

                    </article>
                    
                    ${footer()}
                </body>
            </html>
        `)