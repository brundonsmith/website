
// express
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

// render templates
const { index } = require('./render/index')
const { about } = require('./render/about')
const { blog } = require('./render/blog')
const { blogList } = require('./render/blogList')
const { contact } = require('./render/contact')
const { fourOhFour } = require('./render/404')

const { getAllBlogPosts, getBlogPost } = require('./loading')


app.get('/', (req, res) => 
    res.send(index()))

app.get('/about', (req, res) =>
    res.send(about()))

app.get('/blog', (req, res) => 
    getAllBlogPosts()
        .then(posts => res.send(blogList(posts)))
        .catch(err => {
            console.error(err)
            res.status(500).send(err)
        }))


app.get('/blog/:post', (req, res) => 
    getBlogPost(req.params.post)
        .then(post => res.send(blog(post)))
        .catch(err => {
            console.error(err)
            res.status(404).send(fourOhFour())
        }))

app.get('/contact', (req, res) =>
    res.send(contact()))

app.post('/contact', (req, res) => 
    res.send(req.body))



const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Website listening on port ${port}!`))


