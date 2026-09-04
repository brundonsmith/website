import { LocalPost } from '../../loadBlogPosts.ts'
import { html } from '../../utils/misc.ts'
import writing from './writing.ts'

export default (
    { currentPost, allPosts, className }: {
        currentPost: LocalPost | undefined
        allPosts: readonly LocalPost[]
        className?: string
    },
) => // deno-fmt-ignore
html`
    <nav class="${className}">
        <a class="im-fell-double-pica-sc-regular" href="/">
            Brandon Smith
        </a>
        <a href="/">About me</a>
        <a href="#">Talks</a>
        <a href="#">Photos</a>

        <hr size="1" />
        <div class="section-heading">services</div>

        <a href="#">Contracting</a>
        <a style="color: var(--accent)" href="#">Get in touch</a>
        
        <div class="desktop-only">
            <hr size="1" />
            <div class="section-heading">writing</div>
        </div>
        ${writing({ currentPost, allPosts, className: 'desktop-only' })}
    </nav>
`
