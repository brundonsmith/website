import { SimplePageProps } from '../loadBlogPosts.ts'
import { html, md } from '../utils/misc.ts'
import layout from './fragments/layout.ts'
import writing from './fragments/writing.ts'

export default (
  { url, allPosts }: SimplePageProps,
) =>
  layout({
    url,
    title: 'Brandon Smith',
    allPosts,
    content:
      // deno-fmt-disable
      html`
            <div class="home">
                <!-- <h1>
                  About me
                </h1> -->

                <img src="/img/me-3.jpeg" width="200" height="200" />

                <div class="about">
                  <!-- <hr /> -->
                  About me
                  <!-- <hr /> -->
                </div>

                ${md`
                  I'm Brandon! I'm a software developer living in Austin, Texas. 

                  I've transitioned two companies from JavaScript to TypeScript,
                  built full-stack tooling suites, given workshops and mentoring,
                  solved tough UI performance problems, and built component
                  libraries that entire orgs have relied on. I take on consulting
                  work in those areas. [Ask me about it.](/services)

                  My hobbies include TypeScript crimes, 
                  Rust shenanigans, 
                  making bad video games, and building programming languages 
                  nobody's ever going to use. When not at a computer I love music, long bike rides, liminal
                  spaces, and most recently, watercolor painting.
                `}

                <div class="tablet-or-mobile-only" style="margin-top: 1.5rem">
                    <div class="section-heading">writing</div>
                </div>
                ${
        writing({ url, allPosts, className: 'tablet-or-mobile-only' })
      }
            </div>
        `,
  })
