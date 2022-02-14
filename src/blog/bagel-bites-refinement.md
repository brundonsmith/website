---
title: "Bagel Bites: Type Refinement"
date: February 13, 2022
tags: ["bagel", "programming"]
---

I'm stuck solving a gnarly problem right now, so I thought I'd switch gears and write about a recent win in [Bagel](https://github.com/brundonsmith/bagel)'s design/implementation that I'm really excited about.

Working with foreign data (from a fetch call, for example) is a common pain-point in TypeScript and many other statically-typed languages: the compiler can't know what it's working with ahead of time, so it can't verify that your code uses it correctly.

There are a few different ways to deal with this:
1. Work with the data "pessimistically": if you've got JSON data for example, assume the value could be any valid JSON (perhaps representing objects as hashmaps or something). This is safe - your type system should make sure you pick the data apart in a safe way - but it's tedious, and it invites mistakes if you eg. misspell a property name; you don't get any help from your editor with autocomplete, etc.
2. Work with the data "optimistically": in static languages like TypeScript that are overlaid on a dynamic language, you can just cast the value to some expected type and cross your fingers that it comes through as expected. This is easy but unsafe: if the real data violates the type you give it, the rest of your code could make all kinds of bad assumptions when using it that result in runtime errors, or worse.
3. Validate the data before using it: usually this means writing some sort of schema or "decoder" logic that's *separate* from your normal type syntax, but walks through the foreign data, verifying every piece of it individually, and then eventually hands you either a well-formed value of the expected type or an error which your application code can then handle.

The third option is both safe and ergonomic for the code downstream. But it can also be a pain:
- Usually you're describing your schemas/decoders in some totally separate way from how you describe your "normal" types. This harms readability.
- In some languages, you may not get the resulting types "for free". i.e. you may have to define your schema *and then also* define the type, writing everything twice and then manually keeping the two in sync.

[Elm](https://guide.elm-lang.org/effects/json.html) and [io-ts](https://gcanti.github.io/io-ts/) are examples of this sort of thing. Rust's [Serde](https://serde.rs) is too, though it's an outlier because it uses macros to automatically generate decoders from your regular types.

Bagel's main usecases - UIs, web servers, scripts - are IO-heavy, so Bagel needed a great story for working with foreign values. Here's what I came up with:

![Example of type refinement in Bagel](/img/blog/bagel-bites-refinement/refinement.png)

Like TypeScript, Bagel has type refinement ("if some check has been performed on value X for some section of code, change its type in that context to reflect what values could possibly have made it there"). But TypeScript makes a point not to add runtime behaviors on top of JavaScript, so if you want to refine a value's type, you're limited to checks JavaScript already knows how to make:

```typescript
val != null

val instanceof Promise

Array.isArray(val)

typeof val === 'string'
```

etc. These are well and good, but they don't work for more complex types. `instanceof`, in particular, only works for class instances and "exotic" objects, because JavaScript isn't digging in and comparing the types structurally, it's just checking the `constructor` associated with the object. Interfaces/plain object types don't have an associated constructor; JavaScript has no concept of them at all. And TypeScript doesn't create a runtime concept of it, because it wants to stay out of your runtime logic.

Bagel on the other hand doesn't aim to adhere perfectly (only mostly!) to JavaScript semantics, so we can take some liberties here.

So in Bagel, **any type can be used with `instanceof`**.

There's no special decoder system, there are no schemas, there are just your usual types. Normally those types are compile-time-only like in TypeScript. But when you need to use them at runtime in an `instanceof` check, they become available at runtime as needed.

When `instanceof` is invoked, Bagel automatically generates a runtime representation of the type involved. Then, at runtime, it passes this type representation together with the value being checked into a function that walks through them together and checks to see if they match. This returns a boolean. But the compiler also knows, when it sees `instanceof` checks used in certain cases like a conditional, to use that information to refine the value's type at compile-time, allowing the value to be used within that code "as if" it matched the checked type, because it will only reach that code if it does.

## General status update

This and async were two of the most important milestones holding Bagel back from being used for real apps, and I've now got a first implementation of each of those settled and working.

There are still things to do before I feel comfortable calling it a v0.1, but we're getting there. I've made a pair of little web apps - a classic todo app and a Pokemon-card search app - that both typecheck and build and run correctly. So that's exciting. These are available in the repo if you want to take a look.

Next steps:
- There are still bugs and gaps in type checking and type inference that I'm continuing to squash
- Documentation!
- Core APIs still need to be fleshed out, especially for Node/Deno
- Official JS library integrations need to be available from the get-go; right now we have Preact (sort of), but I want to also have Express (or maybe some Deno equivalent). Three.js could also make sense, though might wait till later.
- The current quick-and-dirty implementation of the reactivity system probably has bugs, and is definitely really inefficient
- Test coverage needs to be increased
- Error output needs to be cleaned up (currently will show lots of errors that are made redundant by other errors)
- Some kind of clear story for writing CSS/styles in web apps
- Built-in testing system is partially implemented, but doesn't currently work and lacks support for mocking
- Errors/handling in pure contexts will probably be done with nominals + union types, but might deserve special syntax support like in Rust. Errors/handling in procs don't exist at all right now; might end up looking like try/catch but with explicit declarations.
- Textmate (VSCode) syntax-highlighting descriptor needs an overhaul. Right now it's written from scratch and very limited and fragile; I plan to make a new one by copying and modifying the official TypeScript one.

As always thanks for your interest, and feel free to star the repo or send me an email with any questions or feedback! 🥯 