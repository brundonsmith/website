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
                    </p>

                    <hr class="mobile-only" style="margin: 2.5rem 0">
                    
                    <nav class="mobile-only" style="text-align: left">
                        <a 
                            href="/" 
                            class="${url === '/' ? 'current' : ''}">
                            About me
                        </a>
                        <!-- <a href="#">Talks</a> -->
                        <!-- <a href="#">Photos</a> -->
                        <!-- <a href="#">Music I'm listening to</a> -->
    
                        <a 
                            href="/services" 
                            class="${url === '/services' ? 'current' : ''}">
                            Consulting services
                        </a>
                        <a href="mailto:mail@brandons.me" style="color: var(--accent)">Get in touch</a>
                        
                        <div class="section-heading" style="margin-top: 1rem;">writing</div>
                        ${writing({ url, allPosts })}
                    </nav>
                </main>
            `,
    })
