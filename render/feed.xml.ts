import { SimplePageProps } from '../loadBlogPosts.ts'
import { BASE_URL } from '../utils/constants.ts'
import { getFirstParagraph } from '../utils/misc.ts'

const description = `
    Code and words enthusiast. Staff-level engineer available for 
    contracting and consulting.`.trim().replaceAll(/[\s\n]+/g, ' ')

/**
 * The site's card image, doubling as each item's artwork. Readers disagree on
 * where to look for an item image, so the same file is offered three ways
 * below; `length` is the file's real size on disk, which `<enclosure>`
 * requires and some readers reject the enclosure without.
 */
const CARD = {
  url: BASE_URL + '/icons/og-image.png',
  type: 'image/png',
  width: 1200,
  height: 630,
  length: Deno.statSync('./static/icons/og-image.png').size,
} as const

/** Square mark, for the channel icon slot and reader sidebars. */
const ICON = {
  url: BASE_URL + '/icons/icon-192.png',
  width: 192,
  height: 192,
} as const

/**
 * Titles and descriptions are prose, and prose contains ampersands and angle
 * brackets that would otherwise close a tag or open an entity. Post bodies go
 * in CDATA instead, so they don't pass through here.
 */
const escapeXML = (str: string) =>
  str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

export default ({ allPosts }: SimplePageProps) =>
  // deno-fmt-ignore
  `
    <?xml version="1.0" encoding="utf-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
        <channel>
            <title>Brandon Smith</title>
            <description>${escapeXML(description)}</description>
            <link>${BASE_URL}</link>
            <atom:link href="${BASE_URL + '/feed.xml'}" rel="self" type="application/rss+xml" />

            <image>
                <url>${ICON.url}</url>
                <title>Brandon Smith</title>
                <link>${BASE_URL}</link>
                <width>${ICON.width}</width>
                <height>${ICON.height}</height>
            </image>
            <itunes:image href="${ICON.url}" />

            ${allPosts.map(post => `
                <item>
                    <title>${escapeXML(post.meta.title)}</title>
                    <link>${BASE_URL + "/blog/" + post.slug}</link>
                    <guid>${BASE_URL + "/blog/" + post.slug}</guid>
                    <pubDate>${post.meta.date.toUTCString()}</pubDate>
                    <description>${escapeXML(getFirstParagraph(post.html) ?? '')}</description>
                    <enclosure url="${CARD.url}" type="${CARD.type}" length="${CARD.length}" />
                    <media:content url="${CARD.url}" medium="image" type="${CARD.type}" width="${CARD.width}" height="${CARD.height}" />
                    <media:thumbnail url="${CARD.url}" width="${CARD.width}" height="${CARD.height}" />
                    <content:encoded><![CDATA[${post.html}]]></content:encoded>
                </item>
            `)
            .join('\n')}
        </channel>
    </rss>`.trim()
