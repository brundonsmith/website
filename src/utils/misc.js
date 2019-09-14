const pretty = require('pretty') // for those View Source-ers ;)

const html = (segments, ...inserts) => 
    pretty(segments.map((s, i) => i < segments.length - 1 ? s + inserts[i] : s).join(''))

const given = (val, func) => func(val)

module.exports = { html, given }