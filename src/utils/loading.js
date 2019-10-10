
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


const getAllBlogPosts = () =>
    fs.readdir(`./src/blog`)
        .then(files => 
            Promise.all(files.map(f => 
                fs.readFile(`./src/blog/${f}`)
                    .then(buf => buf.toString('utf-8'))
                    .then(md => {
                        let html = markdownRenderer.render(md)
                        return { html, meta: markdownRenderer.meta, slug: f.split('.')[0] }
                    }))))

const getBlogPost = (postName) =>
    fs.readFile(`./src/blog/${postName}.md`)
        .then(buf => buf.toString('utf-8'))
        .then(md => {
            let html = markdownRenderer.render(md)
            return { html, meta: markdownRenderer.meta, slug: postName }
        })

module.exports = { getAllBlogPosts, getBlogPost }