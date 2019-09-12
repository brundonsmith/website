
const { html } = require('../../utils/misc')

const head = () => 
    html`
        <head>
            <title>Brandon Smith's Website</title>

            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                        
            <link rel="stylesheet" type="text/css" href="/css/base.css">
            <link rel="stylesheet" type="text/css" href="/css/utils.css">
            <link rel="stylesheet" type="text/css" href="/css/variables.css">

            <link rel="stylesheet" type="text/css" href="/css/fragments/nav.css">
            <link rel="stylesheet" type="text/css" href="/css/fragments/post-preview.css">
            <link rel="stylesheet" type="text/css" href="/css/fragments/prism.css">
        </head>
    `

const nav = () =>
    html`
        <nav>
            <ul class="links">
                <li class="home">
                    <a href="/">Home</a>
                </li>
                <li class="about">
                    <a href="/about">About</a>
                </li>
                <li class="contact">
                    <a href="/contact">Contact</a>
                </li>
            </ul>

            <div class="flex-spacer"></div>

            <!-- TODO: Name/profile links -->
        </nav>
    `

const footer = () =>
    html`
        <footer>
            
        </footer>
    `

module.exports = { head, nav, footer }