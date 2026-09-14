import { html } from '../../utils/misc.ts'

export default () =>
    // deno-fmt-disable
    html`
        <div class="mobile-only" style="text-align: center; padding: 16px; margin: 0 var(--side-margin); max-width: var(--measure)">
            <a class="masthead" href="/" style="color: var(--secondary)">brandon smith</a>
        </div>
    `
