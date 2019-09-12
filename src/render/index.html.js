
const { html } = require('../utils/misc')
const { getAllBlogPosts } = require('../utils/loading')

const { head, nav, footer } = require('./fragments/boilerplate')
const postPreview = require('./fragments/post-preview')


module.exports = () =>
    getAllBlogPosts()
        .then(posts =>
            html`
                <!DOCTYPE html>
                <html>

                    ${head()}

                    <body>
                        <link rel="stylesheet" type="text/css" href="/css/pages/index.css">

                        ${nav()}
                        
                        <div class="main">
                            ${posts
                                .sort((a, b) => new Date(b.meta.Date) - new Date(a.meta.Date))
                                .map(post => postPreview(post))
                                .join('\n')}
                        </div>
                        
                        ${footer()}
                    </body>
                </html>
            `)
