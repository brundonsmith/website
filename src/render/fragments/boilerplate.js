
const { html } = require('../../utils/misc')
const { GITHUB_SVG, LINKEDIN_SVG } = require('./icons')

const head = () => 
    html`
        <head>
            <title>Brandon Smith's Website</title>
            <meta name="Description" content="Personal website of Brandon Smtih">

            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        
            <link rel="stylesheet" type="text/css" href="/css/article.css">
            <link rel="stylesheet" type="text/css" href="/css/base.css">
            <link rel="stylesheet" type="text/css" href="/css/utils.css">
            <link rel="stylesheet" type="text/css" href="/css/variables.css">

            <link rel="stylesheet" type="text/css" href="/css/fragments/icons.css">
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
                    <a href="/" aria-label="Home">Home</a>
                </li>
                <li class="about">
                    <a href="/about" aria-label="About">About</a>
                </li>
                <!--
                <li class="contact">
                    <a href="/contact" aria-label="Contact">Contact</a>
                </li>
                -->

                <div class="flex-spacer"></div>

                <li class="linkedin">
                    <a href="https://www.linkedin.com/in/brandon-smith-9589706b/" target="_blank" rel="noopener" aria-label="LinkedIn">
                        ${LINKEDIN_SVG}
                    </a>
                </li>
                <li class="github">
                    <a href="https://github.com/brundonsmith" target="_blank" rel="noopener" aria-label="Github">
                        ${GITHUB_SVG}
                    </a>
                </li>
            </ul>
        </nav>
    `

const footer = () =>
    html`
        <footer>
            
        </footer>
    `

module.exports = { head, nav, footer }