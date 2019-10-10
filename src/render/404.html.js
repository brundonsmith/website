
const { html } = require('../utils/misc');
const head = require('./fragments/head')
const footer = require('./fragments/footer')
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
