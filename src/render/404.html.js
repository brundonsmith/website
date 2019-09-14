
const { html } = require('../utils/misc');
const { head, nav, footer } = require('./fragments/boilerplate')

module.exports = () => Promise.resolve(
    html`
        <!DOCTYPE html>
        <html lang="en">

            ${head()}

            <body>
                ${nav()}
                
                <div class="main">
                    Not found!
                </div>
                
                ${footer()}
            </body>
        </html>
    `)
