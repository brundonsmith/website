import { html } from '../../utils/misc.ts'

export default () =>
    // deno-fmt-disable
    html`
        <div class="mobile-only" style="text-align: center; padding: 16px; margin: 0 var(--main-padding); margin-bottom: calc(var(--main-padding) / 2); max-width: var(--main-content-width)">
            <a class="masthead" href="/" style="text-decoration: none; color: var(--ink)">brandon smith</a>
        </div>
    `
