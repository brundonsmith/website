const fs = require('fs').promises
const path = require('path')

// hand-wrote a replacement for express.static, so that files can be cached in 
// memory instead of reloaded from disk

const CONTENT_TYPES = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'png': 'image/png',
    'jpg': 'image/jpg',
    'jpeg': 'image/jpeg',
    'xml': 'application/rss+xml',
}

const readStaticFile = (filePath) => 
    fs.readFile(path.resolve(__dirname, '../dist', filePath))
        .then(contents => ({ 
            contentType: CONTENT_TYPES[path.extname(filePath).substr(1)], 
            contents 
        }))

        
const staticCache = { };

const staticLoader = (req, res, next) => {
    const filePath = (req.path.length < 2 ? '/index.html' : req.path.includes('.') ? req.path : req.path + '.html').substr(1);

    const cached = staticCache[filePath];

    (cached ? Promise.resolve(cached) : readStaticFile(filePath).then(f => staticCache[filePath] = f))
        .then(file => {
            res.set('Content-Type', file.contentType);

            const responseBuf = Buffer.alloc(file.contents.byteLength);
            file.contents.copy(responseBuf);
            res.send(responseBuf);
        })
        .catch(() => next()) // fallthrough to 404
}

module.exports = staticLoader