export const html = (segments: TemplateStringsArray, ...inserts: Array<string | number | null | undefined>) =>
    segments
        .map((s, i) =>
            i < segments.length - 1
                ? s + (inserts[i] == null ? '' : inserts[i]) // fallback to empty string so null/undefined don't appear in the markup
                : s)
        .join('')
        .trim()

export const given = <T, R>(val: T | undefined, func: (val: T) => R): R | undefined =>
    val != null
        ? func(val)
        : undefined;

export const log = <T>(val: T): T => {
    console.log(val);
    return val;
}


const FIRST_PARAGRAPH_EXPRESSION = /<p>((?:.|[\r\n])*?)<\/p>/im;
const TAGS_EXPRESSION = /<\/?[^>]+>/ig;

export const getFirstParagraph = (html: string) =>
    given(new RegExp(FIRST_PARAGRAPH_EXPRESSION).exec(html), result =>
        given(result?.[1], blurb =>
            blurb.trim().replace(new RegExp(TAGS_EXPRESSION), '')))

export const capitalize = (str: string) =>
    str === ''
        ? ''
        : str[0].toUpperCase() + str.substring(1)
