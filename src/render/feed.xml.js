const path = require('path')

const { DEFAULT_TITLE, DEFAULT_DESCRIPTION, URL } = require('../utils/constants')
const { getFirstParagraph } = require('../utils/misc')

const FEED_HREF = '/' + path.basename(__filename, '.js')

module.exports = ({ posts }) => `
    <?xml version="1.0" encoding="utf-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
            <title>${DEFAULT_TITLE}</title>
            <description>${DEFAULT_DESCRIPTION}</description>
            <link>${URL}</link>
            <atom:link href="${URL + FEED_HREF}" rel="self" type="application/rss+xml" />

            ${posts
                .filter(p => !p.meta.test) // filter out test-only posts
                .sort((a, b) => new Date(b.meta.date).valueOf() - new Date(a.meta.date).valueOf())
                .map(post => `
                    <item>
                        <title>${post.meta.title}</title>
                        <link>${URL + "/blog/" + post.slug}</link>
                        <guid>${URL + "/blog/" + post.slug}</guid>
                        <pubDate>${new Date(post.meta.date).toUTCString()}</pubDate>
                        <description>${getFirstParagraph(post.html)}</description>
                    </item>
                `)
                .join('\n')}
        </channel>
    </rss>`.trim()