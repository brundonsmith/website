
const { html } = require('../utils/misc');
const { head, nav, footer } = require('./fragments/boilerplate')

module.exports = () => Promise.resolve(
    html`
        <!DOCTYPE html>
        <html>

            ${head()}

            <body>
                ${nav()}
                
                <div class="main">
                    <link rel="stylesheet" type="text/css" href="/css/pages/contact.css">

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
                </div>
                
                ${footer()}
            </body>
        </html>
    `)