const { html } = require('../../utils/misc')

const { GITHUB_SVG, LINKEDIN_SVG } = require('./icons')

module.exports = () =>
    html`
        <div class="bio">

            <a href="/" aria-label="Home">
                <img src="/img/me.jpeg" height="100px" alt="Me" />
            </a>

            <p>
                I'm Brandon Smith, a programmer in Austin, Texas. <a href="/about" aria-label="About me">More about me.</a>
            </p>

            <div>

                <a class="icon-link" href="https://www.linkedin.com/in/brandon-smith-9589706b/" target="_blank" rel="noopener" aria-label="LinkedIn">
                    ${LINKEDIN_SVG}
                </a>

                &nbsp;

                <a class="icon-link" href="https://github.com/brundonsmith" target="_blank" rel="noopener" aria-label="Github">
                    ${GITHUB_SVG}
                </a>

            </div>
            
        </div>
    `
