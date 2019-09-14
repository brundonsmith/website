
const { html, given } = require('../utils/misc')
const { getBlogPost } = require('../utils/loading')

const { head, nav, footer } = require('./fragments/boilerplate')

module.exports = (postName) => 
    getBlogPost(postName)
        .then(post => html`
            <!DOCTYPE html>
            <html lang="en">

                ${head()}

                <body>
                    <link rel="stylesheet" type="text/css" href="/css/pages/blog.css">

                    ${nav()}
                    
                    <article class="main">
                        <h1 class="blog-heading">
                            <span>${post.meta.title}</span>

                            <div class="flex-spacer"></div>

                            <time datetime="2018-08-03" itemProp="datePublished">
                                ${post.meta.date}
                            </time>
                        </h1>

                        ${post.html}

                    </article>
                    
                    ${footer()}
                </body>
            </html>
        `)