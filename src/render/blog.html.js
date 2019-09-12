
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
                    ${nav()}
                    
                    <div class="main">
                        <article class="blog singleton">
                            <h1>
                                <span>${post.meta.title}</span>

                                <div class="flex-expander"></div>

                                <span>${post.meta.date}</span>
                            </h1>

                            ${post.html}

                        </article>
                    </div>
                    
                    ${footer()}
                </body>
            </html>
        `)