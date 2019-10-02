
const { html } = require('../../utils/misc')

module.exports = () =>
    html`
        <div class="home-link">
            <a href="/" aria-label="Home">
                ← All Posts
            </a>
        </div>
    `