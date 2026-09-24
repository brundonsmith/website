import { SimplePageProps } from '../loadBlogPosts.ts'
import { BASE_URL } from '../utils/constants.ts'
import { getFirstParagraph } from '../utils/misc.ts'

const description = `
    Code and words enthusiast. Staff-level engineer available for 
    contracting and consulting.`.trim().replaceAll(/[\s\n]+/g, ' ')

/**
 * The feed icon, declared through RSS 2.0's channel-level `<image>`.
 * Per-row artwork in readers comes from the site favicon or from a post's
 * own first inline image, never from item-level tags, so there is
 * deliberately no `<enclosure>` or `media:*` here: readers treat those as
 * attached article media and render them as a hero above the post.
 */
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
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
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

            ${allPosts.map(post => `
                <item>
                    <title>${escapeXML(post.meta.title)}</title>
                    <link>${BASE_URL + "/blog/" + post.slug}</link>
                    <guid>${BASE_URL + "/blog/" + post.slug}</guid>
                    <pubDate>${post.meta.date.toUTCString()}</pubDate>
                    <description>${escapeXML(getFirstParagraph(post.html) ?? '')}</description>
                    <content:encoded><![CDATA[${post.html}]]></content:encoded>
                </item>
            `)
            .join('\n')}
        </channel>
    </rss>`.trim()
