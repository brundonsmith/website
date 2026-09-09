import { SimplePageProps } from '../loadBlogPosts.ts'
import { html, md } from '../utils/misc.ts'
import layout from './fragments/layout.ts'

export default ({ url, allPosts }: SimplePageProps) =>
    layout({
        url,
        title: 'Services | Brandon Smith',
        description: firstParagraph,
        allPosts,
        content:
            // deno-fmt-disable
            html`
                <article>
                    ${md`
                        # Services

                        I'm Brandon Smith, a software developer in Austin, Texas.

                        ${firstParagraph}

                        I've always sought a 
                        deep understanding of
                        the technologies I work with, and I'll bring that understanding with
                        me into my work.

                        Here's what I offer:

                        ## Codebase assessment

                        If you're not sure yet what direction you want to take, or whether
                        action needs to be taken at all, I can start by figuring out where 
                        things stand. For whichever question you'd like answered, I'll spend
                        two weeks looking through your code and talking with any relevant 
                        stakeholders. You'll get a
                        report on the current state of things and where I would go from
                        here (or not), and sit down with you at the end to discuss it. The 
                        report will contain justification for my recommendations.

                        ## Migrating front-end languages, frameworks, or tools

                        Facing a daunting Next.js upgrade? Adopting static 
                        types in your TypeScript or Python codebase? Moving 
                        from Webpack to Vite+, or from pip to uv? Uncertain 
                        about any of those and want some perspective, or 
                        curious to learn what they might do for you?

                        I'll put together a migration plan, including code changes
                        and organizational coordination, and then lead the process.

                        ## Building a front-end component library

                        Does your app have inconsistent UX patterns? Do the 
                        same wheels keep getting re-invented, in different 
                        places by different people? Or- maybe you're starting a 
                        new product from scratch, or doing a brand refresh, 
                        and you want to do it right this time?

                        I'll sit down with designers and product owners, 
                        collaborate with them to design the foundation your app 
                        should be built on - with an eye towards performance, 
                        accessibility, enforced consistency, and testability - and then implement it.

                        ## Solving deep UI performance issues

                        Is your UI generally sluggish and nobody knows why? Maybe 
                        you need to render huge datasets? Or you can 
                        render the dataset, but when you interact with it the 
                        whole thing slows to a crawl?

                        I've worked on several data-intensive 
                        applications, digging into performance challenges along the 
                        way. I have a deep grasp on the browser 
                                                platform, how different frameworks behave within it, 
                                                and how to squeeze the most out of both. 
                        I'll profile and analyze what's going on, identify the bottlenecks, 
                        and solve them, whether it's a matter of a spot-fix or an 
                        organization-wide change in practice.
                        ## Developer workshops

                        Is your team always getting hung up on sticky TypeScript errors? Or 
                        React bugs and pitfalls? Are they starting to adopt Rust, and having
                        a hard time with the new concepts?

                        I'll give an interactive workshop, including live coding and coaching, that will 
                        give your engineers a deep understanding of the 
                        technologies they're building on.

                        ## Custom tooling or integrations

                        Would having an MCP for one of your services
                        accelerate your team's agentic flows? Does your organization have an
                        internal rules language or config format
                        that could use editor integration or CI/CD checks? Do you have
                        a developer workflow that could be enshrined as a custom 
                        command-line tool? 

                        I'll work with your team to identify what they need, build tooling that's 
                        specifically tailored to how they work, and hand off a 
                        documented and maintainable codebase.

                        <hr style="margin-top: 2.5rem; margin-bottom: 2.5rem">

                        <div style="text-align: center; margin-bottom: 2.5rem">
                            <div class="contact-label">Get in touch</div>
                            <a class="contact-address" href="mailto:mail@brandons.me">
                                mail@brandons.me
                            </a>
                        </div>
                    `}
                </article>
            `,
    })

const firstParagraph = `
I provide software consulting services, for everyone 
from startups to enterprises. I've spent over a decade 
developing web and mobile software for AI, 
finance, and energy market companies.`
