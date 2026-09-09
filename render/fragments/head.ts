import { html } from '../../utils/misc.ts'

export default (
  { title, description }: { title?: string; description?: string } = {},
) =>
  // deno-fmt-ignore
  html`
    <head>
        ${title ? `<title>${title}</title>` : ''}
        ${title ? `<meta name="description" content="${title}">` : ''}
    
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">
        <meta name="theme-color" content="#FBF8F3">

        <meta property="og:type" content="article">
        <meta property="og:title" content="${title ? `${title} | Brandon's Website` : 'Brandon\'s Website'}">
        <meta property="og:description" content="${description || 'Personal website of Brandon Smith'}">
        <meta property="og:image" content="https://www.brandons.me/icons/og-image.png">
        <meta name="twitter:card" content="summary">
        <meta name="twitter:image" content="https://www.brandons.me/icons/og-image.png">

        <!-- The fonts these pages are set in; "crossorigin" is required even
             though they're same-origin, because fonts are always fetched in
             CORS mode, and without it the preload doesn't match the real
             request and the font gets downloaded twice. -->
        <link rel="preload" href="/fonts/im-fell-dw-pica-regular.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="/fonts/im-fell-french-canon-regular.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="/fonts/im-fell-double-pica-sc-regular.woff2" as="font" type="font/woff2" crossorigin>

        <link rel="stylesheet" type="text/css" href="/css/_all.css">
    </head>
`
