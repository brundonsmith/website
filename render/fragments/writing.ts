import { LocalPost } from '../../loadBlogPosts.ts'
import { formatDate, html } from '../../utils/misc.ts'

export default (
    { currentPost, allPosts, className }: {
        currentPost: LocalPost | undefined
        allPosts: readonly LocalPost[]
        className?: string
    },
) => // deno-fmt-ignore
html`
    <div class="writing ${className}">
        ${allPosts
            .toSorted((a, b) => b.meta.date.valueOf() - a.meta.date.valueOf())
            .map(({ slug, meta }) => html`
                <a href="/blog/${slug}" style="${slug === currentPost?.slug ? 'font-style: italic' : ''}">
                    <span>${meta.title}</span>
                    <span class="leader"></span>
                    <span class="date">${formatDate(meta.date)}</span>
                </a>
            `)}
    </div>
`
