

// express
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fs = require('fs').promises

const { ncpPromise } = require('./utils/misc')
const blog = require('./render/blog.html');

app.use(express.static('dist', { extensions: [ 'html' ] }))
app.use(bodyParser.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3000

Promise.resolve()
    .then(() => fs.mkdir('./dist',      { recursive: true }))                      // make sure dirs exist
    .then(() => fs.mkdir('./dist/blog', { recursive: true }))
    .then(() => ncpPromise('./src/static', './dist'))                              // copy statics
    .then(() => Promise.all(                                                       // generate plain pages
        [ '404', 'about', 'contact', 'index' ].map(pageName =>
            require(`./render/${pageName}.html.js`)()
                .then(html => fs.writeFile(`./dist/${pageName}.html`, html)))))
    .then(() =>                                                                    // generate blog pages
        fs.readdir(`./src/blog`).then(files => Promise.all(
            files
                .map(file => file.substr(0, file.length - 3))
                .map(post => 
                    blog(post)
                        .then(html => fs.writeFile(`./dist/blog/${post}.html`, html))))))
    .then(() =>                                                                    // start server
        app.listen(PORT, () => console.log(`Website listening on port ${PORT}!`)))








/*
.catch(err => {
    console.error(err)
    res.status(500).send(err)
}))*/

app.post('/contact', (req, res) => 
    res.send(req.body))
