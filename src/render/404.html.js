
const { html } = require('../utils/misc');
const { head, nav, footer } = require('./fragments/boilerplate')
const homeLink = require('./fragments/home-link')

module.exports = () => Promise.resolve(
    html`
        <!DOCTYPE html>
        <html lang="en">

            ${head()}

            <body>
                
                <div class="main">
                    ${homeLink()}

                    <h1>Page not found!</h1>
                </div>
                
                ${footer()}
            </body>
        </html>
    `)
