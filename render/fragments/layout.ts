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
            <div class="sidebar desktop-or-tablet-only">
                <a class="im-fell-double-pica-sc-regular" href="/">
                    Brandon Smith
                </a>
                ${
    nav({ currentPost, allPosts, writingClassName: 'desktop-only' })
}
            </div>

            <div class="main-content">
                ${content}
            
                ${footer()}
            </div>
        </body>
        
        </html> 
    `
