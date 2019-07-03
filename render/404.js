
const { html } = require('./pieces/utils');
const { boilerplate } = require('./pieces/boilerplate')

const fourOhFour = () =>
    boilerplate(html`
        Not found!
    `)

module.exports = { fourOhFour }