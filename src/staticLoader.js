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

/**
 * Given a (possibly async) function which takes exactly one argument,
 * memoize calls to this function in a cache, keyed by the argument passed.
 */
const memoizeUnary = (fn) => {
    const cache = new Map();

    return async (arg) => {
        if (!cache.has(arg)) {
            try {
                cache.set(arg, await fn(arg));
            } catch {
                return undefined;
            }
        }

        return cache.get(arg);
    }
}

const getFilePath = memoizeUnary((reqPath) =>
    (
          reqPath.length < 2 ? '/index.html' 
        : reqPath.includes('.') ? reqPath 
        : reqPath + '.html'
    ).substr(1));

const readStaticFile = memoizeUnary(async (filePath) => {
    const contents = await fs.readFile(path.resolve(__dirname, '../dist', filePath));
    const gzippedContents = await gzipPromise(contents);

    const responseBuf = Buffer.alloc(gzippedContents.byteLength);
    gzippedContents.copy(responseBuf);
    return { 
        contentType: CONTENT_TYPES[path.extname(filePath).substr(1)], 
        contents: responseBuf,
    }
})

const staticLoader = async (req, res, next) => {
    const filePath = await getFilePath(req.path);

    if (filePath == null) {
        next(); // fallthrough to 404
        return;
    }

    const file = await readStaticFile(filePath);

    if (file == null) {
        next(); // fallthrough to 404
        return;
    }

    res.set('Content-Type', file.contentType);
    res.set('Content-Encoding', 'gzip');
    res.send(file.contents);
}

module.exports = {staticLoader, readStaticFile}