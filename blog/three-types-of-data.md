---
title: "Three Types of Data"
date: February 5, 2020
tags: [ "programming", "software-engineering" ]
---

In my work I've developed a mental framework related to data modeling, which has helped greatly
both when coming up with a model and when making decisions down the road about how to use that model. Here I 
will establish three different categories of data in software: Constants, State, and Cached Values. 
By "data" I generally mean "variables in code", but the same principles could be applied to files on 
a disk, or tables in a database, or whatever else.

These three categories are disjoint: that is, if a piece of data falls into one of them, it should
not also be treated like one of the others. Different languages will vary in their ability to express
this constraint via the type system or otherwise, so it's better to think of it as a convention or
a frame of mind (though if you *can* actually enforce it, that is of course all the better). Always
ask yourself which category a given piece of data belongs to, and then adhere to the rules around
that category when working with it. In my experience, any program's data needs can be roughly 
expressed in terms of these three categories alone. 

It's important to note that these are high-level categories of usage: what purpose is served, what
operations should or should not be allowed, what assumptions can be made. These **are not** directly 
equivalent to other uses of the terms "constant", "state", and "cache", and while concepts like 
immutability may be loosely relevant, I'm purposely expressing these ideas in a language-agnostic and 
style-agnostic way.

I also want to note that there's a lot of philosophical overlap between this and my previous post ("Procedures, Functions, Data").
That one categorized *logic* where this one categorizes *data*, but the ideas are very similar. 
Still, I felt that the ideas contained here were independently useful enough to deserve their own post.

Let's get started.

## Constants
A Constant, in this context, is **information that doesn't change during the course of running the 
program**.

This may correspond to the `const` keyword in many languages, though some, like JavaScript, can't 
enforce it recursively down the object tree. Immutable data structures *could* be used to help enforce it,
although it's not quite what they're designed for (more on this under the State heading). It could 
also take the form of a configuration file, or a command-line argument. A Constant may be changed over the 
course of *development*, but not over the course of *runtime*.

## State
State is **information that naturally changes during the course of running the program**.

Often this consists of mutable values. It can also consist of immutable data structures, whose
express purpose is to allow you to have State without mutability (in them, new States are derived 
from the previous State combined with some new information). Even monad-based I/O, in languages
like Haskell, falls into this category.

Any program that does more than convert a set of inputs to a set of outputs has State. That includes
not only graphical interfaces and video games, but web servers, operating systems, and control
software. Even programs written in languages like Clojure and Haskell can have state; they just 
massage it into a form where it's as un-stateful as possible.

Here's why they do that, though: State is toxic. Even though it is necessary. A program should
have *as little State as it can possibly get away with*. In a perfect world, that means no piece 
of information should ever be represented in two different pieces of State. If you find yourself
writing code to "synchronize State" between different variables, that's an enormous code smell 
and you should scrutinize it closely.

## Cached Values
Cached values are **information that is derived directly from Constants and/or State**.

A Cached Value is similar to a Constant, but in practice will probably use the same 
language feature as your State, because at the top level, it can and will change (otherwise 
it would be a Constant!).

A Cached Value is like State that should only ever changed in one specific way: the re-computation 
of its value as a result of a change in *actual* State (usually via a pure function). It should 
never be mutated, only replaced.
It is a good use-case for an immutable data structure, with one important stipulation: unlike
State, *its new value should never depend on its previous value*.

Cached Values are an optimization over pure function calls (or stateless API requests, database reads, etc.). 
In most cases you could decide not to use them at all and always make the pure calls 
directly, you would just repeat work and/or have to wait on the network again. As such, they should 
be treated as *always* disposable. 
Unlike State, which embodies an untraceable accumulation of past things that have happened to it 
(or in Haskell's case a traceable accumulation), Cached Values are *trash*. They can disappear and 
be re-computed at any time, for any reason. This is why they must never be relied upon as State: changes to them 
can and will be thrown away without notice.

They *are* in some sense a duplication of information - which we said in the case of State is 
always to be avoided - but it's okay because they're a special, 
*disposable* duplication of State. "Synchronizing" them is always as simple as a single, 
controlled operation. It can happen anywhere, at any time, with no concerns to anything 
except performance (wasting effort).

## Summary
To summarize:
- Constants are neither replaceable nor mutable
- State is arbitrarily replaceable and mutable
- Cached Values are replaceable under specific circumstances but not mutable

Every piece of data in a program can be framed as a member of one of these categories (technically 
every piece of data could be framed as State, but that's what we're trying to minimize). But what 
does this net us?

A Constant:
- Never needs to be observed or compared for changes
- Can, usually, be made global (access probably doesn't need to be scoped because it's immune 
to side-effects)
- Can in some languages be reasoned about at the type level: not only its shape but its exact 
value can be enumerated at build-time
- Is contagious: a pure function of only Constants can also be treated as a Constant!

A Cached Value can be:
- Easily substituted for a call to a pure function; this makes certain optimizations, like 
[memoization](https://en.wikipedia.org/wiki/Memoization), trivial to "tack on" after the fact (with 
an annotation, for example), without restructuring your code
- Updated/refreshed at any time; "how" the value gets decided is decoupled from "when" it gets decided
- Discarded to save memory, again without losing any information (unlike real State)

By adding constraints we subtract possiblities, which means both we and our code can do certain 
things that would be intractably risky otherwise.

Any piece of State that can be converted to a Cached Value should be. Any piece of State or Cached Value that can 
be converted to a Constant, should be. By ushering parts of our program into more and more 
constrained possibility spaces we simplify it, and with simplicity comes fewer bugs, easier 
refactoring, and better understandability.