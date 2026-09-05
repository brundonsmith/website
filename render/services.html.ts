import { SimplePageProps } from '../loadBlogPosts.ts'
import { html, md } from '../utils/misc.ts'
import layout from './fragments/layout.ts'

export default ({ allPosts, currentPost }: SimplePageProps) =>
    layout({
        allPosts,
        currentPost,
        content:
            // deno-fmt-disable
            html`
                <article>
                    ${md`
                        # Services

                        ## Migrating front-end languages, frameworks, or tools

                        Facing a daunting Next.js upgrade? Adopting static types in your TypeScript or Python codebase? Moving from Webpack to Vite+, or from pip to uv? Uncertain about any of those and want some perspective, or curious to learn what they might do for you?

                        I'll audit the state of your codebase, produce a report on the costs and benefits of a migration, help you decide whether it's worth moving forward with, and then make an organization-wide plan, including any in-org communication and training necessary to make sure it goes smoothly. I can lead the process myself, or hand off the plan for the engineering org to execute.


                        ## Building a UI component library

                        ## Solving deep UI performance issues

                        ## Building an MVP for your startup

                        ## Developer workshops

                        ## Custom tooling or integrations
                    `}
                </article>
            `,
    })
