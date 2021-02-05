
const { html, capitalize } = require('../utils/misc')

const head = require('./fragments/head')
const footer = require('./fragments/footer')
const postPreview = require('./fragments/post-preview')
const bio = require('./fragments/bio')

module.exports = ({ allTags, posts, tag }) =>
    html`
        <!DOCTYPE html>
        <html lang="en">

            ${head({ title: 'Blog' })}

            <body>

                ${bio()}
                
                <div class="main">
                    <div class="tags-container">
                        <span class="tags-label">Tags:</span>
                        <ul class="tags">
                            <li>
                                <a ${tag == null 
                                        ? '' 
                                        : 'href="/index.html"'}>
                                    All
                                </a>

                                &nbsp;|&nbsp;
                            </li>
                            
                            ${allTags
                                .map((t, i) => html`
                                    <li>
                                        <a ${t === tag 
                                                ? '' 
                                                : `href="/tags/${t}.html"`}>
                                            ${capitalize(t)}
                                        </a>
                                        
                                        ${i < allTags.length - 1
                                            ? html`&nbsp;|&nbsp;`
                                            : ``}
                                    </li>
                                `)
                                .join('\n')}
                        </ul>
                    </div>

                    <hr>

                    <ul class="post-list">
                        ${posts
                            .concat(require('../blog/external.json'))
                            .filter(p => !p.meta.test) // filter out test-only posts
                            .filter(p => tag == null || p.meta.tags.includes(tag))
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
    `
