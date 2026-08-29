import { LocalPost } from '../../../loadBlogPosts.ts'
import { html } from '../../../utils/misc.ts'

export default (
    { post, posts }: { post: LocalPost; posts: readonly LocalPost[] },
) => // deno-fmt-ignore
html`
        <nav>
            <div class="im-fell-double-pica-sc-regular" style="margin-top: 0.75em">
                Brandon Smith
            </div>
            <hr />
            <a href="#">Home</a>
            <a href="#">About me</a>
            <a href="#">Talks</a>
            <a href="#">Photos</a>

            <hr size="1" />
            <div class="section-heading">services</div>

            <a href="#">Contracting</a>
            <a style="color: var(--accent)" href="#">Get in touch</a>

            <hr size="1" />
            <div class="section-heading">writing</div>

            ${posts
                .toSorted((a, b) => new Date(b.meta.date).valueOf() - new Date(a.meta.date).valueOf())
                .map(({ slug, meta }) => html`
                    <a href="/redesign/blog/${slug}" style="${slug === post.slug ? 'font-style: italic' : ''}">
                        <span>${meta.title}</span>
                        <span class="leader"></span>
                        <span>${meta.date}</span>
                    </a>
                `)}
        </nav>
    `
