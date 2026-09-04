import { LocalPost } from '../../../loadBlogPosts.ts'
import { html } from '../../../utils/misc.ts'
import footer from '../../fragments/footer.ts'
import head from './head.ts'
import mobileHeading from './mobile-heading.ts'
import nav from './nav.ts'

export default (
    { currentPost, allPosts, content }: {
        currentPost: LocalPost | undefined
        allPosts: readonly LocalPost[]
        content: string
    },
) => // deno-fmt-disable
html`
        <!DOCTYPE html>
        <html lang="en">
        
        ${head({ title: 'About me' })}
        
        <body>
            <div class="desktop-only" style="padding: var(--main-padding); padding-right: 0px">
                ${nav({ currentPost, allPosts })}
            </div>

            <div class="main-content">
                ${content}
            
                ${footer()}
            </div>
        </body>
        
        </html> 
    `
