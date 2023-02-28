---
title: "Why Rust strings seem hard"
date: April 13, 2021
tags: [ "programming", "rust" ]
---

Lately I've been seeing lots of anecdotes from people trying to get into Rust
who get really hung up on strings (`&str`, `String`, and their relationship).
Beyond Rust's usual challenges around ownership, there can be an added layer of 
frustration because strings are so *easy* in the great majority of languages.
You just add them together, split them, whatever! They're primitives that you
can do whatever you want with. For someone who's only ever known this mental
model (which is to say, never worked much with C/C++), using strings in Rust 
can be a rude awakening. They feel very complicated, have all these 
restrictions and extra steps, and it all just seems so unnecessary.

It's a testament to Rust's breadth and accessibility that even people who have 
never done low-level programming before are giving it a try. This is a good 
thing! But it comes with some extra challenges when you aren't coming in with a 
background in C/C++.

"Go learn C++ and come back" isn't a very reasonable solution to this problem, 
so I wanted to dig into one of the most common issues I see, and give a 
"cliff notes" explanation that hopefully makes Rust a bit more accessible to
more people.

Let's jump into it.

## What is a string, really?

Strings are simple, right? They're just primitives - like numbers or booleans -
that you can create with a literal (`"foo"`), pass around, copy freely, add 
together with other strings (or primitives), return from functions, etc.

Except they aren't.

## Strings are weird

A string is a primitive in the sense that it's fundamental: not many programs 
can accomplish much of value without dealing with strings. But it is *not*
a primitive in terms of implementation.

A distinguishing feature of other primitives like numbers, booleans, etc, is 
that they have a **constant size**. Any two numbers of the same type (an `f64`, 
for example- or a `double` for the Java folks) take up the exact same number 
of bytes in memory. This means we can set aside space for a variable, or a 
function argument, or whatever, and we know that any possible `f64` will be able
to fit there. No matter what math we do on it, no matter how large or small its
value is.

A string, on the other hand, does not have a constant size. If you take string
A and string B, and they aren't identical (`"foo"` and `"foo"`), it's very 
unlikely they have the same size. `"foofoo"` takes up twice as much space in 
memory as `"foo"`.

<aside>
    Technically there will be a tiny amount of extra data, like a length, so it 
    won't be precisely twice the size. But it's close enough for our purposes.
</aside>

This is a problem, because under the hood flat data structures have to have a 
known size at compile-time, even in higher-level languages. Any data whose size 
can't be known at compile-time (or actively changes as the program runs) has to 
live on the heap, and be dynamically allocated as the program runs. This gets 
largely hidden from you in many languages like JavaScript.

<aside>
    The heap is like a big bucket of memory that the system your code is running on
    can lend out. Your program says "I need X bytes for something", and the system
    says "okay here you go". Then if your program later says "actually that wasn't 
    enough, now I need Y bytes", it'll have to take the new chunk, copy everything into 
    it from the old one, and then give the old one back to the system. This is how 
    <code>Vec</code> works! It's also how JavaScript's arrays work, and as we'll 
    find out soon, it's how Rust's <code>String</code> works.
    <br><br>
    So why doesn't this need to happen with things like numbers? Because the 
    compiler can go ahead and designate the right amount of memory right off the 
    bat. It knows it will never have to expand, so it will never have to request
    more memory from the memory-bucket (heap).
</aside>

So when you really get down to it, a string is a data structure living in the 
heap, not a primitive. Roughly speaking it's an array of characters (in C it is 
literally an array of characters). When you add two strings together, the 
program doesn't know in advance how big the result will be, so it needs to 
request the memory 
for it from the heap, as it's running. When you pass a string to a function,
you're really passing a pointer to that heap-allocated array which some other
code can use to look up its contents. The pointer itself, like a number, has a 
constant size.

"But strings are used constantly!" you might be thinking. "We're always slicing 
and dicing and remixing them; it would be insane to have to work with them as 
arrays, much less arrays that have to be manually re-allocated, copied, and 
de-allocated whenever their length changes!"

And you'd be right!

## How most languages handle them

By "most languages" I mean "most of the most commonly-used languages". Which is 
to say JavaScript, Python, Java, C#, Go, Kotlin, Swift, and so on. In all of 
these languages, strings are **immutable**. You may assign a *different* string
into a string slot, but you may not *change* the string itself. The new one
takes its place, the old one is lost to the winds of the garbage collector 
(unless some other code is using it, in which case it gets left alone).

<aside>
    Garbage-collection is a language feature where the system can automatically 
    figure out when some piece of memory it lent out is done being used, and can
    put it back in the bucket so it can then be doled out to someone else.
</aside>

This has a couple of major effects:
1. It completes the illusion that strings are just primitives: numbers and 
booleans are immutable in these languages too! You may assign a *new* number into
a "slot", but you cannot *change* the number per se.
2. It makes working with strings much simpler in many ways. Like with numbers
you can pass a string off to another function (or even another thread!) without
worrying about what will be done to it (and the other code can receive it 
without worrying what yours might do to it). It also dovetails nicely with
automatic garbage-collection, which these languages also have.

<aside>
    Ruby is actually an outlier, which I just learned while researching
    this article! It does have mutable strings, despite being a high-level 
    garbage-collected language.
</aside>

If you're new to C/C++/Rust, this is probably your mental model for strings. 
It's probably ingrained deep in your bones, and peeling back the assumptions
you've formed is understandably a difficult thing to do.

## How C++ and Rust handle them

So how do strings work in C++ and Rust?

Well, the good news is they aren't just plain arrays of characters. Both 
languages give you a data structure wrapped around that character array which
lets you do reasonable operations like append one string onto another, without
manually tracking its length or re-allocating the underlying array as needed.
Those things happen automatically.

The bad news (depending on your perspective) is that the language doesn't hide
as much about them as the languages above. You get/have to work with strings
as a **data structure**, not a **primitive**. In Rust, the `String` struct works 
very similarly  to a `Vec` of characters (or a Python `list`, or a Java 
`ArrayList`, or a JavaScript array, etc), with some added bells and whistles for 
convenience. Like a `Vec` you can add characters onto the end, you can remove 
characters, and you can change characters in the middle. Other code 
that references the same `String` will see these updates. The `String` is a 
thing you very explicitly create (often via `String::new()` or `String::from()`), 
and possibly mutate, and then it gets de-allocated when it goes out 
of scope.

Why do this? Why aren't things simple like in those other languages?

Control. C++ and Rust are designed for use-cases where finely-grained 
control is valuable. For example there are times when you might want to re-use 
an existing 
`String` and replace or add to its contents, instead of allocating a whole new 
one each time you `+` something else with it. Giving people this
level of control means presenting a more complex mental model.

## What about this `&str` thing?

`String` is the closest thing Rust has to the strings you're familiar with in 
other languages, but when you just type out a string literal, you get the type 
`&str`:

```rust
let foo: &str = "What the heck?";
```

A `&str` is a string **slice**. It's a reference (pointer + length) to a segment
of one of those character arrays we've been talking about. If you have a mutable 
slice (`&mut str`) then you can mutate its contents, however you **cannot change 
the length**. A string slice always refers to the same series of bytes in 
memory; you cannot add or remove bytes, because it doesn't know how to 
re-allocate itself if it needs more room. It doesn't even know whether or not 
those bytes live on the heap. It's just a reference.

The key to understanding strings in Rust is to internalize the fact that **every
`&str` needs a place to live**. Often it lives inside a `String` (we can get a 
`&str` from a `String` by calling the `.as_str()` method), but when your
code itself contains a string literal like `"What the heck?"`, the string you're
given points to **a part of your program itself**. Your program's code contains
that character array, so the `&str` can just point to it directly. But it can't
grow or shrink (in fact, in this case it can't even change - you can't get a `&mut str` to 
it) because there's other stuff around it.

## Bringing it all together

I think the first wall lots of people hit with Rust strings is something like 
this:

```rust
let a: &str = "hello ";
let b: &str = "world";

let c = a + b;
```

```rust
error[E0369]: cannot add `&str` to `&str`
 --> src/main.rs:4:15
  |
4 |     let c = a + b;
  |             - ^ - &str
  |             | |
  |             | `+` cannot be used to concatenate two `&str` strings
  |             &str
  |
help: `to_owned()` can be used to create an owned `String` from a string 
reference. String concatenation appends the string on the right to the string 
on the left and may require reallocation. This requires ownership of the string 
on the left
  |
4 |     let c = a.to_owned() + b;
  |             ^^^^^^^^^^^^
```

"What the heck? I have to call a method before I can add two strings together? 
This language sucks!"

But step back and think about it in the context of our new understanding: `a` 
and `b` live in our program's code, which can't be modified. So if we add them 
together, where does the new string live?

Well, it's going to have to live in a `String`. The language doesn't know how 
big it will need to be ahead of time, so we need to make a dynamic place for it
that can adjust to whatever size necessary.

Where do we get that `String`? Well, we have some options there! We could 
create one separately:

```rust
let a: &str = "hello ";
let b: &str = "world";

let mut new_string: String = String::new();

new_string.push_str(a);
new_string.push_str(b);

let c = new_string.as_str();
```

That's a little clunky though. Fortunately, Rust makes our lives a little 
easier. In Rust the `+` operator will take a `String` on the left
and a `&str` on the right, and it will call `.push_str()` on the 
left `String`, **mutating** it so that it now holds a copy of the `&str`'s 
contents, and then the `String` will be the result of the addition. So this 
will work:

```rust
let c = String::from("hello ") + "world";  // c is a String, not a &str!
```

and is equivalent to this:

```rust
let mut new_string: String = String::from("hello ");
new_string.push_str("world");
let c = new_string;
```

Okay, one last thing: what's that `.to_owned()` method suggested in the error
message? `.to_owned()` is a Rust method that several data types implement, and
is intended for exactly this situation. From the docs:

> [`ToOwned` is] A generalization of Clone to borrowed data.
>
> Some types make it possible to go from borrowed to owned, usually by implementing the Clone trait. But Clone works only for going from &T to T. The ToOwned trait generalizes Clone to construct owned data from any borrow of a given type.

That's a bit technical, but the gist is that when you have a 
non-mutable reference to something, but you need to mutate it, etc (which we do! 
because we need to put `"world"` somewhere), you call this method and it gives 
you a copy that you can do whatever you want with. In the case of `&str`, this 
copy ends up in the form of a `String`. So:

```rust
let foo: String = "some &str".to_owned();
```

When you've got two `&str`s that you want to add together into a new `String`,
this is arguably the cleanest way to do it, which is why it's so conveniently 
suggested by the compiler:

```rust
let foo: String = "hello ".to_owned() + "world";
```

## Conclusion

Whew! That was longer than I thought it'd be.

Rust is a uniquely powerful language, and despite all its challenges, it's
uniquely accessible in some ways. It's minting tons new low-level
programmers who otherwise were/would've been scared off by C/C++. That's 
fantastic!

But being productive in it means learning how certain things really work, or
you'll constantly be fighting with the compiler (which is still better than 
having constant bugs!). Hopefully I've shed light on one of those subjects 
today.

To summarize: every piece of string content in Rust has to live 
somewhere. That somewhere can be in a quoted string literal, inside a `String` on 
the heap, or somewhere else. When you're working with strings, you have to think
about where the content actually lives/will live. If you don't have a place to put it,
your code won't compile. If a reference/slice outlives the string content it's
pointing at (borrowing is a topic for another day), your code won't compile.
Incorporate this "where" into your mental model, and you'll have a much easier
time getting your code to work.

Happy Rusting! 🦀