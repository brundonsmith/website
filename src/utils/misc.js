const pretty = require('pretty') // for those View Source-ers ;)
const ncp = require('ncp').ncp;

const html = (segments, ...inserts) => 
    pretty(segments.map((s, i) => i < segments.length - 1 ? s + inserts[i] : s).join(''))

const given = (val, func) => func(val)

const ncpPromise = (from, to, options = {}) => new Promise(res => ncp(from, to, options, res));

module.exports = { html, given, ncpPromise }