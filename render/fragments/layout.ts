import { LocalPost } from '../../loadBlogPosts.ts'
import { html } from '../../utils/misc.ts'
import footer from '../fragments/footer.ts'
import head from './head.ts'
import masthead from './masthead.ts'
import writing from './writing.ts'

export default (
    { url, title, description, allPosts, content, preloadImage }: {
        url: string
        title?: string
        description?: string
        allPosts: readonly LocalPost[]
        content: string
        /** Hero image for this page, preloaded so it can paint with first paint. */
        preloadImage?: string
    },
) => // deno-fmt-disable
html`
        <!DOCTYPE html>
        <html lang="en">
        
        ${head({ title, description, preloadImage })}
        
        <body>
            <div class="sidebar desktop-only">
                <a href="/" class="masthead" style="display: block">
                    Brandon Smith
                </a>

                <nav>
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
                    
                    <div class="desktop-only">
                        <hr size="1" />
                        <div class="section-heading">writing</div>
                    </div>
                    ${writing({ url, allPosts, className: 'desktop-only' })}
                </nav>
            </div>

            <div class="main-content">
                ${masthead()}

                ${content}

                <div style="height: var(--bottom-margin); flex-shrink: 0; flex-grow: 0;"></div>
            
                <div class="mobile-cta">
                    <span>
                        Available for <a href="/services">consulting</a>
                    </span>
                    &nbsp;
                    &nbsp;
                    <span >•</span>
                    &nbsp;
                    &nbsp;
                    <a href="mailto:mail@brandons.me">
                        mail@brandons.me
                    </a>
                </div>
            </div>

            ${footer()}
        </body>
        
        </html> 
    `
