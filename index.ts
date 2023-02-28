
// dependencies
// const fs = require('fs').promises
// const path = require('path')

// const ncp = require('ncp').ncp
// const ncpPromise = (from, to, options = {}) => new Promise(res => ncp(from, to, options, res))

// const express = require('express')
// const CleanCSS = require('clean-css')
import { copy } from './deps/copy.ts'
import { serve } from './deps/server.ts'


// project imports
import loadBlogPosts from './loadBlogPosts.ts'
import getCommentsCached from './loadHnComments.ts'
import { getStaticFileResponse, readStaticFile } from './staticLoader.ts'
import { resolve } from "./deps/path.ts"

// pages
import fourOhFour from './render/404.html.ts'
import about from './render/about.html.ts'
import contact from './render/contact.html.ts'
import index from './render/index.html.ts'
import feed from './render/feed.xml.ts'
const SIMPLE_PAGES = {
    '404.html': fourOhFour,
    'about.html': about,
    'contact.html': contact,
    'index.html': index,
    'feed.xml': feed
} as const
import blogPost from './render/blog-post.html.ts'
import { BASE_URL, DOMAIN } from "./utils/constants.ts";


// generate site
{

    // clean and make directories
    try {
        await Deno.remove('./dist', { recursive: true, });
    } catch {
        // doesn't exist
    }

    // copy static files
    await copy('./static', './dist');
    await Deno.mkdir('./dist/tags', { recursive: true });
    await Deno.mkdir('./dist/blog', { recursive: true });

    // build CSS bundle
    {
        const CSS_BUNDLE_NAME = '_all.css';

        const cssFiles = await Promise.all(['article.css', 'base.css', 'utils.css', 'variables.css', 'fragments/bio.css',
            'fragments/home-link.css', 'fragments/icons.css',
            'fragments/post-preview.css', 'fragments/prism.css', 'pages/about.css',
            'pages/index.css'].map(async file => {
                if (file !== CSS_BUNDLE_NAME) {
                    const fullPath = resolve(`./dist/css`, file)
                    return await Deno.readTextFile(fullPath)
                } else {
                    return ''
                }
            }))

        const allCSS = cssFiles.reduce((all, file) => all + '\n' + file, '')

        // allCSS = new CleanCSS({}).minify(allCSS).styles;

        await Deno.remove('./dist/css', { recursive: true });
        await Deno.mkdir(`./dist/css`, { recursive: true });
        await Deno.writeTextFile(resolve(`./dist/css`, CSS_BUNDLE_NAME), allCSS);
    }

    const posts = await loadBlogPosts();
    const allTags = posts
        .filter(p => !p.meta.test)
        .map(post => post.meta.tags)
        .flat()
        .filter((el, index, arr) => arr.indexOf(el) === index);

    // generate plain pages
    await Promise.all(
        Object.entries(SIMPLE_PAGES).map(([pageName, render]) =>
            Deno.writeTextFile(
                `./dist/${pageName}`,
                render({ allTags, posts })
            )));

    // generate tags pages
    await Promise.all(
        allTags.map(tag =>
            Deno.writeTextFile(
                `./dist/tags/${tag}.html`,
                index({ allTags, posts, tag })
            )));

    // generate blog post pages
    await Promise.all(
        posts.map(post =>
            Deno.writeTextFile(
                `./dist/blog/${post.slug}.html`,
                blogPost({ post })
            )));
}

// start server
const PORT = Number(Deno.env.get('PORT') || '3000')
const REDIRECT = Deno.env.get('REDIRECT')
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
        const res = await getStaticFileResponse(req)
        if (res) {
            return res
        }
    }

    if (url.pathname === '/hn-comments/:post') {
        try {
            const post = url.searchParams.get('post')

            if (post) {
                const data = await getCommentsCached(post)

                if (data) {
                    return new Response(data)
                }
            }

            return new Response(undefined, { status: 404 })
        } catch (e) {
            console.error(e)
            return new Response(undefined, { status: 500 })
        }
    }

    // handle 404s
    {

        // small hack
        const file = await readStaticFile('404.html')

        return new Response(
            file?.contents,
            {
                status: 404,
                headers: file ? {
                    'Content-Type': file.contentType
                } : undefined
            }
        )
    }
}, {
    port: PORT
})
