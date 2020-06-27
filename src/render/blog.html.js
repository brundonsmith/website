
const { html, given, log } = require('../utils/misc')
const { getBlogPost } = require('../utils/loading')
const { DEFAULT_TITLE } = require('../utils/constants')

const head = require('./fragments/head')
const footer = require('./fragments/footer')
const bio = require('./fragments/bio')
const homeLink = require('./fragments/home-link')
const author = require('./fragments/author')

const FIRST_PARAGRAPH_EXPRESSION = /<p>((?:.|[\r\n])*?)<\/p>/im;
const TAGS_EXPRESSION = /<\/?[^>]+>/ig;

const getFirstParagraph = (html) =>
    given(new RegExp(FIRST_PARAGRAPH_EXPRESSION).exec(html), result => 
    given(result[1], blurb => 
        blurb.trim().replace(new RegExp(TAGS_EXPRESSION), '')))

module.exports = (postName) => 
    getBlogPost(postName)
        .then(post => html`
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
        `)