---
title: Casual Parsing in JavaScript
tags: ["programming", "javascript"]
date: August 16, 2021
---

Over the last year and a half I've gotten really into writing parsers and 
parser-adjacent things like interpreters, transpilers, etc. I've done most of 
these projects in JavaScript, and I've settled into a nice little pattern that
I re-use across projects. I wanted to share it because I think it's neat, and
it's brought me joy, and it could be an interesting or entertaining thing for
others to follow along with!

<aside>
    There are lots of ways to write parsers (and lots of libraries for doing 
    so), and many of them are going to be more sophisticated, more flexible, 
    more performant etc than what I do here. This is just the way I've enjoyed 
    doing things, and it strikes a good balance between flexibility, simplicity, 
    and accessibility.
</aside>

<aside>
    I'm going to use TypeScript instead of plain JavaScript because I think it 
    makes it easier to illustrate what's really going on, and because that's 
    what I end up doing in my own projects. But you could just as easily remove 
    all the type declarations from this code and run it as-is.
</aside>

This doesn't aim to be a comprehensive tutorial on parsing (for that I 
recommend the excellent 
[Crafting Interpreters](https://craftinginterpreters.com/), which is how I 
learned!), but I want to make it accessible to people who may be new to this
world, so I'm going to give a quick introduction. Feel free to skip the next 
section if you already know how recursive-descent parsing works in general.

## What is a parser?

A parser is a program that takes a (code) string as input, and outputs a 
structured representation of that code to some other logic, usually in the form 
of an "Abstract Syntax Tree" (or AST). An AST is a tree-like structure
where each node in the tree represents some syntax concept found in the source 
code- maybe a particular if statement, or a function call, or a class 
definition. It's a tree because many nodes "contain" other nodes: an if 
statement will contain its condition and the block of statements associated 
with that condition.

Each of these AST nodes normally corresponds to a **grammar rule**. A grammar
describes the syntax constructs of a language, so for example, here's a 
simplified grammar for JSON:

```
; Any entire JSON value
<json>   ::= <object> | <array> | <number> | <string> | <boolean> | <null>

; A sequence of 'members'
<object> ::= '{' [ <member> *(', ' <member>) ] '}'  

; A pair consisting of a name, and a JSON value
; (note this isn't referenced directly by <json>!)
<member> ::= <string> ': ' <json>

; A sequence of JSON values separated by commas
<array>  ::= '[' [ <json> *(', ' <json>) ] ']'
```

Don't worry about learning this particular syntax. It doesn't matter. What
matters is the idea that a grammar rule (or AST node) is a 1) named thing 
("object", "array", "number"), 2) potentially made up of other rules/AST nodes 
nested inside of it. A parser, generally, moves through a string of source code
and assembles an object-tree by matching the rules in a grammar.

One final piece of terminology: we'll be implementing a "recursive descent 
parser". This is the most common kind of parser, and gets its name from the fact
that we recursively descend through function calls associated with each grammar 
rule, looking for AST nodes inside of each other. I just wanted to give you a
term to Google in case you want to learn more.

## The task

For the sake of example we're going to be parsing JSON. It should be familiar 
to everyone, it's got a lovely little grammar with no real ambiguity, and
it's not super complicated.

We are going to skip some of the exotic corner-cases it has around number 
representation and string escapes, though. The point of this post is to be fun
and interesting, not to write a production-grade JSON parser (not that you'd 
ever roll your own in JavaScript anyway when there's one built into the 
language!).

I shared a JSON grammar above, but I'll repeat it here for reference:
```
<json>   ::= <object> | <array> | <number> | <string> | <boolean> | <null>

<object> ::= '{' [ <member> *(', ' <member>) ] '}'  
<member> ::= <string> ': ' <json>
<array>  ::= '[' [ <json> *(', ' <json>) ] ']'
```

The recursive-descent functions and AST nodes will for the most part mirror 
this grammar.

## Getting started

The first thing I like to do when I'm using TypeScript is define my AST:

```typescript
type AST = JSONObject | JSONArray | JSONString |
           JSONNumber | JSONBoolean | JSONNull

type JSONObject = {
    kind: 'object',
    members: Member[]
}

type Member = {
    kind: 'member',
    key: string,
    value: AST,
}

type JSONArray = {
    kind: 'array',
    members: AST[]
}

type JSONString = {
    kind: 'string',
    value: string
}

type JSONNumber = {
    kind: 'number',
    value: number
}

type JSONBoolean = {
    kind: 'boolean',
    value: boolean
}

type JSONNull = {
    kind: 'null'
}
```

Thanks to TypeScript's union types, this maps quite neatly to the grammar. For 
a more complex grammar, you can even divide AST nodes into hierarchies, allowing
you to narrow down the types that can be used in different contexts later on:
```typescript
type AST = Collection | Primitive

type Collection = JSONObject | JSONArray

type Primitive = JSONString | JSONNumber | JSONBoolean | JSONNull

...
```

This isn't very useful in the case of JSON though, so I won't do it here.

<aside>
The <code>kind</code> property on each of these is used later to <b>discriminate</b> these union 
members. For those curious, there's more info on that concept <a href="https://github.com/basarat/typescript-book/blob/master/docs/types/discriminated-unions.md">here</a>. The general
idea is that when we're handling a value of type <code>AST</code>, we'll need a way 
to figure out which <b>kind</b> of AST we actually have. We'll do this by checking
its <code>kind</code> property.
</aside>

Okay, so next I'm going to define a type for our grammar-parsing 
functions:
```typescript
type ParseResult<T> = undefined | {
    parsed: T,
    newIndex: number
}

type ParseFunction<T> = (code: string, index: number) => ParseResult<T>
```

Basically `ParseResult<T>` is "the 
result of trying to parse a `T`", and `ParseFunction<T>` is "a function that 
tries to parse a `T` from `code` starting at `index`.

`ParseFunction` takes both `code` and an `index` because we're going to be doing
this a whole lot, so it's probably better to move an index along the string
instead of copying substrings of it left and right. I know JS has some 
optimizations around creating substrings, but this still felt right to me.

`ParseFunction` returns a `ParseResult`, which is `undefined` if the 
sought-after entity was *not* found, and an object if it *was* found. That 
object contains the `parsed` entity, as well as a `newIndex` into `code` at
the *end* of the entity that was parsed. This tells the next stage of parsing
where to start from.

## Some utilities

So those are our core domain types. Next we'll switch gears and establish some 
very useful utility functions.

### given()

This function is useful in all kinds of projects:
```typescript
function given<T, R>(val: T|undefined, fn: (val: T) => R): R|undefined {
    if (val !== undefined) {
        return fn(val);
    } else {
        return val as undefined;
    }
}
```

It's not super clear from looking at the definition, so here's how you use it:
```typescript
const obj = { }

const result = given(obj.someProp, someProp => {
    return someProp + 12
})
```

If the first argument is **not** undefined, the function is evaluated with the
non-undefined version of the value. If it **is** undefined, it falls through. The 
return value from `given` itself is undefined if the input was undefined, or 
the return value from the inner function otherwise.

The gist is that it allows you to compute the result of some expression, but 
only if some value exists to be used in it. It can also be chained:
```typescript
const obj1 = {}
const obj2 = {}

return given(obj1.someProp1, someProp1 =>
       given(obj2.someProp2, someProp2 =>
        someProp1 + someProp2))  // <- Note the two closing parens! These are just nested function calls

```

Some of you might recognize this as a crude version of a monadic "map", from 
Haskell, Rust, etc.

### consume()

```typescript
function consume(code: string, index: number, segment: string): ParseResult<string> {
    for (let i = 0; i < segment.length; i++) {
        if (code[index + i] !== segment[i]) {
            return undefined;
        }
    }

    return {
        parsed: segment,
        newIndex: index + segment.length
    }
}
```

This function's signature is very similar to `ParseFunction`, but not quite the
same. It takes a third argument, `segment`, which is an exact string you want 
it to find (as opposed to most parse functions, which try to find any variation 
on a given syntax). This will be used for everything from keywords to 
punctuation. It just says "find this exact thing if you can"; very simple.

### consumeWhile()
```typescript
function consumeWhile(code: string, index: number, fn: (ch: string, index: number) => boolean): ParseResult<string> {
    let newIndex = index;

    while (code[newIndex] != null && fn(code[newIndex], newIndex)) {
        newIndex++;
    }

    if (newIndex > index) {
        return {
            parsed: code.substring(index, newIndex),
            newIndex
        }
    }
}
```

This one has a similar signature to `consume()`, except it takes a function 
instead of a string. What it does is iterate
through `code` starting at `index`, testing each **character** against `fn`. It
keeps going until `fn` returns false. If it consumes at least one character, it
returns that "parsed" substring and the new index.


### consumeWhitespace()

This one's implemented in terms of `consumeWhile`, making it a perfect example 
of the above:

```typescript
function consumeWhitespace(code: string, index: number): number {
    return consumeWhile(code, index, ch => /[\s]/.test(ch))?.newIndex ?? index
}
```

Another very commonly-used utility (and also with a similar function signature 
and semantics), this function just says "advance so long as we're in 
whitespace". When it hits non-whitespace (or the end of the string), it returns 
the new index. Most languages, including JSON, don't care about most whitespace,
so being able to skip through it trivially is very handy.

Note that this one can't return `undefined`, and doesn't return the "parsed"
whitespace, because we don't actually care what it finds or whether it even
finds anything. We just want it to skip through whatever is there.

### optional() and series()
```typescript
function optional<T>(parseResult: ParseResult<T>): Partial<ParseResult<T>> {
    return {
        parsed: parseResult?.parsed,
        newIndex: parseResult?.newIndex,
    };
}

function series<T>(code: string, index: number, itemParseFn: ParseFunction<T>, delimiter?: string): { parsed: T[], newIndex: number } {
    const items: T[] = []

    index = consumeWhitespace(code, index);
    let itemResult = itemParseFn(code, index);
    while (itemResult != null && index < code.length) {
        index = itemResult.newIndex;
        items.push(itemResult.parsed);

        itemResult = 
            delimiter !== undefined
                ? given(consumeWhitespace(code, index), index =>
                  given(consume(code, index, delimiter), ({ newIndex: index }) =>
                  given(consumeWhitespace(code, index), index =>
                    itemParseFn(code, index))))
                : given(consumeWhitespace(code, index), index =>
                    itemParseFn(code, index))
    }

    return { parsed: items, newIndex: index }
}
```

These two work similarly to regular expressions' `?` and `*`, respectively. In 
fact, most grammar notations use the same two control-characters for the same 
purposes.

The first function handles when something may or may not be there, **and it's
not a failure to parse**. It converts a parse object that may or may not exist 
into a parse object that definitely exists but whose *properties* may or may 
not exist. This makes things a little smoother in combination with `given()`, 
as we'll see later.

The second function is for handling when there's a series of things, usually 
delimited by some other token. It will try to apply `itemParseFn` over and over,
optionally `consume()`ing `delimiter`s in-between, and then returns the whole
series.

<aside>
If you're paying close attention you may notice that we're using 
<code>given()</code> on values that can't ever be <code>undefined</code>
(specifically, the result from <code>consumeWhitespace()</code>). This
may seem redundant. <br><br> The purpose is to act like <code>const index = consumeWhitespace(...)</code>,
but in the context of an expression. This has some advantages like limiting 
the value's scope, but mostly it just looks nicer.
</aside>

## Framing everything

One last bit before we get into actually parsing some JSON. The bulk of our
parsing logic will take the form of descending through functions corresponding 
to grammar rules, but at the very top we need something slightly different:

```typescript
function parseJSON(code: string): AST[] {
    const foundASTs: AST[] = []
    let index = 0;

    let previousIndex: number|undefined
    while (index < code.length && previousIndex !== index) {
        previousIndex = index

        index = consumeWhitespace(code, index);
        
        const parseResult = ast(code, index);
        if (parseResult !== undefined) {
            index = parseResult.newIndex;
            foundASTs.push(parseResult.parsed);
        }
    }

    return foundASTs;
}
```

This is our entry point: we take a string (no starting index!), and output a 
series of ASTs. We loop through, parsing AST after AST until we reach the 
end. Before each attempted `ast()` parse, we go ahead and skip over 
any whitespace.

<aside>
    Technically a JSON string can only have one root value (AST), but the great
    majority of languages you might want to parse can have N top-level items, 
    so for the sake of example we'll allow any number here, too. Anyway,
    newline-delimited JSON is a <a href="http://ndjson.org/">pseudo-standard</a>! 
</aside>

## Finally parsing

Alright, so as referenced in `parseJSON()`, the first thing we need is an 
`ast()` function that parses our root `AST` type:
```typescript
const ast: ParseFunction<AST> = (code, index) => undefined
```

`undefined` is a handy placeholder when we're stubbing these functions out,
because it's a valid return value for `ParseFunction` ("I didn't find 
anything!"). Given that, I'm going to go ahead and stub out all of our main 
parse functions:

```typescript
const ast: ParseFunction<AST> = (code, index) => undefined
const jsonObject: ParseFunction<JSONObject> = (code, index) => undefined
const member: ParseFunction<Member> = (code, index) => undefined
const jsonArray: ParseFunction<JSONArray> = (code, index) => undefined
const jsonString: ParseFunction<JSONString> = (code, index) => undefined
const jsonNumber: ParseFunction<JSONNumber> = (code, index) => undefined
const jsonBoolean: ParseFunction<JSONBoolean> = (code, index) => undefined
const jsonNull: ParseFunction<JSONNull> = (code, index) => undefined
```

Once again, we're closely following the grammar here. And looking back at the 
grammar from earlier, our first node is actually now very easy to implement, 
because it just delegates to the other ones:
```typescript
const ast: ParseFunction<AST> = (code, index) =>
    jsonObject(code, index)
    ?? jsonArray(code, index)
    ?? jsonString(code, index)
    ?? jsonNumber(code, index)
    ?? jsonBoolean(code, index)
    ?? jsonNull(code, index)
```

<aside>
    We're using JavaScript's new-ish "null coalescing" operator here. For those
    unfamiliar, if the expression on the left is null or undefined, it "falls
    through" to the following expression. So this chain above will try one
    thing at a time until it finds a successful (non-undefined) parse result.
</aside>

## Keywords

Alright, so now let's move on to the other low-hanging fruit. `null` is going
to be the simplest to parse from scratch, especially given our utility functions
from earlier:

```typescript
const jsonNull: ParseFunction<JSONNull> = (code, index) =>
    given(consume(code, index, 'null'), ({ newIndex: index }) => ({
        parsed: { kind: 'null' },
        newIndex: index
    }))
```

This is the basic pattern that the rest of our parsing functions are all going 
to follow. We:
1) Attempt to `consume` the exact string `'null'`
2) If `consume` returns `undefined` ("not found"), then that will fall through 
`given` and the whole function will return `undefined`
3) If `consume` returns a new `index`, then `null` was found and we move on to
the next step
4) In this case that was the only step, so we assemble a `ParseResult` and 
return it alongside the new index

Next we'll do booleans:
```typescript
const jsonBoolean: ParseFunction<JSONBoolean> = (code, index) =>
    given(consume(code, index, 'true'), ({ newIndex: index }) => ({
        parsed: { kind: 'boolean', value: true },
        newIndex: index
    }))
    ?? given(consume(code, index, 'false'), ({ newIndex: index }) => ({
        parsed: { kind: 'boolean', value: false },
        newIndex: index
    }))
```

This is very similar to `null`, except there's two of them, chained together 
using another null-coalescing operator.

## Numbers

```typescript
const jsonNumber: ParseFunction<JSONNumber> = (code, index) =>
    given(consumeWhile(code, index, ch => /[0-9]/.test(ch)), ({ parsed: frontOfNumber, newIndex: index }) =>
    given(optional(consume(code, index, ".")), ({ newIndex: indexAfterDot }) =>
        given(indexAfterDot, index =>
        given(consumeWhile(code, index, ch => /[0-9]/.test(ch)), ({ parsed: endOfNumber, newIndex }) => ({
            parsed: {
                kind: 'number',
                value: Number(frontOfNumber + '.' + endOfNumber)
            },
            newIndex
        })))
        ?? ({
            parsed: {
                kind: 'number',
                value: Number(frontOfNumber)
            },
            newIndex: index
        })))
```

So first we `consumeWhile` we're in numeric digits (if none are found, we'll 
get `undefined`).

Next, we check for an optional `.` (a number may be an integer or a 
floating-point value). Since we're using `optional()`, the `given` clause will
*always* move forward, even if `indexAfterDot` is undefined.

Given `indexAfterDot`, we attempt to consume another series of digits. If we 
find them, we combine the "front" and "back" of the number back into a string
and parse it into an actual JS number using `Number()`.

If we *don't* have `indexAfterDot`, we fall through via the `??` operator and
just return the "front" (integer) portion as our parse result (parsed to a real 
number via `Number()`).

## Strings

```typescript
const jsonString: ParseFunction<JSONString> = (code, index) =>
    given(consume(code, index, '"'), ({ newIndex: index }) => {
        const startIndex = index

        let escaped = false

        while (escaped || code[index] !== '"') {
            if (code[index] === '\\') {
                escaped = true;
            } else {
                escaped = false;
            }

            index++
        }

        return {
            parsed: {
                kind: 'string',
                value: code.substring(startIndex, index)
            },
            newIndex: index + 1
        }
    })
```

Unfortunately with strings we have to break out of our pretty pattern and get 
into a little bit of procedural code. This is mainly because of escape characters- they
prevent you from treating each character in isolation and force you to add some
state that changes over time. The good news is, since we're hand-writing this parser, embedding some
more traditional code into our parsing rules is easy and ergonomic.

Here we've got a flag `escaped` which tells us whether or not the previous 
character was a backslash (and whether therefore the current quote should be 
ignored). It gets set on a back-slash, and cleared on any other character. If
we encounter a quote, and it's not escaped, we've reached the end of the string 
and we can return our parse result.

## Arrays

```typescript
const jsonArray: ParseFunction<JSONArray> = (code, index) =>
    given(consume(code, index, '['), ({ newIndex: index }) =>
    given(consumeWhitespace(code, index), index =>
    given(series(code, index, ast, ','), ({ parsed: members, newIndex: index }) =>
    given(consumeWhitespace(code, index), index =>
    given(consume(code, index, ']'), ({ newIndex: index }) => ({
        parsed: {
            kind: 'array',
            members,
        },
        newIndex: index
    }))))))
```

I love this one. This type of compound-structure is really where this pattern
shines (and when parsing a real language, syntaxes like this are 
probably going to make up the bulk of your parsing work).

It reads almost like English, but I'll walk through it anyway:
1. Consume a `[`
2. Skip any whitespace
3. Parse a **series** of `ast`s, delimited by `,`s. Note how we're able to 
pass it our top-level `ast` function directly!
4. Skip any whitespace
5. Consume a `]`

If any of these steps fails (returns `undefined`), we fall through and the 
whole function returns `undefined`.

## Objects (and members)

```typescript
const jsonObject: ParseFunction<JSONObject> = (code, index) => 
    given(consume(code, index, '{'), ({ newIndex: index }) =>
    given(consumeWhitespace(code, index), index =>
    given(series(code, index, member, ','), ({ parsed: members, newIndex: index }) =>
    given(consumeWhitespace(code, index), index =>
    given(consume(code, index, '}'), ({ newIndex: index }) => ({
        parsed: {
            kind: 'object',
            members,
        },
        newIndex: index
    }))))))

const member: ParseFunction<Member> = (code, index) =>
    given(jsonString(code, index), ({ parsed: { value: key }, newIndex: index }) => 
    given(consumeWhitespace(code, index), index =>
    given(consume(code, index, ':'), ({ newIndex: index }) =>
    given(consumeWhitespace(code, index), index =>
    given(ast(code, index), ({ parsed: value, newIndex: index }) => ({
        parsed: {
            kind: 'member',
            key,
            value
        },
        newIndex: index
    }))))))
```

Last one. You may notice that `jsonObject()` is almost identical to 
`jsonArray()`, except that a) we look for `{ }` instead of `[ ]`, and b) we look
for a series of `member`s instead of `ast`s. Each entry in an object has to be
a key-value pair, not just a lone JSON value.

So we break out those key-value pairs into a separate function, `member()`.
This one reads quite naturally too:
1. Parse a `jsonString` (we can re-use the parse function we wrote earlier!)
2. Skip any whitespace
3. Consume a `:`
4. Skip any whitespace
5. Parse any `ast`

The value in the key/value pair can be any JSON value, so at the last part we 
use our top-level parse function again, just like in `jsonArray()`.

## Summary

And, we're done! You can test out this parser like so:

<aside>
    You can run the code through `tsc`, or strip out the types yourself, but my
    favorite way to play with TypeScript is to use <a href="https://deno.land/">Deno</a>,
    which is similar to Node but runs TypeScript files directly!
</aside>

```typescript
const testJSON = `
{
    "foo": "bar",
    "blah": 12,
    "blah2": 12.0,
    "other": [
        false,
        true,
        null,
        {
            "stuff": [],
            "other": "sfdgh\\"abc"
        }
    ]
}`
const parsedAst = parseJSON(testJSON)

console.log(JSON.stringify(parsedAst, null, 2))
```
```json
[
  {
    "kind": "object",
    "members": [
      {
        "kind": "member",
        "key": "foo",
        "value": {
          "kind": "string",
          "value": "bar"
        }
      },
      {
        "kind": "member",
        "key": "blah1",
        "value": {
          "kind": "number",
          "value": 12
        }
      },
      {
        "kind": "member",
        "key": "blah",
        "value": {
          "kind": "number",
          "value": 12
        }
      },
      {
        "kind": "member",
        "key": "other",
        "value": {
          "kind": "array",
          "members": [
            {
              "kind": "boolean",
              "value": false
            },
            {
              "kind": "boolean",
              "value": true
            },
            {
              "kind": "null"
            },
            {
              "kind": "object",
              "members": [
                {
                  "kind": "member",
                  "key": "stuff",
                  "value": {
                    "kind": "array",
                    "members": []
                  }
                },
                {
                  "kind": "member",
                  "key": "other",
                  "value": {
                    "kind": "string",
                    "value": "sfdgh\\\"abc"
                  }
                }
              ]
            }
          ]
        }
      }
    ]
  }
]
```

Under normal circumstances you could then take this AST and interpret it,
compile it to another language, lint or refactor it, or even type-check it!
But those things are out of scope for this post (and most of them don't really 
apply to JSON anyway), so we're going to end things here.

### Caveats

I left some things out, both in terms of the JSON spec and -
perhaps more relevant - in terms of parser features. If you were building a
production-grade parser, one of the first things you'd want to add to this would
be error messaging: right now, if it fails to parse a top-level AST, it just 
doesn't add anything to the array.

Another issue with doing things this way is that it can be wasteful in more 
complex grammars. Without getting too far in, let's
just say there are cases where you can end up trying to parse the same
rule from the same starting point lots of times over and over, resulting in 
nontrivial slowdowns.

I actually have solutions to both of these problems that fit nicely inside 
this overall approach, but I left them out of this post for the sake of brevity 
and fun. Maybe I'll do a follow-up post about making this pattern more
real-world suited if people enjoy this one.

### Takeaways

With all that said: I think this pattern works pretty well as-is for 
prototyping and experimenting (and [jamming](https://github.com/langjam/langjam)!).
It allows me to quickly write out readable new parsing rules without taking
my fingers off the keyboard or backtracking at all, and they usually work the
first time. And the set of building-blocks is small enough that I can write them 
again from scratch whenever I need to; there's no need to pull in a big library 
each time. It's been a delightful experience and I wanted to share it.

I've also come to
believe TypeScript is a fantastic language for writing parsers/compilers, at 
least until you hit the point where you're compiling some seriously large
projects. I barely got to touch on it in this example, but its ability to
define ad-hoc discriminated union types and organize them into hierarchies as
needed turns out to be amazingly productive when you're building out an AST
and logic that consumes ASTs.

I hope you found this interesting and I hope I inspired someone out there to
try making their own languages or dev tools for the first time. It's a blast, 
and it's not as intimidating as it may seem from the outside.
