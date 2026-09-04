import { extname, resolve } from '@std/path'
import { walk } from '@std/fs/walk'

import loadBlogPosts from './loadBlogPosts.ts'

// pages
import fourOhFour from './render/404.html.ts'
import about from './render/about.html.ts'
import contact from './render/contact.html.ts'
import index from './render/index.html.ts'
import feed from './render/feed.xml.ts'
import blogPost from './render/blog-post.html.ts'
import blogPostRedesign from './render/redesign/blog-post.html.ts'
import CleanCSS from 'clean-css'
import { ONE_HOUR, ONE_MINUTE } from './utils/misc.ts'
import indexRedesign from './render/redesign/index.html.ts'

const SIMPLE_PAGES = {
  '404': fourOhFour,
  'about': about,
  'contact': contact,
  'index': index,
  'redesign/index': indexRedesign,
  'feed.xml': feed,
} as const

const ONE_MINUTE_S = ONE_MINUTE / 1000
const ONE_HOUR_S = ONE_HOUR / 1000

/** Recursively collect and concatenate every .css file under `dir`. */
const bundleCSS = async (dir: string, skipRedesign: boolean) => {
  const paths: string[] = []

  for await (const file of walk(dir, { exts: ['.css'], includeDirs: false })) {
    // the redesign has its own bundle; don't fold it into the main one
    if (skipRedesign && file.path.includes('/redesign/')) {
      continue
    }
    paths.push(file.path)
  }

  paths.sort((a, b) => a.localeCompare(b))

  const contents = await Promise.all(paths.map((p) => Deno.readTextFile(p)))
  return contents.join('\n')
}

export const createFileMap = async () => {
  const fileMap = new Map<
    string,
    { content: Uint8Array; headers: HeadersInit }
  >()
  const encoder = new TextEncoder()

  // build CSS bundles
  for (
    const { bundleName, dir, skipRedesign } of [
      { bundleName: '_all.css', dir: './static/css', skipRedesign: true },
      {
        bundleName: '_all_redesign.css',
        dir: './static/css/redesign',
        skipRedesign: false,
      },
    ]
  ) {
    const allCSS = new CleanCSS().minify(
      await bundleCSS(dir, skipRedesign),
    ).styles

    fileMap.set('/css/' + bundleName, {
      content: encoder.encode(allCSS),
      headers: {
        'Content-Type': CONTENT_TYPES.css,
        'Cache-Control': `max-age=${ONE_HOUR_S}`,
      },
    })
  }

  // other static content
  for await (const file of walk('static')) {
    if (file.isFile) {
      const content = await Deno.readFile(file.path)
      const fileExtension = extname(file.name).substring(
        1,
      ) as keyof typeof CONTENT_TYPES

      fileMap.set(file.path.substring('static'.length), {
        content,
        headers: {
          'Content-Type': CONTENT_TYPES[fileExtension],
          'Cache-Control': `max-age=${ONE_HOUR_S}`,
        },
      })
    }
  }

  const posts = await loadBlogPosts()
  const allTags = posts
    .filter((p) => !p.meta.test)
    .map((post) => post.meta.tags)
    .flat()
    .filter((el, index, arr) => arr.indexOf(el) === index)

  // generate plain pages
  for (const [pageName, render] of Object.entries(SIMPLE_PAGES)) {
    const fileEntry = {
      content: encoder.encode(
        render({ allTags, posts, currentPost: undefined, allPosts: posts }),
      ),
      headers: {
        'Content-Type': CONTENT_TYPES.html,
        'Cache-Control': `max-age=${ONE_MINUTE_S}`,
      },
    }

    fileMap.set(`/${pageName}`, fileEntry)
    fileMap.set(`/${pageName}.html`, fileEntry)

    if (pageName.endsWith('index')) {
      fileMap.set(
        `/` +
          pageName.substring(0, pageName.length - 'index'.length).replace(
            '/',
            '',
          ), // HACK
        fileEntry,
      )
    }
  }

  // generate tags pages
  for (const tag of allTags) {
    const file = {
      content: encoder.encode(index({ allTags, posts, tag })),
      headers: {
        'Content-Type': CONTENT_TYPES.html,
        'Cache-Control': `max-age=${ONE_MINUTE_S}`,
      },
    }

    fileMap.set(`/tags/${tag}`, file)
    fileMap.set(`/tags/${tag}.html`, file)
  }

  // generate blog post pages
  for (const post of posts) {
    { // legacy blog post page
      const file = {
        content: encoder.encode(blogPost({ post })),
        headers: {
          'Content-Type': CONTENT_TYPES.html,
          'Cache-Control': `max-age=${ONE_MINUTE_S}`,
        },
      }

      fileMap.set(`/blog/${post.slug}`, file)
      fileMap.set(`/blog/${post.slug}.html`, file)
    }

    { // redesign blog post page
      const file = {
        content: encoder.encode(blogPostRedesign({ post, allPosts: posts })),
        headers: {
          'Content-Type': CONTENT_TYPES.html,
          'Cache-Control': `max-age=${ONE_MINUTE_S}`,
        },
      }

      fileMap.set(`/redesign/blog/${post.slug}`, file)
      fileMap.set(`/redesign/blog/${post.slug}.html`, file)
    }
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
  'ico': 'image/x-icon',
  'svg': 'image/svg+xml',
  'webmanifest': 'application/manifest+json',
} as const
