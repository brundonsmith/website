
const { html } = require('../utils/misc')
const { head, nav, footer } = require('./fragments/boilerplate')

module.exports = () => Promise.resolve(
    html`
        <!DOCTYPE html>
        <html>

            ${head()}

            <body>
                ${nav()}
                
                <div class="main">
                    
                </div>
                
                ${footer()}
            </body>
        </html>
    `)
