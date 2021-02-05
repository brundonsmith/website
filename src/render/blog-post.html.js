
const { html, getFirstParagraph } = require('../utils/misc')

const head = require('./fragments/head')
const footer = require('./fragments/footer')
const bio = require('./fragments/bio')
const homeLink = require('./fragments/home-link')
const author = require('./fragments/author')

module.exports = ({ post }) => 
    html`
        <!DOCTYPE html>
        <html itemscope itemtype="http://schema.org/Article" lang="en">

            ${head({
                title: post.meta.title, 
                description: post.meta.description || getFirstParagraph(post.html)
            })}

            <body>

                ${bio()}

                <article class="main" itemProp="articleBody">
                    ${homeLink()}
                
                    <h1 class="blog-heading">
                        <span itemProp="headline">
                            ${post.meta.title}
                        </span>

                        <time datetime="${post.meta.date}" itemProp="datePublished">
                            ${post.meta.date}
                        </time>
                    </h1>
                
                    <span style="display:none" itemProp="wordCount">${post.wordCount}</span>

                    ${author()}


                    ${post.html}

                </article>
                
                ${footer()}
            </body>
        </html>
    `