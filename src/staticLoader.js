const fs = require('fs').promises
const path = require('path')

const { gzip } = require('zlib');
const gzipPromise = (buf) => new Promise((res, rej) => gzip(buf, (err, out) => err ? rej(err) : res(out)));

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

const readStaticFile = async (filePath) => {
    const contents = await fs.readFile(path.resolve(__dirname, '../dist', filePath));
    const gzippedContents = await gzipPromise(contents);
    console.log(gzippedContents)

    const responseBuf = Buffer.alloc(gzippedContents.byteLength);
    gzippedContents.copy(responseBuf);
    return { 
        contentType: CONTENT_TYPES[path.extname(filePath).substr(1)], 
        contents: responseBuf,
    }
}

        
const staticCache = { };

const staticLoader = async (req, res, next) => {
    const filePath = (
          req.path.length < 2 ? '/index.html' 
        : req.path.includes('.') ? req.path 
        : req.path + '.html'
    ).substr(1);

    if (staticCache[filePath] == null) {
        try {
            staticCache[filePath] = await readStaticFile(filePath);
        } catch {
            next(); // fallthrough to 404
            return;
        }
    }

    const file = staticCache[filePath];

    res.set('Content-Type', file.contentType);
    res.set('Content-Encoding', 'gzip');
    res.send(file.contents);
}

module.exports = staticLoader