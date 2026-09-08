import { SimplePageProps } from '../loadBlogPosts.ts'
import { html, md } from '../utils/misc.ts'
import layout from './fragments/layout.ts'

export default ({ allPosts, currentPost }: SimplePageProps) =>
    layout({
        title: 'Services',
        allPosts,
        currentPost,
        content:
            // deno-fmt-disable
            html`
                <article>
                    ${md`
                        # Services

                        I'm Brandon Smith, a software developer in Austin Texas.
                        
                        I provide software consultation services, for everyone 
                        from startups to enterprises. I draw from over a decade 
                        of industry experience developing software for AI, 
                        finance, and energy market, companies, to  

                        Below are some examples of services I can offer.

                        ## Migrating front-end languages, frameworks, or tools

                        Facing a daunting Next.js upgrade? Adopting static 
                        types in your TypeScript or Python codebase? Moving 
                        from Webpack to Vite+, or from pip to uv? Uncertain 
                        about any of those and want some perspective, or 
                        curious to learn what they might do for you?

                        I'll audit the state of your codebase, produce a report 
                        on the costs and benefits of a migration, help you 
                        decide whether it's worth moving forward with, and then 
                        make an organization-wide plan, including any in-org 
                        communication and training necessary to make sure it 
                        goes smoothly. I can lead the process myself, or hand 
                        off the plan for the engineering org to execute.

                        ## Building a front-end component library

                        Does your app have inconsistent UX patterns? Do the 
                        same wheels keep getting re-invented, in different 
                        places by different people? Are some of those 
                        re-invented wheels creaky? Or- maybe you're starting a 
                        new product from scratch, or doing a brand re-fresh, 
                        and you want to do it right this time?

                        The foundations that an application is built on make 
                        all the difference in velocity and quality, whether 
                        it's humans or agents utilizing them. Not only by 
                        enforcing a consistent look and feel, but also high 
                        standards for accessibility, performance, and 
                        testability.

                        I'll sit down with designers and product owners, 
                        collaborate with them to come up with the best bones 
                        for the application going forward, and then implement 
                        those building-blocks in code, with an eye towards 
                        performance, testing, and the right balance between 
                        flexibility and strictness for your org's needs.

                        ## Solving deep UI performance issues

                        Is your UI generally sluggish and nobody knows why? Or, 
                        maybe you need to render huge datasets? Maybe you can 
                        render the dataset, but when you interact with it the 
                        whole thing slows to a crawl?

                        I've worked on several data-intensive 
                        applications, tackling performance challenges along the 
                        way. I have a deep grasp on the browser 
                        platform, how different frameworks behave within it, 
                        and how to squeeze the most out of both. I'll profile 
                        and analyze what's going on, identify the bottlenecks, 
                        and propose solutions, whether it's a spot-fix or an 
                        organization-wide policy.

                        ## Developer workshops

                        ## Custom tooling or integrations

                        Need to do code-generation, or static analysis on a
                        domain-specific language? Could you use a custom
                        CLI for your engineering org, or a specialized MCP or 
                        suite of AI skills?

                        I'll work with your team to 


                        <a href="mailto:mail@brandons.me">
                            mail@brandons.me
                        </a>

                    `}
                </article>
            `,
    })
