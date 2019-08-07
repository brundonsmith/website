
const { html } = require('../misc/utils')
const globals = require('../misc/globals')

const stylesheet = (file) => 
    html`<link rel="stylesheet" type="text/css" href="/${file}.css">`

const head = () => 
    html`
        <head>
            <title>${globals.siteTitle}</title>

            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                        
            ${stylesheet('vars')}
            ${stylesheet('tags')}
            ${stylesheet('main')}
            ${stylesheet('nav')}
            ${stylesheet('utils')}
        </head>
    `

const nav = () =>
    html`
        <nav>
            <h1 class="title">
                <a href="/">${globals.siteTitle}</a>
            </h1>
            
            <ul class="links">
                <li>
                    <a href="/about">About Me</a>
                </li>
                <li class="dropdown">
                    <a href="/blog">Blog</a>
                    <ul class="dropdown-contents">
                        <li><a href="/blog/general">General</a></li>
                        <li><a href="/blog/programming">Programming</a></li>
                    </ul>
                </li>
                <li>
                    <a href="/contact">Contact</a>
                </li>
            </ul>

            <div class="flex-spacer"></div>

           <!--<button class="settings-button">
                ⚙

                <dialog open>
                    Hello world!
                </dialog>
            </button>-->

            <input type="color" value="orange">
        </nav>
    `

const footer = () =>
    html`
        <footer>
            <script src="/color.js"></script>
        </footer>
    `

const boilerplate = (body) =>
    html`
        <!DOCTYPE html>
        <html>

            ${head()}

            <body>
                ${nav()}
                
                <div class="main">
                    ${body}
                </div>

                ${footer()}
            </body>
        </html>
    `

module.exports = { boilerplate }