const { html } = require('../../utils/misc')

const { GITHUB_SVG, LINKEDIN_SVG } = require('./icons')

module.exports = () =>
    html`
        <div class="bio">

            <a href="/">
                <img src="/img/me.jpeg" height="100px" />
            </a>

            <p>
                I'm Brandon Smith, a software developer in Austin, Texas. <a href="/about">More about me.</a>
            </p>

            <div>

                <a href="https://www.linkedin.com/in/brandon-smith-9589706b/" target="_blank" rel="noopener" aria-label="LinkedIn">
                    ${LINKEDIN_SVG}
                </a>

                &nbsp;

                <a href="https://github.com/brundonsmith" target="_blank" rel="noopener" aria-label="Github">
                    ${GITHUB_SVG}
                </a>

            </div>
            
        </div>
    `
