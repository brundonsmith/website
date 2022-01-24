---
title: Bagel Bites 🥯 (Update on the Bagel Language)
date: January 22, 2022
tags: ["programming", "software-engineering", "bagel"]
---

It's been about four months since I [last posted about Bagel](https://www.brandons.me/blog/the-bagel-language), the new JavaScript-targeted programming language I've been working on. A lot has changed since then, but things are finally crystallizing and getting into a clear-enough space where I feel comfortable sharing some concrete details (and real code!).

The past four months of this process have been a whirlwind. The compiler architecture has been turned on its head several different times as I figure out what it takes to build a static type-checker. Bagel's design, too, has gone through significant re-thinks. The core goals remain the same as they were in the original post, but some of the specific plans have gone out the window when it comes to individual features and semantics.

So first I want to talk about what has and hasn't changed, and then I want to finally present some examples of real, functioning Bagel code.

## What hasn't changed

Bagel is still a statically-typed language that compiles to JavaScript. It still has a hard separation between side-effect-free functional code, and side-effect-y procedural code. It still has reactivity to the mutation of application state/data as a first-class citizen. It still aims to be approachable and familiar to people who already know JavaScript/TypeScript, and to maintain as much of the semantics of those as possible while refining them, expanding them, and sanding off the rough edges.

## What has changed

Here are some things I talked about in the original post that have since changed:
- Functions will not be curry-able or partially-applicable by default. Originally I thought this was a no-brainer without any downsides, but a [helpful commenter](https://news.ycombinator.com/item?id=28586862) on Hacker News opened my eyes to the limitations it brings, so I decided to drop it. That said, just like in JavaScript it will be easy to write your own partially-applicable functions by hand. The pipeline operator will also be kept, even thought it's less important now.
- I didn't explicitly state that Bagel would use MobX under the hood, but that was the plan at the beginning. Since then I've decided to switch over to a custom-written reactivity system, for a few different reasons, but the core semantics/concepts still line up with MobX-style thinking.
- Bagel will not have classes. Initially my thinking was that classes would be useful for UI components and/or state stores, but I came up with alternate approaches for both of those; see more below.
- Bagel will not have "components", see more below.

### Components/classes/stores

This part of the design went through quite a journey, including a few crises about whether the whole project was even going to work at all, but it ended up in a place I'm pretty happy with.

Here's where I started out: classes can be useful as holders of mutable state. Mutable state should be kept small, but that small nugget is embraced by Bagel as a core part of its philosophy. Therefore, classes should have a place too. In particular: MobX embraces classes as both global stores, and for (React) UI components with observable state. It seemed like a no-brainer.

But here's the rub: Bagel isn't aiming to be a DSL for React-style UIs, I want it to be a general-purpose language suitable for games, web servers, scripting, even compilers. That includes its reactivity system. So this means that Bagel entities - and classes in particular - can't benefit from any kind of lifecycle awareness. I tried figuring out a way to track the lifecycle of class instances statically and it started to look like I would have to write a complete borrow-checker with ownership rules and everything, and to put it lightly, that just wasn't something I was interested in even attempting to do.

Okay, so no lifecycle hooks, so what?

Well the thing is: when you set up a MobX-style reaction, it can't be cleaned up automatically. It has to either have a global lifetime, or be disposed of in some way (in practice, usually on `componentWillUnmount()`). Otherwise, you get memory-leaks galore.

I want Bagel to be free of footguns; requiring the user to clean up their reactions manually, without a standard way of doing so, sounds like a footgun. And automatically cleaning up reactions with dynamic lifetimes just wasn't feasible.

So: reactions became global-only. That's where we are today; reactions can only be set up at the module level, and they live forever. This sounds limiting, but the thing is, reactions are really just for bridging your reactive code to the outside world. Inside your own logic, you don't really need them. In fact, I plan on forbidding reactions from changing application state at all; they can only _observe_ application state and cause side-effects in the _outside_ world. And the thing about the outside world, is... it's global.

Okay, so we have global-only reactions, but how is a global reaction going to observe state tucked inside a transient class-instance somewhere? It isn't, really.

So then I moved to, instead of having classes, you only have global class-like singletons called `store`s. These looked like classes - they had members of the usual kinds, some of those could be private, etc - but they could only exist as a global singleton. This made them better suited to global reactions.

But, eventually I realized that this was a bit silly. A store was really just another namespace inside of a module that had some different syntax. Things would be much simpler (for both language-learners and the language-implementer!) if I did away with the `store` concept and just allowed plain-data `let` declarations at the module level instead. Instead of private state/members you could just have non-exported declarations. For readability I added entire-module imports, so you can still do `store.foo()` if you want.

Global-only state and a total lack of components may sound bad, but here I looked to Elm, which also has global-only state and no real concept of components. Redux also puts most UI state in a single global store. Both of these demonstrated that real, full-scale apps can be written with mainly or exclusively global state, and in Elm's case, with no concept of components at all; only render-functions. The big difference, though, between these and Bagel is that you can skip all the message/command/reducer business and just mutate your state directly when it comes time to do that. Instead of a "UI component" you have a module that exports a render function, and event handlers that mutate state, and maybe some data types and some functions that construct instances of those types.

There's one other reason to have components, though: memoization/avoiding re-renders. But Bagel has this covered too; in fact, it dovetails wonderfully with its reactivity model.

Any function in Bagel can be marked as `memo`. With this, Bagel will [memoize](https://en.wikipedia.org/wiki/Memoization) all of its return-values. Calling the same function with the same arguments will return a cached result instead of re-computing it. And, importantly, Bagel will invalidate the function's cached result whenever any of the arguments or any mutable state it captures in its closure _is mutated_. This is basically how MobX's [computedFn](https://github.com/mobxjs/mobx-utils#computedfn) works, and it's essential if we want to memoize over mutable data, which we do.

So, just `memo` your render function, and if the relevant state doesn't change between app renders, the previous render's output will be re-used.

I've written a simple GUI app using the above paradigm, and so far it works really nicely.

## What's been solidified

These are things that were only ideas, possibilities, or open questions last time, and have since congealed into realities or at least semi-firm plans:

- **Nominal types** are a "definitely", and are partially implemented. To maintain JavaScript/TypeScript semantics, they won't be quite as ergonomic as they are in a language like Rust or Elm, but they should be pretty close, and a lot better than the way discriminated-unions work in TypeScript.
- **Consts** (and types prefixed with `const`) will be completely, recursively, read-only. A proc can have a `const` argument that gets a "const view" on an object that may or may not be const externally, but any data that starts its life in a `const` declaration will be always and forever const. Beyond helping maintainability, this could create some interesting opportunities for optimization. Automatically using persistent data structures where the type system allows for them is... something I'm curious to explore at some point.
- **Package management**: Bagel will follow in Deno's footsteps and load dependencies from remote URLs instead of having a package-manager. I think Deno's proven that this is workable (I wouldn't have done it otherwise). It keeps things simpler, it means I don't have to build and host a package repository on top of building a compiler, and it still leaves the possibility that repositories could be created (by me or others!) and used later on, with no changes to Bagel itself; they can just be exposed via HTTP. It seemed like the right choice for bootstrapping what's already a significant endeavor.
- **Project structure**: Bagel files will come in two flavors, "main" files and all other files. Non-main files will be 100% side-effect-free. Importing them will have no effect on its own. Main files, on the other hand, are special. They can have a `main()` proc that runs automatically on startup. They can also export a (typed!) `config` constant for controlling project options like linting. They may also be the only place reactions can be initialized, and similarly for global events or other lifecycle hooks; that part is still a little fuzzy. A "main" file is defined as either 1) the `index.bgl` file in a project directory, or 2) the file explicitly targeted with the `bagel build` or `bagel run` commands. (2) is mainly to allow for standalone Bagel scripts.
- **JS interop**: I waffled back and forth on JS interop at first because of Bagel's strict type system, but some on Hacker News emphasized how valuable it would be and I came up with a way of doing it - inspired by Rust's `unsafe` story - that I feel good about. Users of the language will be able to define enshrined "js func"s, "js proc"s, and "js import"s. The procs and funcs will have to declare full-on Bagel contracts, but adherence to those contracts will be up to the implementer. The body of these will be JS code, and will be treated as a black-box by Bagel; it will simply dump it as-is into the compiled output. When going the other way, calling Bagel code from TS/JS, Bagel types and contracts actually translate pretty neatly to TypeScript, and `.bgl` files will be translatable directly to corresponding `.ts` or `.js` files.
- **Integrations**: integrations with JS libraries will be user-writable. That said, I plan on providing some of them out of the box for key projects like preact, express, and maybe Three.js. Bagel's JSX-like element syntax will call a standard function interface that will allow swapping out of different VDOM (or otherwise) libraries, but preact will likely be the officially-supported one (though this could change before v1.0).
- **CLI**: Bagel will ship as a single command-line tool, inspired by other modern toolchains like Rust and Go, which includes sub-commands for all the major tasks. The relevant commands will also be `--watch`-able.
    - `bagel build` - build a self-contained bundle, ready to be run in the browser or via Node or Deno (see "Platforms" below)
    - `bagel check` - check types and perform linting, over a file or a whole project
    - `bagel run` - build a self-contained bundle and immediately run it via Node or Deno
    - `bagel transpile` - translate .bgl files directly to corresponding .js or .ts files, for a single file or a whole project
    - `bagel test` - run any tests in a single file or across a whole project (see "Testing" below)
    - `bagel format` - apply standard formatting to Bagel code, across a single file or a whole project
    - `bagel autofix` - automatically apply fixes to all linter issues that can be auto-fixed 
- **Testing** will be a first-class citizen. Users will be able to specify "test expressions" (stateless) and "test blocks" (stateful), which will be dropped from normal builds but can be run across a project or file using the `bagel test` command. Mocking is also something I'd like to give first-class support for, but I'm not sure yet what that will look like exactly.
- **Platforms**: Bagel will be able to compile for browsers, Node, or Deno, or a combination of the three. Outside-world APIs will be gated based on the configured build targets for a project. The compiler will tell you if you're using APIs you aren't allowed to use. I'm hoping that I'll be able to write some core APIs like fetch and file-system access in such a way that a single API works across multiple platforms.

## Bites

Ok, it's time. Let's look at some code! These will be some random samples that show off different aspects of the language.

<aside>
 You might notice some weird-looking characters; I'm using the <a href="https://github.com/tonsky/FiraCode">Fira Code</a> font, which combines certain common character sequences like <code><=</code>, <code>==</code>, <code>=></code>, etc into prettier combo-characters. This is purely visual in my editor (where I took these screenshots), and hopefully not too hard to follow in these examples. Rest assured though: Bagel doesn't use any exotic characters!
</aside>

### Fibonacci

![Fibonacci sequence implemented in Bagel](/img/blog/bagel-bites/fib.png)

We'll start with a classic. This file can be compiled directly into a bundle as the "main" file, and
then run in either Node or Deno. A few things to note here:
- `fibonacci()` is a `func`, and `main()` is a `proc`. The former cannot change state (local to the application or in the outside world), only return a value. The latter cannot return a value, only perform sequential instructions.
- A `func`'s body consists of a single expression. However, you'll notice we've got an `if`/`else` in there. Unlike JavaScript, Bagel has an "expressive if/else", which means `if`/`else` can be used in an expression-context. Each branch contains another expression and the overall `if`/`else` evaluates to one of their values based on the condition. Like a normal `if`/`else`, it can be chained with more cases.
- `0..10` creates an iterator over the numbers 0, 1, 2, ..., 9. That iterator is then `map()`ed (just like the `map()` array method from JS) through the `fibonacci()` function, and then gathered back into an array with the `.array()` method. The reason for this iterator/array distinction is to avoid copying arrays on each transformation, unlike JS. In my experience, this array copying is one of the most common performance problems when it comes to raw JS processing.
- Right now I'm having to explicitly pass a generic type parameter to `.map()`, telling it we're mapping to a new iterator of `number`s (the return type of `fibonacci()`). Generics + type inference is hard, it turns out, and mine isn't quite as smart as TypeScript yet. I'm hoping to have at least this case working implicitly before the first real release.
- `first10`, being a `const`, is **deeply immutable**. If you try to mutate any part of it, the compiler won't let you. This is unlike TypeScript, where a `const` only makes the base reference (or value) constant. I think this way will be both more powerful and more intuitive. For mutable variables, there is still the `let` keyword which makes its value deeply-mutable (however, an immutable object can't be assigned into a mutable context!).
- Building this file as the entry-point makes it a special "main" Bagel file (as discussed above under "Project structure"). One implication of this is that its `main()` proc, if defined, will be called automatically on startup. This is important because procedural code cannot exist at the module level! `main()` is the *only* place code can begin being called at startup.

### Todo-list item "component"

![UI component implemented in Bagel](/img/blog/bagel-bites/todo-item.png)

Bagel doesn't have React-style UI components, but this file represents the rough equivalent. Outside of this file you would have a store holding all application state and passing objects down to this render function, but all the details can still be described here, in one place.

- First we declare a `TodoItem` type that describes our data object for each todo-list item. This is nearly identical to the TypeScript equivalent.
- `makeTodoItem()` constructs a default instance of `TodoItem`. This would be called, for example, when the user clicks "add item". Putting it in this file means it's easy to update when the type gets changed.
- `renderTodoItem()` renders a TodoItem, very similarly to a React render function; you'll note the JSX-like syntax. The thing to note here is `memo`; this memoizes the return value over the argument. If the same function is called with the same TodoItem, the same content will be re-used. If that TodoItem is *mutated*, the cached value will be cleared. Instead of a Component we just have a function; instead of props we just have arguments.
- `itemChangeHandler()` and `itemDoneChangeHandler()` are a bit more interesting. Each of these is a `func` that returns a(n anonymous) `proc` (an anonymous function in Bagel looks like `(a) => a * 2`, an anonymous procedure looks like `() { }`).  Here the returned `proc` captures a TodoItem in its closure, for use when it later handles events. You'll note that each of these handlers can mutate the TodoItem directly, without talking to the store itself or producing any kind of action. This is the power of mutation-based reactivity. Finally, you'll note these are also `memo`d. This means that on each render, the proc will be re-used unless its TodoItem changes. Nifty!

### LocalStorage integration

![Integration with local storage from Bagel](/img/blog/bagel-bites/local-storage.png)

This is one of the integrations that's going to be shipped with the standard library. I chose this example because it demonstrates both a) what it looks like to set up observable state, and b) what JS-interop looks like.

- `getAllLocalStorage()` gathers all items from the browser's localStorage, and `setLocalStorage()` sets the content of one item in the browser's localStorage. These are both marked with `js`, which means their bodies are JavaScript. Bagel does not try to parse the JavaScript; the `{#` `#}` are used because `#` is (I believe) an illegal character in JS outside of strings. The way the JS is separated out from the surrounding code may see some tweaking before release... It's tough (it might technically be impossible) to perfectly separate it without parsing it, but parsing it would be several times as complicated as parsing Bagel itself. Suggestions are welcome for other ways to handle this.
- `_localStorage` is an observable store mirroring the native localStorage. The reason for this is to make all of these key/value pairs observable! Any code that uses this state in an observable context will react when something else modifies that localStorage value (via the proc provided here). Local storage can become a source of truth, instead of something to constantly keep in sync.
- `setItem()` and `getItem()` make up the public (exported) interface for this module. Note that they are a `proc` and a `func`, respectively, dictating how they can be used.
- A small thing I wanted to point out: `string?` is shorthand for `string|nil`. Any type can be made a "maybe-type" by adding a question mark to it, which just unions it with `nil`. This is a common thing to do so it's very handy.

## Summary

That was a lot! But then, a lot has happened. There's more that I could have talked about here, but I think I've covered the most important stuff. Bagel is real, it's coming along, and I'm excited about it.

There are still a couple of key pieces that need to be built before it can be used for anything real. Most crucially:
- async (which I have a fairly solid plan for, but haven't really started implementing)
- Runtime union-discrimination, and related: decoding of foreign data like JSON payloads (again, I have a fairly solid plan, but haven't really started implementing)
- Standard library, including core platform/system APIs

Once these are implemented, we may be getting close to a v0.1. Around that time I'll want to start building some more-than-toy projects with it, to sift out any glaring bugs or important missing features. This will probably include a nontrivial web app, and I may also start self-hosting Bagel's compiler.

If anybody finds themselves interested in contributing to and/or testing Bagel, feel free to email me at [mail@brandons.me](mailto:mail@brandons.me). I think right now would still be a bit early for contributing or testing, but I'd still love to talk about the project or receive suggestions/feedback.

Thanks for reading if you've made it this far! I'll post again when I have more updates.

Cheers