import { LocalPost } from '../loadBlogPosts.ts'
import { html } from '../utils/misc.ts'
import layout from './fragments/layout.ts'
import masthead from './fragments/masthead.ts'
import writing from './fragments/writing.ts'

export default (
    { post, allPosts }: { post: LocalPost; allPosts: readonly LocalPost[] },
) => layout({
    currentPost: post,
    allPosts,
    content:
        // deno-fmt-ignore
        html`
            ${masthead()}
                
            <article class="main" itemProp="articleBody">
                <span style="display:none" itemProp="wordCount">${post.wordCount}</span>
                <span style="display:none" itemProp="author">Brandon Smith</span>

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

                <!-- <div id="hn-comments"></div> -->

                <script>window.postName = '${post.slug}'</script>
            </article>

            <div className="tablet-or-mobile-only" style="max-width: var(--main-content-width); margin: 0 var(--main-padding); padding-bottom: var(--main-padding)">
                <hr />
                <h2 style="margin-top: var(--main-padding)">More thoughts</h2>

                ${writing({ currentPost: post, allPosts })}
            </div>
        `,
})
