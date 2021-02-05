
const { html } = require('../utils/misc');
const head = require('./fragments/head')
const footer = require('./fragments/footer')

module.exports = () => 
    html`
        <!DOCTYPE html>
        <html lang="en">

            ${head({ title: 'Contact' })}

            <body>                
                <div class="main">

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
    `