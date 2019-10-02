
const { html } = require('../utils/misc')
const { getAllBlogPosts } = require('../utils/loading')

const { head, footer } = require('./fragments/boilerplate')
const postPreview = require('./fragments/post-preview')
const bio = require('./fragments/bio')

module.exports = () =>
    getAllBlogPosts()
        .then(posts =>
            html`
                <!DOCTYPE html>
                <html lang="en">

                    ${head()}

                    <body>
                        <link rel="stylesheet" type="text/css" href="/css/pages/index.css">

                        ${bio()}
                        
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
