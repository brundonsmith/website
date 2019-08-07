
const { html } = require('./misc/utils');
const { boilerplate } = require('./fragments/boilerplate')

const index = () => 
    boilerplate(html`
        Home!
    `)

module.exports = { index }