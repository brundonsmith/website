
const { html } = require('../utils/misc');
const head = require('./fragments/head')
const footer = require('./fragments/footer')
const homeLink = require('./fragments/home-link')

module.exports = () => 
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
