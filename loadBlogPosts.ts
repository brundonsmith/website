import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import meta from 'markdown-it-meta'
import prism from 'markdown-it-prism'

export const markdownRenderer = new MarkdownIt({
  html: true,
})
markdownRenderer.use(anchor, {
  level: 2,
  permalinkSymbol: '#',
  permalink: true,
})
markdownRenderer.use(meta)
markdownRenderer.use(prism)

/**
 * Load all markdown files from disk and parse them into structured objects
 * with HTML and metadata
 */
const getAllBlogPosts = () =>
  Promise.all(
    [...Deno.readDirSync('./blog')]
      .filter((file) => file.name.includes('.md'))
      .map(readBlogPostFile),
  )

/**
 * Load one markdown file from disk and parse it
 */
const readBlogPostFile = (file: Deno.DirEntry) =>
  Deno.readTextFile(`./blog/${file.name}`)
    .then((md) => markdownToBlogPost(file.name.split('.')[0]!, md))

/**
 * Parse the markdown string + slug into a structured object with HTML and
 * metadata
 */
const markdownToBlogPost = (slug: string, md: string): LocalPost => {
  return {
    kind: 'local',
    html: markdownRenderer.render(md).replaceAll(/ aria-hidden="true"/gi, ''),
    meta: markdownRenderer.meta,
    slug,
    wordCount: wordCount(md),
  }
}

/**
 * Guesstimate the number of words in a post
 */
const wordCount = (str: string) => str.split(/[\W]+/gi).length

/**
 * The full set of props any simple page might need. Every page receives all of
 * them and destructures the ones it cares about, so the loader doesn't have to
 * know which page wants what.
 */
export type SimplePageProps = {
  /** Every tag used across all (non-test) posts. */
  allTags: readonly string[]
  /** All local posts, newest first. */
  allPosts: readonly LocalPost[]
  /** Set on tag-filtered variants of the index page. */
  tag?: string
  /** Set when a page is rendered in the context of one post. */
  currentPost?: LocalPost
}

export type Post = LocalPost | ExternalPost

export type LocalPost = {
  kind: 'local'
  html: string
  meta: {
    title: string
    description?: string
    date: string
    tags: readonly string[]
    test?: boolean
  }
  slug: string
  wordCount: number
}

export type ExternalPost = {
  kind: 'external'
  meta: {
    title: string
    date: string
    tags: readonly string[]
    href: string
    test?: boolean
  }
}

export default getAllBlogPosts
