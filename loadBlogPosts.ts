import MarkdownIt from 'markdown-it'
// import anchor from 'markdown-it-anchor'
import meta from 'markdown-it-meta'
import prism from 'markdown-it-prism'

const DEV_MODE = Deno.env.get('DEV_MODE')?.toLocaleLowerCase() === 'true'

export const markdownRenderer = new MarkdownIt({
  html: true,
})
// markdownRenderer.use(anchor, {
//   level: 2,
//   permalinkSymbol: '#',
//   permalink: true,
// })
markdownRenderer.use(meta)
markdownRenderer.use(prism)
markdownRenderer.use(unwrapLoneImages)
markdownRenderer.use(openLinksInNewTab)

/** The slice of markdown-it's Token we touch; the package ships no types. */
type Token = {
  type: string
  hidden: boolean
  children?: Token[]
  content: string
  attrGet(name: string): string | null
  attrSet(name: string, value: string): void
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
 * Open links in a new tab, and stop external destinations from learning where
 * the visitor came from or reaching back into this page through
 * `window.opener`.
 *
 * Fragment links are skipped: they jump within the current page, so a new tab
 * would be nonsense. That covers the `#` permalinks `markdown-it-anchor` adds
 * to every heading, which are ordinary link tokens at this point.
 *
 * Raw `<a>` tags written directly in a post arrive as opaque HTML rather than
 * link tokens, so they're rewritten as text.
 */
function openLinksInNewTab(md: MarkdownIt) {
  md.core.ruler.push('links_in_new_tab', (state: { tokens: Token[] }) => {
    const applyToLinks = (tokens: readonly Token[]) =>
      tokens.forEach((token) => {
        if (token.type === 'link_open') {
          const href = token.attrGet('href') ?? ''

          if (!href.startsWith('#') && !isHandoff(href)) {
            token.attrSet('target', '_blank')

            if (isExternal(href)) {
              token.attrSet('rel', 'noopener noreferrer')
            }
          }
        }

        if (token.type === 'html_inline' || token.type === 'html_block') {
          token.content = addAttributesToRawAnchors(token.content)
        }

        if (token.children) {
          applyToLinks(token.children)
        }
      })

    applyToLinks(state.tokens)
  })
}

/**
 * Links are external when they point at another origin, whether they name a
 * scheme ("https://x") or inherit the page's ("//x"). Site-relative paths
 * ("/services") stay internal, so they keep their referrer and don't need the
 * opener guard.
 */
const isExternal = (href: string) =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(href) || href.startsWith('//')

/**
 * Schemes that hand off to another application rather than navigating. A new
 * tab would be opened and then immediately orphaned, so they're left alone.
 */
const isHandoff = (href: string) => /^(mailto|tel|sms):/i.test(href)

/**
 * Add the same attributes to hand-written `<a>` tags. Only opening tags that
 * don't already set `target` are touched, so a post can still opt out by
 * writing the attribute itself.
 */
const addAttributesToRawAnchors = (html: string) =>
  html.replace(/<a\s([^>]*)>/gi, (tag, attrs: string) => {
    const href = attrs.match(/href\s*=\s*["']([^"']*)["']/i)?.[1] ?? ''

    if (
      /\btarget\s*=/i.test(attrs) || href.startsWith('#') || isHandoff(href)
    ) {
      return tag
    }

    const rel = isExternal(href) ? ' rel="noopener noreferrer"' : ''

    return `<a ${attrs.trim()} target="_blank"${rel}>`
  })

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
