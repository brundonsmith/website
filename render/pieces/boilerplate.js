
const { html } = require('./utils')

const head = () => 
    html`
        <head>
            <meta charset="UTF-8">
            <title>My Website</title>
            <link rel="stylesheet" type="text/css" href="/vars.css">
            <link rel="stylesheet" type="text/css" href="/index.css">
            <link rel="stylesheet" type="text/css" href="/nav.css">
        </head>
    `

const nav = () =>
    html`
        <nav>
            <h1 class="title">
                <a href="/">My Website</a>
            </h1>
            
            <ul class="links">
                <li>
                    <a href="/">Home</a>
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
        </nav>
    `

const footer = () =>
    html`
        <footer>

        </footer>
    `

const boilerplate = (body) =>
    html`
        <!DOCTYPE html>
        <html>

            ${head()}

            <body>
                ${nav()}

                ${body}

                ${footer()}
            </body>
        </html>
    `

module.exports = { boilerplate }