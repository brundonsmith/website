import { LocalPost } from '../../loadBlogPosts.ts'
import { html } from '../../utils/misc.ts'
import footer from '../fragments/footer.ts'
import head from './head.ts'
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
            <div class="sidebar desktop-only" style="">
                ${nav({ currentPost, allPosts })}
            </div>

            <div class="main-content">
                ${content}
            
                ${footer()}
            </div>
        </body>
        
        </html> 
    `
