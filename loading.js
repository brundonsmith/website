
const fs = require('fs').promises

// markdown-it
const MarkdownIt = require('markdown-it')
const meta = require('markdown-it-meta')
const markdownRenderer = new MarkdownIt()
markdownRenderer.use(meta)

const getAllBlogPosts = () =>
    fs.readdir(`./blog`)
        .then(files => 
            Promise.all(files.map(f => 
                fs.readFile(`./blog/${f}`)
                    .then(buf => buf.toString('utf-8'))
                    .then(md => {
                        let html = markdownRenderer.render(md)
                        return { html, meta: markdownRenderer.meta, slug: f.split('.')[0] }
                    }))))

const getBlogPost = (postName) =>
    fs.readFile(`./blog/${postName}.md`)
        .then(buf => buf.toString('utf-8'))
        .then(md => {
            let html = markdownRenderer.render(md)
            return { html, meta: markdownRenderer.meta, slug: postName }
        })


module.exports = { getAllBlogPosts, getBlogPost }