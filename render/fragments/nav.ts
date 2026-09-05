import { LocalPost } from '../../loadBlogPosts.ts'
import { html } from '../../utils/misc.ts'
import writing from './writing.ts'

export default (
    { currentPost, allPosts, className, writingClassName }: {
        currentPost: LocalPost | undefined
        allPosts: readonly LocalPost[]
        className?: string
        writingClassName?: string
    },
) => // deno-fmt-ignore
html`
    <nav class="${className}">
        <a href="/">About me</a>
        <!-- <a href="#">Talks</a> -->
        <!-- <a href="#">Photos</a> -->
        <!-- <a href="#">Music I'm listening to</a> -->

        <hr size="1" />
        <div class="section-heading">services</div>

        <a href="/services">Contracting</a>
        <a href="/contact" style="color: var(--accent)">Get in touch</a>
        
        <div class="desktop-only">
            <hr size="1" />
            <div class="section-heading">writing</div>
        </div>
        ${writing({ currentPost, allPosts, className: writingClassName })}
    </nav>
`
