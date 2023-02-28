---
title: My Favorite Rust Function Signature
date: September 16, 2020
tags: [ "programming", "rust" ]
---

I've gotten really into writing parsers lately, and Rust has turned out to be 
the perfect language for that. In the course of my adventures, I came up with
the following:

```rust
fn tokenize<'a>(code: &'a str) -> impl Iterator<Item=&'a str> {
  ...
}
```

and it really deepened my appreciation for Rust.

## What does this function do?

For those not familiar with parsing, tokenization is the first step of the 
process. It takes a raw code string, like this:

```rust
let a = "foo";
```

and turns it into a linear series of meaningful tokens, like so:

```rust
["let", "a", "=", "\"foo\"", ";"]
```

This phase isn't terribly complicated, but it simplifies the mental model for 
the next pass: constructing an "abstract syntax tree". It removes whitespace 
from the equation, bundles up segments like strings and numbers, and just 
generally makes the code in the next pass cleaner.

The downside is that, if you perform this as a separate pass, your parser now 
has to iterate over all of the source code *twice*. This may not be the end of 
the world: tokenizing isn't the most expensive operation. But it isn't ideal,
so some parsers combine the two passes into a single one, saving cycles at the 
expense of readability.

## What's going on in the Rust version?

I'll copy the signature here again for reference:

```rust
fn tokenize<'a>(code: &'a str) -> impl Iterator<Item=&'a str> {
  ...
}
```

There are several things going on here.

`&str`, in Rust, is a "string slice". It's effectively a character pointer and a 
length. The contents of the slice are guaranteed to be in valid, alive memory.
`&'a str` is a string slice *with a lifetime*. The lifetime `'a`, to be 
exact. This lifetime describes a limited span of time in which the 
reference (and the full contents of the slice) are guaranteed to be in valid, 
alive memory. More on this later.

`Iterator<Item=&'a str>` is an iterator over elements of type `&'a str`. This
is a *trait*, though, not a concrete type. Rust needs a concrete type with a 
fixed size when you're defining something like a function, but luckily we can 
say `impl Iterator<Item=&'a str>`, which tells Rust, "fill in some type that 
implements `Iterator<Item=&'a str>`, to be inferred at compile-time". This is 
very helpful because in Rust there are lots and lots of different concrete types 
for `Iterator`; applying something like a `map()` or a `filter()` returns a whole 
new concrete type. So this way, we don't have to worry about keeping the 
function signature up to date as we work on the logic.

## So what's so great about all this?

Okay, so we have a function that takes a reference to a string slice and returns
an iterator over string slices. Why's that special? There are two reasons.

### Iterators let you treat one pass like it's two

Remember how I said you traditionally have to pick between doing a separate 
tokenization pass, and doing a single pass with all the logic interleaved? With
an iterator, you can have the best of both worlds.

When this function completes, it hasn't yet iterated over the string. It hasn't 
allocated any kind of collection in memory. It returns a structure that's 
*prepared* to iterate over the input string slice and produce a sequence of new 
slices. When this value later gets `map()`ed into something else, or 
`filter()`ed, or any other `Iterator` transformations get applied, the stages 
of the process get interleaved, and the "loops" effectively get folded into a 
single one. By doing this, we're able to get the clean abstraction of a 
tokenizing "pass" without the runtime overhead of a second loop!

But other languages have iterators. Rust's may be extra powerful and ergonomic,
but they aren't a totally unique feature. The next part is very much unique to
Rust.

### Lifetimes let you share references fearlessly

The `tokenize()` function doesn't allocate any new memory for a collection of
tokens. That's great. But what may be less obvious is that it *also* doesn't 
allocate any memory for the tokens themselves! Each string slice representing a
token is a *direct pointer to part of the original string*.

You can do this in C/C++, of course, but there's a danger: if those tokens are
ever accessed after the original code string has been freed, you'll have a 
memory error.

For example: let's say you open a file and load the source code from it, and 
store the result in a local variable. Then you `tokenize()` it and send the 
tokens on to somewhere else outside of the function where the original string
lived. Voilà, you've got a [use-after-free error](https://en.wikipedia.org/wiki/Dangling_pointer).

One way to guard against this is by copying each string segment into a *new* 
string, allocated on the heap, which allows you to safely pass it on after the
original string is gone. But this comes with a cost: creating, copying, and 
eventually disposing of each of those new strings takes time (and memory). Code 
down the line also has to be aware that it's responsible for de-allocating those 
strings, otherwise they'll leak.

This is where the magic of lifetimes comes into play.

Rust prevents the above situation entirely. Normally, though, to accomplish this 
a `&str` coming into a function from elsewhere must be assumed to be *static*, 
or to be alive for the entire duration of the program's execution. This is the 
status assigned to, for example, a string literal that you've manually entered 
into your Rust code. Rust doesn't know, in the context of the function, how 
long that reference will be valid, so it must be pessimistic.

**But.** That little `'a` says: "these things all live for the same span of time". We 
can *assert* that the original source code string lives at least as long as the 
*tokens* that reference it. By doing so, Rust can reason about whether or not
those resulting token references are valid at a given point, and therefore 
doesn't have to assume them to be static! We can do *whatever we want* with 
those tokens and the compiler will guarantee that they always point to something 
valid, even if the source code is loaded in dynamically at runtime (from a file 
or otherwise). If we find out later via a compiler error that they really do 
need to outlive the source string, then we can copy them ("take ownership") at
that point. If the compiler doesn't force us to do so, we know we're safe, 
and we know we can continue using the most efficient possible approach, 
*fearlessly*.

What we've effectively done is written the most optimistic possible function 
(in terms of memory safety), with no downsides, because the Rust compiler will
tell us if we're misusing it and force us to then "step down" to whatever level 
of extra accommodation is needed.

## Conclusion

I've been using (and loving) Rust for about a year and a half now. And there are 
many things to love, but when I got this function working I immediately saw it 
as a microcosm of what really sets the language apart. This is something that 
you **cannot do** both a) this safely and b) this efficiently **in any other 
language**. This is the power of Rust.