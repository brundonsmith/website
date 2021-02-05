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


const FIRST_PARAGRAPH_EXPRESSION = /<p>((?:.|[\r\n])*?)<\/p>/im;
const TAGS_EXPRESSION = /<\/?[^>]+>/ig;

const getFirstParagraph = (html) =>
    given(new RegExp(FIRST_PARAGRAPH_EXPRESSION).exec(html), result => 
    given(result[1], blurb => 
        blurb.trim().replace(new RegExp(TAGS_EXPRESSION), '')))

const capitalize = (str) =>
    str === ''
        ? ''
        : str[0].toUpperCase() + str.substr(1)

module.exports = { html, given, log, getFirstParagraph, capitalize }