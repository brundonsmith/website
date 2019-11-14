
const { html } = require('../utils/misc')
const head = require('./fragments/head')
const footer = require('./fragments/footer')
const { GITHUB_SVG, LINKEDIN_SVG, PRINTER_SVG, LINK_SVG } = require('./fragments/icons')

const formattedPhone = (phone) =>
    phone 
        ? `(${phone.substr(0, 3)}) ${phone.substr(3, 3)}-${phone.substr(6, 4)}` 
        : `(XXX) XXX-XXXX`

module.exports = () => Promise.resolve(
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
                                B.S. in Computer Science from <u>Baylor University (2014)</u>
                                <br>
                                <span style="opacity:0.8">
                                    Used: C++, Java, Python, MySQL, PHP, NodeJS, Angular 1.0
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
                                <u>Freelanced</u>, built a website for a local business and did contract work <u>(2016)</u>
                                <br>
                                <span style="opacity:0.8">
                                    Used: NodeJS, MongoDB, Angular
                                </span>
                            </li>
                            <li>
                                <u>Cycorp</u>, architected collection of React-based dev tools for symbolic AI system <u>(2016-present)</u>
                                <br>
                                <span style="opacity:0.8">
                                    Using: React, TypeScript, MobX, Webpack/Babel
                                </span>
                            </li>
                        </ul>

                        <h4>Major skills:</h4>
                        <ul>
                            <li>JavaScript/TypeScript</li>
                            <li>Node</li>
                            <li>React</li>
                            <li>Rust</li>
                            <li>git</li>
                            <li>SQL</li>
                        </ul>

                        <h4>Links:</h4>
                        <div>
                            ${LINK_SVG}
                            &nbsp;
                            <a href="http://www.brandonsmith.ninja" target="_blank">
                                www.brandonsmith.ninja
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
                            I'm a passionate programmer who writes code that people will be able to read later. 
                            I'm a strong communicator, whether it comes to expressing ideas or resolving conflict, 
                            and I never get tired of learning new things and taking on challenging new classes 
                            of problems.
                        </p>

                        <div class="blurbs">
                            <div class="blurb">
                                <h2>Thoughtful</h2>
                                <p>
                                    At Cycorp I'm the technical lead on our React codebase. Over the years I've made 
                                    decisions about which frameworks to use and how to organize our shared code, as 
                                    well as providing leadership on code conventions and architecture. As part of my 
                                    role I periodically give talks to the team about best practices - in terms 
                                    of both maintainability and performance - and demonstrate utility code that I've 
                                    written to simplify common problems we run into as an organization.
                                </p>
                            </div>
                            <div class="blurb">
                                <h2>Communicator</h2>
                                <p>
                                    One of my strongsuits is explaining complex technical ideas in whichever terms 
                                    another person has the background to understand. I'm able to communicate clearly with 
                                    clients/product owners about requirements, technical limitations, or problems. 
                                    When presented with a request for a feature I work with the other party to 
                                    understand the heart of the issue, often making counter-suggestions that may better fit the 
                                    technical context or may even suit the person's needs better than their original suggestion.
                                </p>
                            </div>
                            <div class="blurb">
                                <h2>Engineer</h2>
                                <p>
                                    I'm always seeking to learn new things and grow in my craft. Most recently in my spare time I've 
                                    been writing a raytracing renderer in Rust, as a way of learning both the language and a new 
                                    programming domain. I find that diversifying my language knowledge has a way of shaping my 
                                    thinking and giving me concepts that I can integrate back into what I do at work.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                ${footer()}
            </body>
        </html>
    `)
