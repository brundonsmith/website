
const { html } = require('../utils/misc');
const { head, nav, footer } = require('./fragments/boilerplate')
const homeLink = require('./fragments/home-link')

module.exports = () => Promise.resolve(
    html`
        <!DOCTYPE html>
        <html lang="en">

            ${head()}

            <body>
                ${homeLink()}
                
                <div class="main">
                    Not found!
                </div>
                
                ${footer()}
            </body>
        </html>
    `)
