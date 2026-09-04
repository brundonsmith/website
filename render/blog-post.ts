import { LocalPost } from '../loadBlogPosts.ts'
import { html } from '../utils/misc.ts'
import layout from './fragments/layout.ts'
import mobileHeading from './fragments/mobile-heading.ts'

export default (
    { post, allPosts }: { post: LocalPost; allPosts: readonly LocalPost[] },
) => layout({
    currentPost: post,
    allPosts: allPosts,
    content:
        // deno-fmt-ignore
        html`
            ${mobileHeading()}
                
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
        `,
})
