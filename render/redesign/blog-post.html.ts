import { LocalPost } from '../../loadBlogPosts.ts'
import { getFirstParagraph, html } from '../../utils/misc.ts'
import author from '../fragments/author.ts'
import footer from '../fragments/footer.ts'
import head from './fragments/head.ts'
import nav from './fragments/nav.ts'

export default (
    { post, posts }: { post: LocalPost; posts: readonly LocalPost[] },
) => // deno-fmt-ignore
html`
        <!DOCTYPE html>
        <html itemscope itemtype="http://schema.org/Article" lang="en">

            ${head({
                title: post.meta.title, 
                description: post.meta.description || getFirstParagraph(post.html)
            })}

            <body>

                ${nav({ post, posts })}

                <article class="main" itemProp="articleBody">
                    <span style="display:none" itemProp="wordCount">${post.wordCount}</span>
                    ${author()}

                    <h1 class="blog-heading">
                        <span itemProp="headline">
                            ${post.meta.title}
                        </span>

                        <!-- 
                        <time datetime="${post.meta.date}" itemProp="datePublished">
                            ${post.meta.date}
                        </time> -->
                    </h1>
                
                    ${post.html}

                    <div id="hn-comments"></div>

                    <script>window.postName = '${post.slug}'</script>
                </article>

                ${footer()}
            </body>
        </html>
    `
