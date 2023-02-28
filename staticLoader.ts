import { extname, resolve } from './deps/path.ts'
import { Buffer } from './deps/buffer.ts'
// const { gzip } = require('zlib');
// const gzipPromise = (buf) => new Promise((res, rej) => gzip(buf, (err, out) => err ? rej(err) : res(out)));

// hand-wrote a replacement for express.static, so that files can be cached in 
// memory instead of reloaded from disk

const CONTENT_TYPES = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'js': 'application/javascript; charset=utf-8',
    'xml': 'application/rss+xml; charset=utf-8',
    'png': 'image/png',
    'jpg': 'image/jpg',
    'jpeg': 'image/jpeg',
} as const

/**
 * Given a (possibly async) function which takes exactly one argument,
 * memoize calls to this function in a cache, keyed by the argument passed.
 */
const memoizeUnary = <A, R>(fn: (arg: A) => R | Promise<R>): ((arg: A) => Promise<R | undefined>) => {
    const cache = new Map<A, R>();

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

const getFilePath = memoizeUnary((reqPath: string) =>
    (
        reqPath.length < 2 ? '/index.html'
            : reqPath.includes('.') ? reqPath
                : reqPath + '.html'
    ).substring(1));

export const readStaticFile = memoizeUnary(async (filePath: string) => {
    const contents = await Deno.readFile(resolve('dist', filePath))

    return {
        contentType: CONTENT_TYPES[extname(filePath).substring(1) as keyof typeof CONTENT_TYPES],
        contents,
    }
})

export const getStaticFileResponse = async (req: Request) => {
    const url = new URL(req.url)
    const filePath = await getFilePath(url.pathname)

    if (filePath == null) {
        return undefined
    }

    const file = await readStaticFile(filePath)

    if (file == null) {
        return undefined
    }

    return new Response(file.contents, {
        headers: {
            'Content-Type': file.contentType,
        }
    })
}
