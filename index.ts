// project imports
import getCommentsCached from './loadHnComments.ts'
import { createFileMap } from './staticLoader.ts'
import { BASE_URL, DOMAIN } from './utils/constants.ts'
import { logEvent } from './utils/log.ts'

const PORT = Number(Deno.env.get('PORT') || '3000')
const REDIRECT = Deno.env.get('REDIRECT')

// log anything that escapes every other handler; default behavior (crashing)
// is left intact
globalThis.addEventListener('error', (e) => {
  logEvent('error', 'process.uncaught_exception', { error: e.error })
})
globalThis.addEventListener('unhandledrejection', (e) => {
  logEvent('error', 'process.unhandled_rejection', { error: e.reason })
})

logEvent('info', 'server.starting', {
  port: PORT,
  redirect: Boolean(REDIRECT),
  denoVersion: Deno.version.deno,
})

const fileMapStart = performance.now()
const fileMap = await createFileMap().catch((error) => {
  logEvent('error', 'server.startup_failed', { error })
  throw error
})
logEvent('info', 'server.files_loaded', {
  routes: fileMap.size,
  durationMs: Math.round(performance.now() - fileMapStart),
})

const handle = async (req: Request): Promise<Response> => {
  const url = new URL(req.url)

  // redirect http -> https, brandonsmith.ninja -> brandons.me
  if (REDIRECT) {
    if (
      req.headers.get('x-forwarded-proto') !== 'https' ||
      url.hostname !== DOMAIN
    ) {
      return Response.redirect(
        BASE_URL + url.pathname,
        301,
      )
    }
  }

  // serve static files
  {
    const staticFile = fileMap.get(url.pathname)

    if (staticFile) {
      const { content, headers } = staticFile
      return new Response(content, {
        headers,
      })
    }
  }

  // dynamic endpoints
  const endpointPrefix = '/hn-comments/'
  if (url.pathname.startsWith(endpointPrefix)) {
    const post = url.pathname.substring(endpointPrefix.length)

    try {
      if (post) {
        const data = await getCommentsCached(post)

        if (data) {
          return new Response(JSON.stringify(data), {
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
      }

      return new Response(undefined, { status: 404 })
    } catch (error) {
      logEvent('error', 'hn_comments.load_failed', { post, error })
      return new Response(undefined, { status: 500 })
    }
  }

  if (url.pathname === '/health_check') {
    return new Response('OK')
  }

  // handle 404s
  {
    const { content, headers } = fileMap.get('/404') as {
      content: Uint8Array
      headers: HeadersInit
    }

    return new Response(
      content,
      {
        status: 404,
        headers,
      },
    )
  }
}

// start server
const server = Deno.serve({
  port: PORT,
  onListen: ({ hostname, port }) => {
    logEvent('info', 'server.listening', { hostname, port })
  },
}, async (req, info) => {
  const start = performance.now()
  const url = new URL(req.url)

  const response = await handle(req).catch((error) => {
    logEvent('error', 'request.unhandled_error', {
      method: req.method,
      path: url.pathname,
      error,
    })
    return new Response(undefined, { status: 500 })
  })

  // successful health checks are frequent and uninteresting
  if (url.pathname === '/health_check' && response.ok) {
    return response
  }

  logEvent(response.status >= 500 ? 'error' : 'info', 'request', {
    method: req.method,
    host: url.hostname,
    path: url.pathname,
    query: url.search || undefined,
    status: response.status,
    durationMs: Math.round((performance.now() - start) * 100) / 100,
    ip: req.headers.get('cf-connecting-ip') ??
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      info.remoteAddr.hostname,
    userAgent: req.headers.get('user-agent') ?? undefined,
    referer: req.headers.get('referer') ?? undefined,
  })

  return response
})

// graceful shutdown: stop accepting connections and let in-flight requests
// finish before exiting
const shutdown = (signal: Deno.Signal) => async () => {
  logEvent('info', 'server.shutting_down', { signal })
  await server.shutdown()
  logEvent('info', 'server.stopped', { signal })
  Deno.exit(0)
}
;(['SIGTERM', 'SIGINT'] as const).forEach((signal) =>
  Deno.addSignalListener(signal, shutdown(signal))
)
