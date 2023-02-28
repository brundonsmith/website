
import { Post } from "../../loadBlogPosts.ts";
import { html } from "../../utils/misc.ts"
import author from "./author.ts"

export default (post: Post) => 
    html`
        <a class="post-preview" 
                href="${post.kind === 'external' ? post.meta.href : `/blog/${post.slug}`}" 
                target="${post.kind === 'external' ? '_blank' : ''}" 
                rel="${post.kind === 'external' ? 'noopener' : ''}"
                aria-label="${post.meta.title}" 
                itemscope 
                itemtype="http://schema.org/Article">
        
            <span itemProp="headline">
                ${post.meta.title}
            </span>

            &nbsp;
            &nbsp;

            <div class="flex-spacer"></div>

            <div class="details">
                ${author()}

                <time datetime="${post.meta.date}" itemProp="datePublished">
                    ${post.meta.date}
                </time>

                ${post.kind === 'local' ? 
                    html`<div class="read-length">
                            ${Math.max(Math.round(post.wordCount / 200), 1)} minute read
                            <span style="display:none" itemProp="wordCount">${post.wordCount}</span>
                        </div>`
                : ''}

                ${post.kind === 'external' ?
                    html`
                        <div class="external-site">
                            ${/\/\/([a-z0-9\-]+\.[a-z]+)\//i.exec(post.meta.href)?.[1]}
                        </div>
                    `
                : ''}
            </div>
        </a>
    `