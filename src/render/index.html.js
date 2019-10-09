
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
                            <ul class="post-list">
                                ${posts
                                    .filter(p => !p.meta.test) // filter out test-only posts
                                    .sort((a, b) => new Date(b.meta.date).valueOf() - new Date(a.meta.date).valueOf())
                                    .map(post => html`
                                        <li>${postPreview(post)}</li>
                                    `)
                                    .join('\n')}
                            </ul>
                        </div>
                        
                        ${footer()}
                    </body>
                </html>
            `)
