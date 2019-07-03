
const { html } = require('./pieces/utils');
const { boilerplate } = require('./pieces/boilerplate')

const contact = () =>
    boilerplate(html`
        <form action="/contact" method="POST">
            <div>
                <label for="responseEmail">Your email:</label>
                <input name="responseEmail" type="email" required>
            </div>
            <div>
                <label for="subject">Subject:</label>
                <input name="subject" type="text" required>
            </div>
            <div>
                <textarea name="message" required placeholder="Message..."></textarea>
            </div>
            <div>
                <button type="submit">
                    Submit
                </button>
            </div>
        </form>
    `)

module.exports = { contact }