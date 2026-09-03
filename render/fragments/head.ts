import { html } from '../../utils/misc.ts'
import {
  BASE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from '../../utils/constants.ts'

export default (
  { title, description }: { title?: string; description?: string } = {},
) =>
  // deno-fmt-ignore
  html`
        <head>
            <title>${title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE}</title>
            <meta name="description" content="${description || DEFAULT_DESCRIPTION}">
        
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
            <link rel="icon" href="/favicon.ico" sizes="any">
            <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
            <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png">
            <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
            <link rel="manifest" href="/site.webmanifest">
            <meta name="theme-color" content="#FBF8F3">

            <meta property="og:type" content="website">
            <meta property="og:title" content="${title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE}">
            <meta property="og:description" content="${description || DEFAULT_DESCRIPTION}">
            <meta property="og:image" content="${BASE_URL}/icons/og-image.png">
            <meta name="twitter:card" content="summary">
            <meta name="twitter:image" content="${BASE_URL}/icons/og-image.png">

            <link rel="stylesheet" type="text/css" href="/css/_all.css">
        </head>
    `
