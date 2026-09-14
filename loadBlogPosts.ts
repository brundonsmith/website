import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import meta from 'markdown-it-meta'
import prism from 'markdown-it-prism'

const DEV_MODE = Deno.env.get('DEV_MODE')?.toLocaleLowerCase() === 'true'

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
markdownRenderer.use(unwrapLoneImages)

/** The slice of markdown-it's Token we touch; the package ships no types. */
type Token = {
  type: string
  hidden: boolean
  children?: Token[]
}

/**
 * An image on its own line is still an *inline* token to markdown-it, so it
 * gets wrapped in a paragraph like any other inline content. Block-level
 * images are their own thing here (figures, full-measure), so strip the
 * surrounding `<p>` when a paragraph holds nothing but one image.
 */
function unwrapLoneImages(md: MarkdownIt) {
  md.core.ruler.push('unwrap_lone_images', (state: { tokens: Token[] }) => {
    state.tokens.forEach((token, i) => {
      const isLoneImage = token.type === 'inline' &&
        token.children?.length === 1 &&
        token.children[0]!.type === 'image' &&
        state.tokens[i - 1]?.type === 'paragraph_open' &&
        state.tokens[i + 1]?.type === 'paragraph_close'

      if (isLoneImage) {
        state.tokens[i - 1]!.hidden = true
        state.tokens[i + 1]!.hidden = true
      }
    })
  })
}

/**
 * Load all markdown files from disk and parse them into structured objects
 * with HTML and metadata
 */
const getAllBlogPosts = () =>
  Promise.all(
    [...Deno.readDirSync('./blog')]
      .filter((file) => file.name.includes('.md'))
      .map(readBlogPostFile),
  ).then((allPosts) =>
    allPosts
      .filter((p) => DEV_MODE || !p.meta.test) // filter out test-only posts
      .toSorted((a, b) => b.meta.date.valueOf() - a.meta.date.valueOf())
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
  // `meta` is populated as a side effect of rendering, so it has to be read
  // afterwards
  const html = markdownRenderer.render(md).replaceAll(
    / aria-hidden="true"/gi,
    '',
  )
  const meta = markdownRenderer.meta

  return {
    kind: 'local',
    html,
    meta: { ...meta, date: parseDate(meta.date) },
    slug,
    wordCount: wordCount(md),
  }
}

/**
 * Front matter dates are written like "January 4, 2024". `new Date()` would
 * read that as local midnight, which lands on the previous day once formatted
 * in any negative-UTC-offset zone, so anchor it to midnight UTC instead.
 */
const parseDate = (raw: string): Date => {
  const date = new Date(`${raw} UTC`)

  if (isNaN(date.valueOf())) {
    throw Error(`Failed to parse date from blog post front matter: "${raw}"`)
  }

  return date
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
  url: string
  /** Every tag used across all (non-test) posts. */
  allTags: readonly string[]
  /** All local posts, newest first. */
  allPosts: readonly LocalPost[]
  /** Set on tag-filtered variants of the index page. */
  tag?: string
}

export type Post = LocalPost | ExternalPost

export type LocalPost = {
  kind: 'local'
  html: string
  meta: {
    title: string
    description?: string
    date: Date
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
    date: Date
    tags: readonly string[]
    href: string
    test?: boolean
  }
}

export default getAllBlogPosts
