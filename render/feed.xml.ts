import { LocalPost } from "../loadBlogPosts.ts";
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, BASE_URL } from "../utils/constants.ts";
import { getFirstParagraph } from "../utils/misc.ts";

export default ({ posts }: { posts: readonly LocalPost[] }) => `
    <?xml version="1.0" encoding="utf-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
            <title>${DEFAULT_TITLE}</title>
            <description>${DEFAULT_DESCRIPTION}</description>
            <link>${BASE_URL}</link>
            <atom:link href="${BASE_URL + '/feed.xml'}" rel="self" type="application/rss+xml" />

            ${posts
                .filter(p => !p.meta.test) // filter out test-only posts
                .sort((a, b) => new Date(b.meta.date).valueOf() - new Date(a.meta.date).valueOf())
                .map(post => `
                    <item>
                        <title>${post.meta.title}</title>
                        <link>${BASE_URL + "/blog/" + post.slug}</link>
                        <guid>${BASE_URL + "/blog/" + post.slug}</guid>
                        <pubDate>${new Date(post.meta.date).toUTCString()}</pubDate>
                        <description>${getFirstParagraph(post.html)}</description>
                    </item>
                `)
                .join('\n')}
        </channel>
    </rss>`.trim()