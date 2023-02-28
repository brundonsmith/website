
import { html } from "../../utils/misc.ts"
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '../../utils/constants.ts'

export default ({ title, description }: { title?: string, description?: string } = {}) =>
    html`
        <head>
            <title>${title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE}</title>
            <meta name="description" content="${description || DEFAULT_DESCRIPTION}">
        
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
            <link rel="stylesheet" type="text/css" href="/css/_all.css">
        </head>
    `