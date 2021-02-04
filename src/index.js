
// dependencies
const fs = require('fs').promises
const fsOriginal = require('fs')
const path = require('path')

const ncp = require('ncp').ncp;
const ncpPromise = (from, to, options = {}) => new Promise(res => ncp(from, to, options, res)); 

const express = require('express')
const CleanCSS = require('clean-css')

// project imports
const blog = require('./render/blog.html')
const { readStaticFile } = require('./utils/loading');



const app = express()

// hand-wrote a replacement for express.static, so that files can be cached in 
// memory instead of reloaded from disk
const staticCache = { };
app.use((req, res, next) => {
    const filePath = (req.path.length < 2 ? '/index.html' : req.path.includes('.') ? req.path : req.path + '.html').substr(1);

    const cached = staticCache[filePath];

    (cached ? Promise.resolve(cached) : readStaticFile(filePath))
        .then(file => {
            res.set('Content-Type', file.contentType);

            const responseBuf = Buffer.alloc(file.contents.byteLength);
            file.contents.copy(responseBuf);
            res.send(responseBuf);
        })
        .catch(() => next()) // fallthrough to 404
})

// handle 404s
app.use((req, res) => res.status(404).sendFile(path.resolve(__dirname, '../dist/404.html')))



async function generateSite() {

    // clean and make directories
    await fs.rmdir('./dist',      { recursive: true });

    await fs.mkdir('./dist',      { recursive: true });
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
                allCSS += await fs.readFile(fullPath);
            }
        }))

        allCSS = new CleanCSS({}).minify(allCSS).styles;

        await fs.rmdir('./dist/css',      { recursive: true });
        await fs.mkdir(`./dist/css`,  { recursive: true });
        await fs.writeFile(path.resolve(`./dist/css`, CSS_BUNDLE_NAME), allCSS);
    }

    // generate plain pages
    await Promise.all(                                                      
        [ '404.html', 'about.html', 'contact.html', 'index.html', 'feed.xml' ].map(pageName =>
            require(`./render/${pageName}.js`)()
                .then(html => fs.writeFile(`./dist/${pageName}`, html))));

    // generate blog post pages
    await fs.readdir(`./src/blog`).then(files => Promise.all(
        files
            .filter(fileName => fileName.includes('.md'))
            .map(file => file.substr(0, file.length - 3))
            .map(post => 
                blog(post)
                    .then(html => fs.writeFile(`./dist/blog/${post}.html`, html)))));

}

// start server
const PORT = process.env.PORT || 3000
generateSite()
    .then(() => app.listen(PORT, () => console.log(`Website listening on port ${PORT}!`)));
