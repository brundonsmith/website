import { html,capitalize } from "../utils/misc.ts";

import head from './fragments/head.ts'
import footer from './fragments/footer.ts'
import bio from './fragments/bio.ts'
import postPreview from './fragments/post-preview.ts'

import { ExternalPost, LocalPost, Post } from "../loadBlogPosts.ts";
import externalPosts from '../blog/external.json' assert { type: 'json' }

export default ({ allTags, posts, tag }: { allTags: string[], posts: LocalPost[], tag?: string }) =>
    html`
        <!DOCTYPE html>
        <html lang="en">

            ${head({ title: 'Blog' })}

            <body>

                ${bio()}
                
                <main class="main">
                    <div class="tags-container">
                        <span class="tags-label">Tags:</span>
                        <ul class="tags">
                            <li>
                                <a ${tag == null 
                                        ? '' 
                                        : 'href="/index.html"'}>
                                    All
                                </a>

                                &nbsp;|&nbsp;
                            </li>
                            
                            ${allTags
                                .map((t, i) => html`
                                    <li>
                                        <a ${t === tag 
                                                ? '' 
                                                : `href="/tags/${t}.html"`}>
                                            ${capitalize(t)}
                                        </a>
                                        
                                        ${i < allTags.length - 1
                                            ? html`&nbsp;|&nbsp;`
                                            : ``}
                                    </li>
                                `)
                                .join('\n')}
                        </ul>
                    </div>

                    <hr>

                    <ul class="post-list">
                        ${(posts as Post[])
                            .concat(externalPosts as ExternalPost[])
                            .filter(p => !p.meta.test) // filter out test-only posts
                            .filter(p => tag == null || p.meta.tags.includes(tag))
                            .sort((a, b) => new Date(b.meta.date).valueOf() - new Date(a.meta.date).valueOf())
                            .map(post => html`
                                <li>
                                    ${postPreview(post)}
                                </li>
                            `)
                            .join('\n')}
                    </ul>
                </main>
                
                ${footer()}
            </body>
        </html>
    `
