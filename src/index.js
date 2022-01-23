
// dependencies
const fs = require('fs').promises
const path = require('path')

const ncp = require('ncp').ncp
const ncpPromise = (from, to, options = {}) => new Promise(res => ncp(from, to, options, res))

const express = require('express')
const CleanCSS = require('clean-css')

// project imports
const blogPost = require('./render/blog-post.html')
const loadBlogPosts = require('./loadBlogPosts')
const getCommentsCached = require('./loadHnComments')
const {staticLoader, readStaticFile} = require('./staticLoader')
const redirect = require('./redirect')


const app = express()

// redirect http -> https, brandonsmith.ninja -> brandons.me
if (process.env.REDIRECT) {
    app.use(redirect);
}

// serve static files
app.use(staticLoader)

app.get('/hn-comments/:post', async (req, res) => {
    try {
        const { post } = req.params

        const data = await getCommentsCached(post)

        if (data) {
            res.send(data)
        } else {
            res.sendStatus(404)
        }
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
})

// handle 404s
app.use(async (req, res, next) => {

    // small hack
    const file = await readStaticFile('404.html');
    
    res.status(404);

    res.set('Content-Type', file.contentType);
    res.set('Content-Encoding', 'gzip');
    res.send(file.contents);
})


async function generateSite() {

    // clean and make directories
    await fs.rm('./dist',         { recursive: true, force: true });

    await fs.mkdir('./dist',      { recursive: true });
    await fs.mkdir('./dist/tags', { recursive: true });
    await fs.mkdir('./dist/blog', { recursive: true });

    // copy static files
    await ncpPromise('./src/static', './dist');

    // build CSS bundle
    {
        const CSS_BUNDLE_NAME = '_all.css';
        let allCSS = ``;

        await Promise.all(['article.css', 'base.css', 'utils.css', 'variables.css', 'fragments/bio.css', 
            'fragments/home-link.css', 'fragments/icons.css', 
            'fragments/post-preview.css', 'fragments/prism.css', 'pages/about.css',
            'pages/index.css'].map(async file => {
            if(file !== CSS_BUNDLE_NAME) {
                const fullPath = path.resolve(`./dist/css`, file);
                const fileContents = await fs.readFile(fullPath, 'utf8');
                allCSS += fileContents;
            }
        }))

        allCSS = new CleanCSS({}).minify(allCSS).styles;

        await fs.rm('./dist/css', { recursive: true });
        await fs.mkdir(`./dist/css`, { recursive: true });
        await fs.writeFile(path.resolve(`./dist/css`, CSS_BUNDLE_NAME), allCSS);
    }

    const posts = await loadBlogPosts();
    const allTags = posts
        .filter(p => !p.meta.test)
        .map(post => post.meta.tags)
        .flat()
        .filter((el, index, arr) => arr.indexOf(el) === index);

    // generate plain pages
    await Promise.all(                                                      
        [ '404.html', 'about.html', 'contact.html', 'index.html', 'feed.xml' ].map(async pageName =>
            fs.writeFile(
                `./dist/${pageName}`, 
                require(`./render/${pageName}.js`)({ allTags, posts })
            )));

    // generate tags pages
    await Promise.all(
        allTags.map(tag => 
            fs.writeFile(
                `./dist/tags/${tag}.html`, 
                require(`./render/index.html.js`)({ allTags, posts, tag })
            )));

    // generate blog post pages
    await Promise.all(
        posts.map(post => 
            fs.writeFile(
                `./dist/blog/${post.slug}.html`, 
                blogPost({ post })
            )));
}

// start server
const PORT = process.env.PORT || 3000
generateSite()
    .then(() => app.listen(PORT, () => console.log(`Website listening on http://localhost:${PORT}/`)));
