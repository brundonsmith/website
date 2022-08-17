
const { html } = require('../utils/misc')
const head = require('./fragments/head')
const footer = require('./fragments/footer')
const { GITHUB_SVG, LINKEDIN_SVG, PRINTER_SVG, LINK_SVG } = require('./fragments/icons')
const { BASE_URL, DOMAIN } = require('../utils/constants')

const formattedPhone = (phone) =>
    phone 
        ? `(${phone.substr(0, 3)}) ${phone.substr(3, 3)}-${phone.substr(6, 4)}` 
        : `(XXX) XXX-XXXX`

module.exports = () => 
    html`
        <!DOCTYPE html>
        <html lang="en">

            ${head()}

            <body>
                <link rel="stylesheet" type="text/css" href="/css/pages/resume.css">

                <div class="resume">

                    <button class="print-button" onclick="window.print()">
                        ${PRINTER_SVG}
                        &nbsp;
                        Print this document
                    </button>

                    <div class="bullets">
                        <h3>The bullet points</h3>

                        <h4>Experience:</h4>
                        <ul class="experience-list">
                            <li>
                                <u>Self Financial</u>, worked on public-facing web app; focused on library-creation, tech-choices/foundational maintenance, best-practices<u>(2021-present)</u>
                                <br>
                                <span style="opacity:0.8">
                                    Using: TypeScript, React, Next.js, Node.js, GraphQL
                                </span>
                            </li>
                            <li>
                                <u>Marginal Unit</u>, worked on tooling suite for energy-market traders<u>(2020-2021)</u>
                                <br>
                                <span style="opacity:0.8">
                                    Using: Electron, D3, RxJS, Python/Flask, MySQL
                                </span>
                            </li>
                            <li>
                                <u>Cycorp</u>, architected collection of React-based dev tools for symbolic AI system <u>(2016-2020)</u>
                                <br>
                                <span style="opacity:0.8">
                                    Using: React, TypeScript, MobX, Webpack/Babel
                                </span>
                            </li>
                            <li>
                                <u>Freelanced</u>, built a website for a local business and did contract work <u>(2016)</u>
                                <br>
                                <span style="opacity:0.8">
                                    Used: Node.js, MongoDB
                                </span>
                            </li>
                            <li>
                                <u>Broadleaf Commerce</u>, worked on Java e-commerce framework <u>(2014-2016)</u>
                                <br>
                                <span style="opacity:0.8">
                                    Used: Java/Spring, MySQL, jQuery
                                </span>
                            </li>
                            <li>
                                B.S. in Computer Science from <u>Baylor University (2014)</u>
                                <br>
                                <span style="opacity:0.8">
                                    Used: C++, Java, Python, MySQL, PHP, Node.js, Angular 1.0
                                </span>
                            </li>
                        </ul>

                        <h4>Major skills:</h4>
                        <div class="skills">
                            <span>Rust,</span>
                            <span>JavaScript/TypeScript,</span>
                            <span>Node,</span>
                            <span>React,</span>
                            <span>SQL</span>
                        </div>

                        <h4>Links:</h4>
                        <div>
                            ${LINK_SVG}
                            &nbsp;
                            <a href="${BASE_URL}" target="_blank">
                                ${DOMAIN}
                            </a>
                        </div>
                        <div>
                            ${GITHUB_SVG}
                            &nbsp;
                            <a href="https://github.com/brundonsmith" target="_blank">
                                github.com/brundonsmith
                            </a>
                        </div>
                        <div>
                            ${LINKEDIN_SVG}
                            &nbsp;
                            <a href="https://www.linkedin.com/in/brandon-smith-9589706b/" target="_blank">
                                linkedin.com/in/brandon-smith-9589706b/
                            </a>
                        </div>

                        <h4>Contact info:</h4>
                        <div>
                            Email: <a href="mailto:${process.env.EMAIL}">${process.env.EMAIL}</a>
                        </div>
                        <div>
                            Tel: <a href="tel:+1${process.env.PHONE}">${formattedPhone(process.env.PHONE)}</a>
                        </div>

                    </div>
                    <div class="main">

                        <img class="me" src="/img/me.jpeg" />

                        <h1>Brandon Smith</h1>
                        <p>
                            I'm a passionate programmer who writes code that's meant to be read. 
                            I value communication, whether it comes to expressing ideas or resolving conflict, 
                            and I never get tired of learning new things and taking on challenging new classes 
                            of problems.
                        </p>

                        <div class="blurbs">
                            <div class="blurb">
                                <h2>Thoughtful</h2>
                                <p>
                                    When I write code, I consider all the ways it might be used or
                                    misused. I see any API I expose as a user-interface for other programmers,
                                    with myself as the designer. I value simplicity everywhere it's possible, and 
                                    disambiguity where it isn't.
                                </p>
                            </div>
                            <div class="blurb">
                                <h2>Engineer</h2>
                                <p>
                                    I'm always trying to learn new things and grow in my craft. In 
                                    my spare time I like to work on programming language-related projects (among other things); programming
                                    languages are one of the major points
                                    where human ideas and computer ideas are bridged, and I've always 
                                    been drawn to that relationship. I find that exposing myself to many
                                    different programming languages has a way of reshaping my thinking, teaching me 
                                    concepts that I can integrate back into whatever else I'm working on.
                                </p>
                            </div>
                            <div class="blurb">
                                <h2>Communicator</h2>
                                <p>
                                    I've been told I'm good at explaining things. I have an instinct for 
                                    putting myself in others' frames of mind and bridging the gap of understanding from point A to point B.
                                    This manifests in my conversations and documentation, but also in my code:
                                    will my peers interpret the name of this function differently than intended?
                                    How can I ensure against that?
                                </p>
                            </div>
                            <div class="blurb">
                                <h2>Systematic</h2>
                                <p>
                                    I like to understand the whole system. If there isn't a firm abstraction boundary
                                    (and sometimes even when there is), I want to know everything that might happen in
                                    all corners so that I can make decisions from a holistic perspective. This motivates me to learn
                                    about different layers of the stack, even the ones I won't often touch directly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                ${footer()}
            </body>
        </html>
    `
