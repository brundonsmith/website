import { dirname, extname, relative } from '@std/path'
import { walk } from '@std/fs/walk'

import loadBlogPosts from './loadBlogPosts.ts'

// pages
import index from './render/index.html.ts'
import blogPost from './render/blog-post.ts'
import CleanCSS from 'clean-css'
import { ONE_HOUR, ONE_MINUTE } from './utils/misc.ts'
import type { SimplePageProps } from './loadBlogPosts.ts'

type SimplePage = (props: SimplePageProps) => string

/**
 * Find every page module under render/ and import it. A page's URL is its path
 * relative to render/, minus the `.ts`; `index.html` additionally serves at its
 * containing directory.
 */
const loadSimplePages = async () => {
  const pages: {
    urls: string[]
    render: SimplePage
    contentType: string
  }[] = []

  for await (
    const file of walk('render', {
      exts: ['.html.ts', '.xml.ts'],
      includeDirs: false,
    })
  ) {
    const path = relative('render', file.path).replace(/\.ts$/, '')
    const module = await import(`./${file.path}`)
    const render: SimplePage = module.default

    const urls = new Set([
      '/' + path,
      '/' + path.replace(/\.html$/, ''),
    ])

    if (path.endsWith('index.html')) {
      urls.add('/' + (dirname(path) === '.' ? '' : dirname(path)))
    }

    const contentType = path.endsWith('.xml')
      ? CONTENT_TYPES.xml
      : CONTENT_TYPES.html

    pages.push({ urls: [...urls], render, contentType })
  }

  return pages
}

const ONE_MINUTE_S = ONE_MINUTE / 1000
const ONE_HOUR_S = ONE_HOUR / 1000

/** Recursively collect and concatenate every .css file under `dir`. */
const bundleCSS = async (dir: string) => {
  const paths: string[] = []

  for await (const file of walk(dir, { exts: ['.css'], includeDirs: false })) {
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
  const bundleName = '_all.css'
  const dir = './static/css'
  const allCSS = new CleanCSS().minify(
    await bundleCSS(dir),
  ).styles

  fileMap.set('/css/' + bundleName, {
    content: encoder.encode(allCSS),
    headers: {
      'Content-Type': CONTENT_TYPES.css,
      'Cache-Control': `max-age=${ONE_HOUR_S}`,
    },
  })

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
  for (const { urls, render, contentType } of await loadSimplePages()) {
    const fileEntry = {
      content: encoder.encode(render({ allTags, allPosts: posts })),
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `max-age=${ONE_MINUTE_S}`,
      },
    }

    for (const url of urls) {
      fileMap.set(url, fileEntry)
    }
  }

  // generate tags pages
  for (const tag of allTags) {
    const file = {
      content: encoder.encode(index({ allTags, allPosts: posts, tag })),
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
    const file = {
      content: encoder.encode(blogPost({ post, allPosts: posts })),
      headers: {
        'Content-Type': CONTENT_TYPES.html,
        'Cache-Control': `max-age=${ONE_MINUTE_S}`,
      },
    }

    fileMap.set(`/redesign/blog/${post.slug}`, file)
    fileMap.set(`/redesign/blog/${post.slug}.html`, file)
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
