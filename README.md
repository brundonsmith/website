
# My Personal Website

This is my personal website. HTML is rendered using mostly plain JavaScript, server-side, with a little help processing Markdown and code blocks.

## How it works
Entry point is `index.js`. The rendering code is designed such that it would be trivial to have it render at request time (if I ever have dynamic data), or even on the client-side. As it stands, all data is static, so there's no reason not to generate a set of static HTML pages on startup for maximum responsiveness.

The direct children of `src/render/` each expose a function that renders a top-level HTML page, which then gets output to `dist/`. Smaller, reused pieces of HTML are rendered by code in `src/render/fragments/` which is called out to by the former.

Everything under `src/static/` is copied as-is to `dist/`.

`src/blog/` contains a series of markdown files which are automatically fed through `blog.html.js` and output to `dist/blog/` (and listed in `index.html.js`). Each markdown file supports a few metadata properties for things like the date. To add a new blog post, I just add a file to `src/blog/` and redeploy.

## Goals
This site is focused on minimalism, without sacrificing aesthetics or my needed functionality.

With minimal (none, at the time of writing) client-side JavaScript, pages should load ultra-fast. HTML source for a given page is readable, and pages even display in a reasonable way without CSS.

I'm also aiming to make my HTML semantic and accessible. This is something I haven't gotten many opportunities to do in the past, so it's partly a learning exercise.

There's no build process (aside from the static rendering, I suppose). That goes for both the JS and the styles: no TypeScript, no Babel, no Webpack, no SASS. Not to discount the utility of those tools: they just aren't necessary for this kind of site and I wanted to see how far I could get without them.

There are no external fonts, to further lighten the site and increase responsiveness. Instead I used font stacks found [here](http://www.awayback.com/index.php/2010/02/03/revised-font-stack/), and only the raw SVG icons I needed - mostly found [here](https://github.com/leungwensen/svg-icon).
