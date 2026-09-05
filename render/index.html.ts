import { SimplePageProps } from '../loadBlogPosts.ts'
import { html, md } from '../utils/misc.ts'
import layout from './fragments/layout.ts'
import nav from './fragments/nav.ts'
import writing from './fragments/writing.ts'

export default (
  { currentPost, allPosts }: SimplePageProps,
) =>
  layout({
    currentPost,
    allPosts,
    content:
      // deno-fmt-disable
      html`
            <div class="home">
                <img src="/img/me-3.jpeg" width="200" height="200" />

                <div class="about">
                  <hr />
                  About me
                  <hr />
                </div>

                ${md`
                  I'm Brandon! I'm a software developer living in Austin, Texas. 
                  My hobbies include 
                  [TypeScript crimes](https://www.youtube.com/watch?v=0mCsluv5FXA), 
                  [Rust shenanigans](https://github.com/brundonsmith/rust_lisp), 
                  making bad video games, and building [programming languages 
                  nobody's ever going to use](/blog/the-bagel-language).

                  I've transitioned two companies from JavaScript to TypeScript,
                  built full-stack tooling suites, given workshops and mentoring,
                  solved tough UI performance problems, and built component
                  libraries that entire orgs have leaned on. If any of that
                  sounds interesting to you,
                  [I'm available for contract work](/services).

                  When not at a computer I love music, long bike rides, liminal
                  spaces, and most recently, watercolor painting.
                `}
                
                <div class="tablet-or-mobile-only" style="margin-top: 40px">
                    <div class="section-heading">writing</div>
                </div>
                ${
        writing({ currentPost, allPosts, className: 'tablet-or-mobile-only' })
      }
            </div>
        `,
  })
