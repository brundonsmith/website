
const { html } = require('../utils/misc')
const { head, nav, footer } = require('./fragments/boilerplate')
const homeLink = require('./fragments/home-link')

module.exports = () => Promise.resolve(
    html`
        <!DOCTYPE html>
        <html lang="en">

            ${head()}

            <body>
                <link rel="stylesheet" type="text/css" href="/css/pages/about.css">
                
                <article class="main">
                    ${homeLink()}
                    
                    <img class="me" src="/img/me.jpeg" height="176px" alt="Me" />

                    <h1>I'm Brandon Smith</h1>
                    <p>
                        As a programmer I'm 
                        <a href="https://josephg.com/blog/3-tribes/" target="_blank" rel="noopener">equal parts type 1 and type 3</a>.
                        Professionally I'm a web developer; at home I dabble in mostly game and 
                        <a href="https://github.com/brundonsmith/raytracer" target="_blank" rel="noopener">graphics programming</a>.
                    </p>
                    <p>
                        This is my semi-professional blog for thoughts on programming, but also on life and whatever 
                        else. It's also a chance to do things I don't get to do so much at work like lean on HTML itself instead 
                        of JavaScript components, and run my own totally custom web server. I may also host some projects on here
                        some day.
                    </p>
                </article>
                
                ${footer()}
            </body>
        </html>
    `)
