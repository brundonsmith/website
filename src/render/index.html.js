
const { html } = require('../utils/misc')
const { getAllBlogPosts } = require('../utils/loading')

const head = require('./fragments/head')
const footer = require('./fragments/footer')
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

                        ${bio()}
                        
                        <div class="main">
                            <ul class="post-list">
                                ${posts
                                    .concat(require('../blog/external.json'))
                                    .filter(p => !p.meta.test) // filter out test-only posts
                                    .sort((a, b) => new Date(b.meta.date).valueOf() - new Date(a.meta.date).valueOf())
                                    .map(post => html`
                                        <li>
                                            ${postPreview(post)}
                                        </li>
                                    `)
                                    .join('\n')}
                            </ul>
                        </div>
                        
                        ${footer()}
                    </body>
                </html>
            `)
