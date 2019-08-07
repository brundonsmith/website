
const { html } = require('./misc/utils');
const { boilerplate } = require('./fragments/boilerplate')

const fourOhFour = () =>
    boilerplate(html`
        Not found!
    `)

module.exports = { fourOhFour }