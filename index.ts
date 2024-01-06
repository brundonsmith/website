import { serve } from './deps/server.ts'

// project imports
import getCommentsCached from './loadHnComments.ts'
import { createFileMap } from './staticLoader.ts'
import { DOMAIN, BASE_URL } from "./utils/constants.ts";

const PORT = Number(Deno.env.get('PORT') || '3000')
const REDIRECT = Deno.env.get('REDIRECT')

const fileMap = await createFileMap()

// start server
serve(async (req) => {
    const url = new URL(req.url)

    // redirect http -> https, brandonsmith.ninja -> brandons.me
    if (REDIRECT) {
        if (req.headers.get('x-forwarded-proto') !== 'https' || url.hostname !== DOMAIN) {
            return Response.redirect(
                BASE_URL + url.pathname,
                301
            )
        }
    }

    // serve static files
    {
        const staticFile = fileMap.get(url.pathname)

        if (staticFile) {
            const { content, headers } = staticFile
            return new Response(content, {
                headers
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
                            'Content-Type': 'application/json'
                        }
                    })
                }
            }

            return new Response(undefined, { status: 404 })
        } catch (e) {
            console.error(e)
            return new Response(undefined, { status: 500 })
        }
    }

    if (url.pathname === '/health_check') {
        return new Response('OK')
    }

    // handle 404s
    {
        const { content, headers } = fileMap.get('/404') as { content: Uint8Array, headers: HeadersInit }

        return new Response(
            content,
            {
                status: 404,
                headers
            }
        )
    }
}, {
    port: PORT
})
