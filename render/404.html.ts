import { html } from '../utils/misc.ts'
import { SimplePageProps } from '../loadBlogPosts.ts'
import layout from './fragments/layout.ts'
import writing from './fragments/writing.ts'

export default ({ url, allPosts }: SimplePageProps) =>
    layout({
        url,
        title: 'Page not found',
        allPosts,
        content:
            // deno-fmt-ignore
            html`
                <main class="not-found">
                    <h1>Page not found</h1>

                    <p>
                        The page you requested is not here. It may have moved, 
                        or it may never have existed at all.

                        <span class="mobile-only">
                            Please see the links below to find the rest of the site.
                        </span>
                    </p>

                    <hr class="mobile-only" >

                    <div class="mobile-only" style="font: var(--font-english-sc)">
                        Links
                    </div>

                    <a 
                        class="mobile-only" 
                        href="/" 
                        style="color: inherit">
                        About me
                    </a>
    
                    <a class="mobile-only" href="https://github.com/brundonsmith" style="color: inherit" target="_blank" rel="noreferrer">
                        GitHub
                    </a>
    
                    <a class="mobile-only" href="https://www.linkedin.com/in/brandon-smith-9589706b" style="color: inherit" target="_blank" rel="noreferrer">
                        LinkedIn
                    </a>

                    <a class="mobile-only" href="/feed.xml" rel="noopener" title="RSS Feed" aria-label="RSS Feed">
                        RSS Feed
                    </a>
    
                    <div class="mobile-only" style="margin-top: 1rem; font: var(--font-english-sc)">
                        Writing
                    </div>
                    ${writing({ url, allPosts, className: 'mobile-only' })}
                </main>
            `,
    })
