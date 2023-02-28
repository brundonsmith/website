---
title: Procedures, Functions, Data
date: November 23, 2019
tags: [ "programming", "software-engineering" ]
---

Functional programming is all the rage these days. There are piles of Medium posts out there singing 
its praises, preaching the good word. And for good reason! It can be a powerful paradigm for reducing
code duplication and preventing sprawling side-effects.

However, in most real programs, in most languages, there will be state. There will be procedural
code that walks through steps line by line and produces side-effects. So what I'd like to talk about
here is how, within this non-pure reality, you can get some of the benefits of the functional style. 
Oh, and I'm also going to talk about data.

<aside>
    I'm using the word "procedural", but you may be more familiar with the word "imperative". I use
    them interchangeably to talk about "traditional" code: a <strong>sequence</strong> of steps that 
    accomplish their goal by <strong>changing</strong> things.
</aside>

## What makes functional programming so great?

I won't deep-dive into this question. Hundreds of bloggers have done it already, most of them probably
better than I would. What I will do is state what I believe to be functional programming's most 
important quality:

> Functional programming is a more limited form of expression than procedural programming.

Functional programming, to me, is defined by what it *doesn't let you do*. A pure function takes inputs,
returns an output, and doesn't interface with the outside world in any other ways. This limitation of 
syntax empowers you to *overcome* limitations of human engineers. In fact, I would generalize this phenomenon 
into a rule:

> A concept should be expressed in the most limited syntax it can possibly be represented by.

One kind of limited syntax is functions, and as we'll see later, data is another.

## A sample program

Okay, so let's get literal. Imagine a hypothetical app for a tailor. There's a `Person` class
which represents a customer, and has a `name`, `height`, `waist`, and `gender`, with the middle two expected
to be in inches.

The database, however, was created before our current app was around, and its data has a few
quirks. The customer names are all in lowercase, the measurements are in centimeters, and the gender is 
just a single letter. We'd like to iron out those values when we initialize our `Person` objects:

```javascript
class Person {
    initialize(objectFromAPI) {
        this.name = objectFromAPI.name[0].toUpperCase() + objectFromAPI.name.substr(1);
        this.height = objectFromAPI.heightInCentimeters / 0.394;
        this.waist = objectFromAPI.waistInCentimeters / 0.394;

        if(objectFromAPI.gender == 'M') {
            this.gender = 'male';
        } else if(objectFromAPI.gender == 'F') {
            this.gender = 'female';
        }
    }
}
```

A little bit gross, but then the circumstances are a little bit gross. We can make it better, though.

## Looking for functions

The first thing I want to point out is that *how we're getting the new values* is tangled up in *what 
we're doing with them*. Let's see what happens if we extract those into pure functions:

```javascript
class Person {
    initialize(objectFromAPI) {
        this.name = capitalized(objectFromAPI.name);
        this.height = centimetersToInches(objectFromAPI.heightInCentimeters);
        this.waist = centimetersToInches(objectFromAPI.waistInCentimeters);

        if(objectFromAPI.gender == 'M') {
            this.gender = 'male';
        } else if(objectFromAPI.gender == 'F') {
            this.gender = 'female';
        }
    }
}

const capitalized = (str) => str[0].toUpperCase() + str.substr(1);
const centimetersToInches = (num) => num / 0.394;
```

This isn't more concise. It may be a little more readable because of the naming, and it 
certainly reduces some duplication when converting from centimeters to inches, but those aren't
the important benefits of this change. The important benefit is that *some of our code is now purely functional*.
This pure section of our code cannot produce side-effects. This fact eliminates entire categories 
of potential hidden bugs that no longer even have to be watched for, because they are now impossible.

On top of that, because these expressions are now isolated from their previous context, they become more clearly
usable elsewhere. Even copying and pasting an expression from the first version of this code would have been risky:
it could be referencing *anything* in the local scope, including `this`, our class instance itself! By pulling the 
expressions into pure functions, we're forced to declare all of the values they care about right up front,
and we discover that they really only care about a very small part of what they used to have access to. `capitalized`
and `centimetersToInches` both turn out to be generically useful building blocks that wouldn't be out of 
place in a `utils.js` file.

## Looking for data

There's another thing tangled up in our procedure, though: hardcoded pairings of values. The fact that
`'M'` corresponds to `'male'` and `'F'` corresponds to `'female'` aren't *procedural* concepts. In
one sense, they're functional. The `fullName` of `'M'` is `'male'` and the `fullName` of `'F'` is `'female'`:

```javascript
class Person {
    initialize(objectFromAPI) {
        this.name = capitalized(objectFromAPI.name);
        this.height = centimetersToInches(objectFromAPI.heightInCentimeters);
        this.waist = centimetersToInches(objectFromAPI.waistInCentimeters);
        this.gender = fullName(objectFromAPI.gender);
    }
}

const capitalized = (str) => str[0].toUpperCase() + str.substr(1);
const centimetersToInches = (num) => num / 0.394;
const fullName = (letter) => 
    letter == 'M' ?
        'male'
    : letter == 'F' ?
        'female'
    :
        null;
```

And indeed! This gets us the same benefits we got from the first two function conversions. However,
even a pure function is more open-ended than necessary in this case. `fullName` could do *anything* with `letter`.
All it actually needs to do is match it up with a pre-determined value. Plus, right now it has to re-do those 
comparisons every time it's called.

Really what we're looking at here, is data:
```javascript
class Person {
    initialize(objectFromAPI) {
        this.name = capitalized(objectFromAPI.name);
        this.height = centimetersToInches(objectFromAPI.heightInCentimeters);
        this.waist = centimetersToInches(objectFromAPI.waistInCentimeters);
        this.gender = FULL_GENDER_NAMES[objectFromAPI.gender];
    }
}

const capitalized = (str) => str[0].toUpperCase() + str.substr(1);
const centimetersToInches = (num) => num / 0.394;

const FULL_GENDER_NAMES = {
    'M': 'male',
    'F': 'female'
}
```

By simplifying our representation even further, we've cut out even more contingencies. This isn't even
an expression: it's just *information*. In the specific case of JavaScript you could even break `FULL_GENDER_NAMES`
out into its own `.json` file.

Another thing that data can do is be stored in and requested from a database. Let's say
we want to make `FULL_GENDER_NAMES` not hardcoded, but stored in a SQL table, so that we can easily incorporate
any gender identities we may have missed, at runtime. If this data was interlaced into our procedural code, we'd
have no choice but to wait for a full rebuild and deploy process. But if it's *data*, we can just have the app
grab it on start-up. It can be amended and that will propagate to all users, instantly, without a new build.

Data is also more versatile. What if we wanted to list out all possible genders in a drop-down? In our 
original implementation - or even the pure-functional one - the concept "all possible genders" was represented
in an impenetrable way. It could only be used to convert the single-letter form into the full-word form. So we'd 
have to hardcode that information in a second place, just so we could *use* it in a different way, which opens up the
possibility of the two becoming inconsistent. If they're represented as data, on the other hand, we can just *use* 
the information we've already written down.

There's one other piece of data we can extract from our procedure: hardcoded property names. Those names
are paired up with functions, and that set of pairings could be represented statically.

<aside>
    Accessing object properties by string names isn't something you can do in all multi-paradigm
    languages. However, the idea of representing part of your logic as data still has value, as in the
    first example.
</aside>

```javascript
class Person {
    initialize(objectFromAPI) {
        PROPERTIES.forEach(property => {
            this[property.key] = property.transform(objectFromAPI[property.apiKey]);
        })
        this.gender = FULL_GENDER_NAMES[objectFromAPI.gender];
    }
}

const capitalized = (str) => str[0].toUpperCase() + str.substr(1);
const centimetersToInches = (num) => num / 0.394;

const TRANSFORMED_PROPERTIES = {
    { thisKey: 'name', apiKey: 'name', transform: capitalized },
    { thisKey: 'height', apiKey: 'heightInCentimeters', transform: centimetersToInches },
    { thisKey: 'waist', apiKey: 'waistInCentimeters', transform: centimetersToInches },
}

const FULL_GENDER_NAMES = {
    'M': 'male',
    'F': 'female'
}
```

Now we've really boiled down our procedural code to its essence. There are only *two* actual imperative
statements now. That means we can watch those side-effects all the more closely, to ensure they don't
do something we don't want. Nothing nefarious can hide in plain sight. Static information is represented 
as static information, pure expressions are represented as pure expressions, and only the *necessarily* 
side-effect-y logic is represented as code that even *has the opportunity* to have side-effects.

## Takeaways

It's my opinion that procedural code is necessary. It really is the clearest way to express certain 
concepts. However it's also extremely powerful, which makes it a huge liability. It's *too* powerful for 
many cases, and if it's too powerful, it shouldn't be used. This is why, in my work, I always look for 
opportunities to eliminate procedural code. By doing so, I not only rescue parts of my program from its 
risks, I also distill the procedural part into a clearer representation of its domain.

Let me leave you with this rule of thumb:

> If a procedure can be made into a function, it should be. If a function can be made into data, it should be.