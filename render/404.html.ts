import { html } from '../utils/misc.ts'
import head from './fragments/head.ts'
import homeLink from './fragments/home-link.ts'
import footer from './fragments/footer.ts'
import { SimplePageProps } from '../loadBlogPosts.ts'

export default (_props: SimplePageProps) =>
    // deno-fmt-ignore
    html`
        <!DOCTYPE html>
        <html lang="en">
        
        ${head({ title: 'Page not found' })}
        
        <body>
        
            <main class="main">
                ${homeLink()}
        
                <h1>Page not found!</h1>
            </main>
        
            ${footer()}
        </body>
        
        </html>
    `
