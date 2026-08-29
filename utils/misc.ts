/**
 * Template string tag that does almost nothing. Exists to trigger syntax
 * highlighting via the lit-html editor plugin.
 */
export const html = (
  segments: TemplateStringsArray,
  ...inserts: Array<string[] | string | number | null | undefined>
) =>
  segments
    .map((s, i) =>
      i < segments.length - 1
        ? s + (inserts[i] == null
          ? '' // fallback to empty string so null/undefined don't appear in the markup
          : Array.isArray(inserts[i])
          ? inserts[i].join('\n')
          : inserts[i])
        : s
    )
    .join('')
    .trim()

export const log = <T>(val: T): T => {
  console.log(val)
  return val
}

const FIRST_PARAGRAPH_EXPRESSION = /<p>((?:.|[\r\n])*?)<\/p>/im
const TAGS_EXPRESSION = /<\/?[^>]+>/ig

export const getFirstParagraph = (html: string) =>
  new RegExp(FIRST_PARAGRAPH_EXPRESSION).exec(html)?.[1]?.trim().replace(
    new RegExp(TAGS_EXPRESSION),
    '',
  )

export const capitalize = (str: string) =>
  str === '' ? '' : str[0]?.toUpperCase() + str.substring(1)

export const ONE_MINUTE = 60 * 1000
export const ONE_HOUR = 60 * ONE_MINUTE
export const ONE_DAY = 24 * ONE_HOUR
export const ONE_MONTH = 30 * ONE_DAY
export const ONE_YEAR = 365 * ONE_DAY
