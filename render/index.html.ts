import { SimplePageProps } from '../loadBlogPosts.ts'
import { html } from '../utils/misc.ts'
import layout from './fragments/layout.ts'
import nav from './fragments/nav.ts'

export default (
  { currentPost, allPosts }: SimplePageProps,
) =>
  layout({
    currentPost,
    allPosts,
    content:
      // deno-fmt-disable
      html`
            <div class="home" >
                <img src="/img/me-2.jpeg" width="200" height="200" />

                ${nav({ currentPost, allPosts, className: 'mobile-only' })}
            </div>
        `,
  })
