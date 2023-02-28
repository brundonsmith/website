import { extname, resolve } from './deps/path.ts'
import { walk } from './deps/walk.ts'

import loadBlogPosts from "./loadBlogPosts.ts";

// pages
import fourOhFour from './render/404.html.ts'
import about from './render/about.html.ts'
import contact from './render/contact.html.ts'
import index from './render/index.html.ts'
import feed from './render/feed.xml.ts'
import blogPost from './render/blog-post.html.ts'
import CleanCSS from "./deps/clean-css.ts";

const SIMPLE_PAGES = {
    '404': fourOhFour,
    'about': about,
    'contact': contact,
    'index': index,
    'feed.xml': feed
} as const

export const createFileMap = async () => {
    const fileMap = new Map<string, { content: Uint8Array, headers: HeadersInit }>()
    const encoder = new TextEncoder()

    // build CSS bundle
    {
        const CSS_BUNDLE_NAME = '_all.css';

        const cssFiles = await Promise.all(['article.css', 'base.css', 'utils.css', 'variables.css', 'fragments/bio.css',
            'fragments/home-link.css', 'fragments/icons.css',
            'fragments/post-preview.css', 'fragments/prism.css', 'pages/about.css',
            'pages/index.css'].map(async file => {
                if (file !== CSS_BUNDLE_NAME) {
                    const fullPath = resolve(`./static/css`, file)
                    return await Deno.readTextFile(fullPath)
                } else {
                    return ''
                }
            }))

        const allCSS = new CleanCSS().minify(cssFiles.reduce((all, file) => all + '\n' + file, '')).styles
        const allCSSArray = encoder.encode(allCSS)

        fileMap.set('/css/_all.css', {
            content: allCSSArray,
            headers: {
                'Content-Type': CONTENT_TYPES.css,
                'Cache-Control': `max-age=${60 * 60}`
            }
        })
    }

    // other static content
    for await (const file of walk('static')) {
        if (file.isFile) {
            const content = await Deno.readFile(file.path)
            const fileExtension = extname(file.name).substring(1) as keyof typeof CONTENT_TYPES

            fileMap.set(file.path.substring('static'.length), {
                content,
                headers: {
                    'Content-Type': CONTENT_TYPES[fileExtension],
                    'Cache-Control': `max-age=${60 * 60}`
                }
            })
        }
    }

    const posts = await loadBlogPosts()
    const allTags = posts
        .filter(p => !p.meta.test)
        .map(post => post.meta.tags)
        .flat()
        .filter((el, index, arr) => arr.indexOf(el) === index);

    // generate plain pages
    for (const [pageName, render] of Object.entries(SIMPLE_PAGES)) {
        fileMap.set(`/${pageName}`, {
            content: encoder.encode(render({ allTags, posts })),
            headers: {
                'Content-Type': CONTENT_TYPES.html
            }
        })
    }

    // index.html
    fileMap.set('/', {
        content: encoder.encode(index({ allTags, posts })),
        headers: {
            'Content-Type': CONTENT_TYPES.html
        }
    })

    // generate tags pages
    for (const tag of allTags) {
        const file = {
            content: encoder.encode(index({ allTags, posts, tag })),
            headers: {
                'Content-Type': CONTENT_TYPES.html
            }
        }

        fileMap.set(`/tags/${tag}`, file)
        fileMap.set(`/tags/${tag}.html`, file)
    }

    // generate blog post pages
    for (const post of posts) {
        const file = {
            content: encoder.encode(blogPost({ post })),
            headers: {
                'Content-Type': CONTENT_TYPES.html
            }
        }

        fileMap.set(`/blog/${post.slug}`, file)
        fileMap.set(`/blog/${post.slug}.html`, file)
    }

    return fileMap
}

const CONTENT_TYPES = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'js': 'application/javascript; charset=utf-8',
    'xml': 'application/rss+xml; charset=utf-8',
    'png': 'image/png',
    'jpg': 'image/jpg',
    'jpeg': 'image/jpeg',
} as const
