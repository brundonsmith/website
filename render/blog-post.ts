import { LocalPost } from '../loadBlogPosts.ts'
import { formatDate, getFirstParagraph, html } from '../utils/misc.ts'
import layout from './fragments/layout.ts'
import writing from './fragments/writing.ts'

export default (
    { url, post, allPosts }: {
        url: string
        post: LocalPost
        allPosts: readonly LocalPost[]
    },
) => layout({
    url,
    title: post.meta.title,
    description: getFirstParagraph(post.html),
    allPosts,
    content:
        // deno-fmt-ignore
        html`   
            <article class="main" itemProp="articleBody">
                <span style="display:none" itemProp="wordCount">${post.wordCount}</span>
                <span style="display:none" itemProp="author">Brandon Smith</span>

                <h1 class="blog-heading">
                    <span itemProp="headline">
                        ${post.meta.title}
                    </span>

                    <!-- 
                    <time datetime="${post.meta.date.toISOString()}" itemProp="datePublished">
                        ${formatDate(post.meta.date)}
                    </time> -->
                </h1>
            
                ${post.html}

                <!-- <div id="hn-comments"></div> -->

                <script>window.postName = '${post.slug}'</script>
            </article>

            <div class="mobile-only" style="max-width: var(--main-content-width); margin: 0 var(--main-padding); padding-bottom: var(--main-padding)">
                <hr style="margin: 2.5rem 0"/>
                <h2 style="margin: 0;">More thoughts</h2>

                ${writing({ url, allPosts })}
            </div>
        `,
})
