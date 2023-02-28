import { html } from "../../utils/misc.ts"
import { RSS_SVG, LINKEDIN_SVG, GITHUB_SVG } from "./icons.ts";

export default () =>
    html`
        <header class="bio">
        
            <a href="/" aria-label="Home">
                <img src="/img/me.jpeg" height="100px" alt="Me" />
            </a>
        
            <p>
                I'm Brandon Smith, a programmer in Austin, Texas. <a href="/about" aria-label="About me">More about me.</a>
            </p>
        
            <div>
                <a class="icon-link" href="/feed.xml" rel="noopener" title="RSS" aria-label="RSS">
                    ${RSS_SVG}
                </a>
        
                &nbsp;
        
                <a class="icon-link" href="https://www.linkedin.com/in/brandon-smith-9589706b/" target="_blank" rel="noopener"
                    title="LinkedIn" aria-label="LinkedIn">
                    ${LINKEDIN_SVG}
                </a>
        
                &nbsp;
        
                <a class="icon-link" href="https://github.com/brundonsmith" target="_blank" rel="noopener" title="Github"
                    aria-label="Github">
                    ${GITHUB_SVG}
                </a>
        
            </div>
        
        </header>
    `
