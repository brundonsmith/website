import { html } from "../utils/misc.ts"
import head from './fragments/head.ts'
import homeLink from './fragments/home-link.ts'
import footer from './fragments/footer.ts'

export default () =>
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
