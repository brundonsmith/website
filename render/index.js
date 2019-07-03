
const { html } = require('./pieces/utils');
const { boilerplate } = require('./pieces/boilerplate')

const index = () => 
    boilerplate(html`
        Home!
    `)

module.exports = { index }