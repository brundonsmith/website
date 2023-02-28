// import { defaultParsers, marky } from './deps/marky.ts'
// import { given } from './utils/misc.ts'

// const parsers = defaultParsers

import { MarkdownIt, meta, prism, anchor } from './deps/markdown-it.ts'

const markdownRenderer = new MarkdownIt({
    html: true,
})
markdownRenderer.use(anchor, {
    level: 2,
    permalinkSymbol: '#',
    permalink: true,
})
markdownRenderer.use(meta)
markdownRenderer.use(prism)

const getAllBlogPosts = () =>
    Promise.all([...Deno.readDirSync('./blog')]
        .filter(file => file.name.includes('.md'))
        .map(readBlogPostFile))

const readBlogPostFile = (file: Deno.DirEntry) =>
    Deno.readTextFile(`./blog/${file.name}`)
        .then(md => markdownToBlogPost(file.name.split('.')[0], md))

const markdownToBlogPost = (slug: string, md: string): LocalPost => {
    return {
        kind: 'local',
        html: markdownRenderer.render(md).replaceAll(/ aria-hidden="true"/gi, ''),
        // @ts-ignore
        meta: markdownRenderer.meta,
        slug,
        wordCount: wordCount(md)
    }
}

const wordCount = (str: string) =>
    str.split(/[\W]+/gi).length

export type Post = LocalPost | ExternalPost

export type LocalPost = {
    kind: 'local',
    html: string,
    meta: {
        title: string,
        description?: string,
        date: string,
        tags: readonly string[],
        test?: boolean
    },
    slug: string,
    wordCount: number
}

export type ExternalPost = {
    kind: 'external',
    meta: {
        title: string,
        date: string,
        tags: readonly string[],
        href: string,
        test?: boolean
    },
}

export default getAllBlogPosts