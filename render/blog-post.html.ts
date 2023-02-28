import { html, getFirstParagraph } from "../utils/misc.ts"
import head from './fragments/head.ts'
import homeLink from './fragments/home-link.ts'
import footer from './fragments/footer.ts'
import author from "./fragments/author.ts";
import bio from "./fragments/bio.ts";
import { LocalPost } from "../loadBlogPosts.ts";

export default ({ post }: { post: LocalPost }) => 
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

                    <div id="hn-comments"></div>

                    <script>window.postName = '${post.slug}'</script>
                </article>

                ${footer()}
            </body>
        </html>
    `