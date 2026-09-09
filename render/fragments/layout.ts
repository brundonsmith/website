import { LocalPost } from '../../loadBlogPosts.ts'
import { html } from '../../utils/misc.ts'
import footer from '../fragments/footer.ts'
import head from './head.ts'
import masthead from './masthead.ts'
import writing from './writing.ts'

export default (
    { title, description, currentPost, allPosts, content }: {
        title?: string
        description?: string
        currentPost: LocalPost | undefined
        allPosts: readonly LocalPost[]
        content: string
    },
) => // deno-fmt-disable
html`
        <!DOCTYPE html>
        <html lang="en">
        
        ${head({ title, description })}
        
        <body>
            <div class="sidebar desktop-or-tablet-only">
                <a href="/" class="im-fell-double-pica-sc-regular" style="display: block; padding-top: 0.75em">
                    Brandon Smith
                </a>

                <nav>
                    <a href="/">About me</a>
                    <!-- <a href="#">Talks</a> -->
                    <!-- <a href="#">Photos</a> -->
                    <!-- <a href="#">Music I'm listening to</a> -->

                    <a href="/services">Consulting services</a>
                    <a href="mailto:mail@brandons.me" style="color: var(--accent)">Get in touch</a>
                    
                    <div class="desktop-only">
                        <hr size="1" />
                        <div class="section-heading">writing</div>
                    </div>
                    ${
    writing({ currentPost, allPosts, className: 'desktop-only' })
}
                </nav>
            </div>

            <div class="main-content">
                ${masthead()}

                ${content}
            
                ${footer()}

                <div class="mobile-cta">
                    <span>
                        Available for <a href="/services">consulting</a>
                    </span>
                    <span style="color: var(--rule)">|</span>
                    <a href="mailto:mail@brandons.me">
                        mail@brandons.me
                    </a>
                </div>
            </div>
        </body>
        
        </html> 
    `
