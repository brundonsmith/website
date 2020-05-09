
const fs = require('fs').promises

// markdown-it
const MarkdownIt = require('markdown-it')
const meta = require('markdown-it-meta')
const prism = require('markdown-it-prism')
const anchor = require('markdown-it-anchor')

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

const markdown = (md) => markdownRenderer.render(md)

const getAllBlogPosts = () =>
    fs.readdir(`./src/blog`)
        .then(files => 
            Promise.all(files
                .filter(fileName => fileName.includes('.md'))
                .map(readBlogPostFile)))

const getBlogPost = (postName) => readBlogPostFile(postName + '.md')

const readBlogPostFile = (fileName) =>
    fs.readFile(`./src/blog/${fileName}`)
        .then(buf => buf.toString('utf-8'))
        .then(md => markdownToBlogPost(fileName.split('.')[0], md))

const markdownToBlogPost = (slug, md) => {
    let html = markdown(md)
    return {
        html,
        meta: markdownRenderer.meta,
        slug,
        wordCount: wordCount(md)
    }
}

const wordCount = (str) =>
    str.split(/[\W]+/gi).length
      
module.exports = { markdown, getAllBlogPosts, getBlogPost }