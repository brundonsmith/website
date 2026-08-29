import { html } from '../../../utils/misc.ts'

export default (
  { title, description }: { title?: string; description?: string } = {},
) =>
  // deno-fmt-ignore
  html`
    <head>
        <title>${title ? `${title} | Brandon's Website` : 'Brandon\'s Website'}</title>
        <meta name="description" content="${description || 'Personal website of Brandon Smith'}">
    
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
        <link rel="stylesheet" type="text/css" href="/css/_all_redesign.css">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=IM+Fell+DW+Pica+SC&family=IM+Fell+DW+Pica:ital@0;1&family=IM+Fell+Double+Pica+SC&family=IM+Fell+Double+Pica:ital@0;1&family=IM+Fell+English+SC&family=IM+Fell+English:ital@0;1&family=IM+Fell+French+Canon+SC&family=IM+Fell+French+Canon:ital@0;1&family=IM+Fell+Great+Primer+SC&family=IM+Fell+Great+Primer:ital@0;1&display=block" rel="stylesheet">
        <!-- TODO: We could improve performance and privacy by reducing the characters covered by these fonts, downloading them, and self-hosting them -->
    </head>
`
