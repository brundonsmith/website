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
    description: aboutMe,
    allPosts,
    preloadImage: portrait,
    content:
      // deno-fmt-disable
      html`
            <div class="home">
                <img src="${portrait}" width="200" height="200" alt="Brandon Smith"
                     fetchpriority="high" decoding="async" />

                <h1 class="about">
                  About me
                </h1>

               ${md`${aboutMe}`}


                <div class="mobile-only" style="margin-top: 1rem; font: var(--font-english-sc)">
                    Links
                </div>

                <a class="mobile-only" href="https://github.com/brundonsmith" style="color: inherit" target="_blank" rel="noreferrer">
                    GitHub
                </a>

                <a class="mobile-only" href="https://www.linkedin.com/in/brandon-smith-9589706b" style="color: inherit" target="_blank" rel="noreferrer">
                    LinkedIn
                </a>

                <div class="mobile-only" style="margin-top: 0.5rem; font: var(--font-english-sc)">
                    Writing
                </div>
                ${writing({ url, allPosts, className: 'mobile-only' })}
            </div>
        `,
  })

/** Shared by the markup and the preload hint so the two can't drift apart. */
const portrait = '/img/me-3-400.jpeg'

const aboutMe = `
I'm Brandon! I'm a software developer living in Austin, Texas. 

I've built full-stack tooling suites, transitioned two companies 
from JavaScript to TypeScript, given workshops and mentoring,
solved tough UI performance problems, and built component
libraries that entire orgs have relied on. I take on consulting
work in those areas. [More here.](/services)

My hobbies include TypeScript crimes, 
Rust shenanigans, 
making bad video games, and building programming languages 
nobody's ever going to use. When not at a computer I love music, 
long bike rides, liminal spaces, and most recently, watercolor 
painting.
`
