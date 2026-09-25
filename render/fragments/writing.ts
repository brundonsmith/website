import { LocalPost } from '../../loadBlogPosts.ts'
import { formatDate, html } from '../../utils/misc.ts'

export default (
  { url, allPosts, className }: {
    url: string
    allPosts: readonly LocalPost[]
    className?: string
  },
) =>
  // deno-fmt-ignore
  html`
    <div class="writing ${className}">
        ${allPosts.map(({ slug, meta }) => html`
            <a href="/blog/${slug}" class="${url === `/blog/${slug}` ? 'current' : ''}">
                <span>${meta.title}</span>
                <span class="leader"></span>
                <span class="date">${formatDate(meta.date)}</span>
            </a>
        `)}
    </div>
`
