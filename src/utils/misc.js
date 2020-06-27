const pretty = require('pretty') // for those View Source-ers ;)

const html = (segments, ...inserts) => 
    pretty(segments
        .map((s, i) => 
            i < segments.length - 1 
                ? s + (inserts[i] == null ? '' : inserts[i]) // fallback to empty string so null/undefined don't appear in the markup
                : s)
        .join(''));

const given = (val, func) =>
    val != null
        ? func(val)
        : val;

const log = (val) => {
    console.log(val);
    return val;
}

module.exports = { html, given, log }