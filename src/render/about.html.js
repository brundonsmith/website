
const { html } = require('../utils/misc')
const { head, nav, footer } = require('./fragments/boilerplate')

module.exports = () => Promise.resolve(
    html`
        <!DOCTYPE html>
        <html lang="en">

            ${head()}

            <body>
                <link rel="stylesheet" type="text/css" href="/css/pages/about.css">

                ${nav()}
                
                <div class="main">
                    <img class="me" src="/img/me.jpeg" />

                    <h1>I'm Brandon Smith</h1>
                    <p>
                        Lorem ipsum dolor sit amet, **consectetur** adipiscing elit, sed do eiusmod tempor incididunt 
                        ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
                        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in 
                        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat 
                        non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </div>
                
                ${footer()}
            </body>
        </html>
    `)
