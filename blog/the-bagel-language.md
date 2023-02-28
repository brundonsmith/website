---
title: The Bagel Language 🥯
date: September 16, 2021
tags: ["programming", "bagel"]
---

I've started working on a programming language.

I'm calling it Bagel, and it's still in a stage where everything's changing, 
but I wanted to put the motivating ideas into words, to organize my thoughts and 
maybe get a little feedback.

## The gist

Over the years I've developed lots of ideas and opinions - some specific to web
dev, and some not - and as those tend to do, they've solidified into a language 
that's taken up residence in my head. At the very least it will
be an interesting way to explore them and see what happens when they're taken 
further than usual; if I'm lucky it might even be useful to somebody one day.

To get down to brass tacks: Bagel will be a statically-typed, JavaScript-targeted 
language. It will keep many of the same syntaxes and semantics as
JavaScript/TypeScript, except where there's significant benefit to breaking 
away from them. It will involve lots of nice little refinements and additions
to the JavaScript paradigm, but it's mainly driven by two key ideas, which are 
really what make the whole project worth doing in my opinion:
1. A hard, enforced separation between stateless functional code and stateful 
procedural code
2. Reactivity as a first-class citizen

I'm going to prioritize a first-class, batteries-included reactive web GUI 
experience similar in scope to what Elm or Imba offers, but I also want Bagel
to be useful as a general-purpose language for writing server-side code, games, 
etc. I hope its compiler will one day be self-hosted. There will definitely be
an opinionated all-in-one compiler/package manager/etc tool, and one or two 
editor extensions offering syntax highlighting. I'd like to do an LSP down 
the line too, but that will likely be pretty far away.

## Dichotomy

Bagel has its roots in a philosophy that I've become a strong believer in: all
programs have a [pure functional subset](https://www.brandons.me/blog/procedures-functions-data), 
and barring performance constraints, that subset should be pulled out and coded 
in as functional a way as possible.

*However*, most programs also have a stateful subset, and I believe a 
productive language needs to make it easy to do stateful things in a natural 
way too. But that stateful subset of a project's logic should be kept as small 
as possible, and should be isolated from the functional subset.

In my JavaScript code I do this mostly by convention. Pure functions
get elevated to top-level declarations, and assuming there's no global state 
hanging around, this makes a pretty strong signifier that they're pure. 
Code that really needs to be stateful I like to encapsulate in classes (or more 
recently it's often in hooks, I guess...).

This works okay, but unfortunately it can't really be enforced. I don't actually
know of a language that lets you have both things without compromises but also 
enforces a separation. Rust comes close with mutable vs immutable references, 
but it isn't the right tool for every task.

So here's what this separation looks like in Bagel (syntax is subject to change):

```
func add(a: number, b: number) => a + b

proc printSum(a: number, b: number) {
    log(add(a, b));
}
```

Functions and procedures are mutually-exclusive categories. No function is a 
procedure, and no procedure is a function. Functions cannot have side-effects.
Procedures *can't return values* (!). If you want to re-use some logic that
generates a value, you have to put in a pure function. If you want to 
re-use some logic that has side-effects, you have to put it in a procedure.
Procedures can call functions of course, but functions cannot call procedures.
Functions *can* work with procedures as values, or even create them - both 
functions and procedures are first-class values - they just can't call them.

It's going to be really interesting to write some real programs with these 
constraints and see how they scale, especially the no-returning-procedures one.
I know it works well in general, but I've never had it as a strict requirement.
I'm about 90% sure it will work out great; we'll see.

I have some interesting ideas about extra features that could take advantage
of these qualities. Definitely some tree-shaking, etc like what Elm does. But maybe
even some automatic build-time precomputing of constants, inlining, declarative 
memoization for arbitrary functions, re-ordering of operations, or even
ways of transparently spinning off a given function into its own worker thread.
I'm excited to explore the possibilities here.

## Reactivity

VDOMs and their cousins have had the spotlight in the front-end web for years 
and years now, but I believe there's a much bigger and harder problem that 
people often treat as secondary, and that is **reactivity**.

We've got some state, and we want to be able to change it, but if we can't push 
updates to the rest of the system *any and every time* it changes, we'll get 
inconsistency. The VDOM tackles the *how* of updating the DOM, but it says
nothing about *when* to update it, much less when to do other things like
make network requests.

It's my opinion that in an IO-heavy and/or [retained-mode-GUI](https://en.wikipedia.org/wiki/Retained_mode)
context - which is to say most of what JavaScript gets used for - this is *the* central 
question of any stateful system. State is nearly useless if it can't drive 
the rest of the system, and so observing its changes needs to be treated as a 
central concern.

Redux, setState, and hooks address this problem of "when" by forcing all state
changes through a function call. "When" is "when the function gets called".
There are some problems with this:
- You can never mutate state, only replace it. This is fine with primitives,
but becomes a pain with more complex objects. It's also error-prone because JS 
can't really enforce immutability without a library.
- Dependencies of side-effects have to be tracked manually. This is extremely 
error-prone once your logic becomes nontrivial. Side-effects in this context
include clearing cached derivations if you don't want to re-compute them every
single time; `React.useMemo` takes a dependencies array.

Other frameworks like Vue and Svelte take a different approach: changing state
is more ergonomic, but it's also deeply intertwined with a particular UI 
framework. Lots of magic goes on under the hood to synchronize the two.

It's my belief that MobX is the only one so far to have solved this problem in 
the general case. I won't go too deep into [its concepts](https://www.mobxjs.com/intro/concepts.html),
but I'll give a quick summary.

The idea is that you have:
1. State: mutable, (mostly) plain JavaScript values
2. Derivations: pure expressions incorporating those state values which will 
automatically cache and re-use their latest value until an incorporated piece of 
state changes
3. Effects: side-effect-y functions that incorporate a combination of 1 and 2 
and re-run when those dependencies change

Importantly:
- Derivations and effects track their dependencies **automatically and 
flawlessly**
- State objects/arrays/class instances can be mutated directly using normal 
JavaScript logic and will **automatically publish** to their dependencies when 
they change
- It doesn't matter if dependencies are accessed within inner function calls;
the entire call tree is tracked for the duration of the derivation/effect
- It doesn't matter from what context state gets changed; if the object is 
tracked as a dependency by anything, and anything else modifies it, the change
will find its way to where it needs to be

Effects can then do anything, from updating the DOM to logging, based on this 
information.

How MobX works underneath is out of scope for this article, but it works really
well. There are a couple of caveats, though, because of the limitations of doing
this as a library:
- Dependencies and mutations are tracked via the JavaScript [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
feature. Because of this only *properties* of values can be tracked, not
local variables.
- State values have to be explicitly marked as observable; it's possible to miss 
one.
- Derivations have to be stateless functions or things get weird, but of 
course this can only be enforced by convention in JavaScript.

In practice these aren't huge problems, but together they point to something 
that really feels like it should be a language-level primitive. I believe 
reactivity is an extremely powerful paradigm to use across all kinds of domains,
not just GUIs. The rust-analyzer project even uses it for a [compiler](https://rust-analyzer.github.io/blog/2020/07/20/three-architectures-for-responsive-ide.html#query-based-compiler),
via the [salsa library](https://github.com/salsa-rs/salsa).

And of course you can probably see how this dovetails very nicely with the 
func/proc distinction. Derivations will always be pure, procs will often be 
focused on changing observable state which will then have more pure derivations
made from it. In fact, the plan is for *all* mutable state to be observable. 
None of it can slip through the cracks and go unobserved. It
will be impossible to make the most common mistakes people make with MobX.

As I'm writing this, I just had another idea. I wonder if I could enforce that 
all "outside-system" side-effects are placed inside reactive side-effects, so 
that they can *only* be triggered when the program state changes.

I think there's a ton of interesting stuff to explore here.

## Misc niceties

Here's a grab-bag of other, more straightforward improvements I plan to make 
over JavaScript/TypeScript:
- No null/undefined nonsense; `nil` replaces both
- No triple-equals; double-equals will work the way triple-equals does in JS
- Only single-quotes can be used for strings, and all strings are template 
strings and can be multiline (`'Hello, ${firstName}!'`)
- Emphasis on iterators over arrays for working with sequences (map/filter/reduce/etc),
to avoid needless copying
- Pipeline operator for sending a value through transformation functions 
(`val |> func |> func2`)
- Partial-application/currying supported for all functions and procedures, 
without special syntax
- Range operator for creating iterators of numbers (`5..10`, `0..arr.length`, etc)
- Expressive if/else, possibly also a pattern-matching or expressive switch 
statement. Ternary operators suck.
- Top-level of files is declarations only; no code runs at the top level. A 
`main()` procedure is the entry point for the whole bundle. This will allow 
for smarter tree-shaking and safer module boundaries.
- I would *like* to enforce that `const` means deeply-constant and not 
shallowly-constant. I'm not sure yet whether this will be possible.
- `from './foo' import { bar }` syntax for imports; makes typing and 
autocomplete easier
- Possibly nominal types
- Possibly built-in support for validating JSON and pulling it into the 
expected type, similar to what [io-ts](https://gcanti.github.io/io-ts/) does
- Generic type aliases may be forbidden to prevent type-astronauting; thanking 
Go for proving that a language can succeed without generics (though I think
generic functions will remain)
- Async stuff is going to be easier and less error-prone; might try to do 
automatic [parallelization](https://www.brandons.me/blog/async-await) of async 
dependencies in certain cases. Not sure yet exactly what this will look like, 
but I have some ideas.

## Status and timeline

I technically got my first "counter app" (a GUI with a number and + and - 
buttons) working in Bagel a little while ago,
which was a huge and exciting milestone for me. With that said there are still 
lots of unsolved problems, many of which could require me to rethink fundamental
ideas (which is why I didn't show much in the way of code or examples in this 
post), and even without those there would still be a ton of work to be done. And, to 
emphasize, this is a passion-project, so it's first and foremost about what's
fun for me and that includes the timeline.

With that said I hope people thought this was interesting, and I'll post more 
about Bagel on here once I have more to show. I look forward to any feedback 
that might come my way, and if you *really* want to go spelunking in a 
repository that's broken more often than not, you can find Bagel in its (semi-)current
state on my GitHub.

Thanks for reading, and cheers! 🥯

## Epilogue: The name?

One Sunday I was struggling to come up with a name for this project that was 
starting to turn into something real, and my girlfriend was making bagels. I 
thought the word "bagel" was short, catchy, cute, memorable, and probably 
wouldn't have any name collisions. It also plays into the "two halves" thing
and reduces to the nifty and unused file extension `.bgl` (please don't 
take it! :) ), so it stuck.