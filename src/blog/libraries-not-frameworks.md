---
title: "Write Libraries, Not Frameworks"
date: May 8, 2020
tags: [ "programming" ]
---

Normally when I write about something on here I take the time to think out a 
handsomely-formed point, make a strong argument, and address all the major sides 
of the issue that I can think of.

But I am exhausted from fighting with a codebase this week, so this is not going 
to be one of those posts. I'm going to try a little stream-of-consciousness 
blogging.

When a programmer thinks to herself "I've got some code or an idea for some 
code here that I think will make others' lives easier", there are generally two 
broad-strokes forms that code can take: a library, or a framework.

A library is a set of building blocks that may share a common theme or work
well together, but are largely independent.

A framework is a *context in which someone writes their own code*. This could
take the form of inversion-of-control, a domain-specific language, or just a 
very opinionated and internally-coupled library. It's a spectrum; there's no 
hard line between the two. One way to tell if something is a framework is to 
ask yourself, "Could I use this in combination with something else like it? Or
has it established ways of doing things that are mutually-exclusive with other
ways those things might be done?"

Frameworks' key trait is that they impose *limitations* on the programmer. 
Rather than *providing* a set of new things the programmer can do, they 
establish a *boundary* on the things the programmer can do. In exchange for 
flexibility they often eliminate boilerplate, establish a touchstone for new 
libraries to be built on top of them, and allow a programmer's skills to become 
more transferrable beteen projects. In fact, sometimes the limitations 
themselves are desirable! After all, type systems are nothing but a way of 
imposing limitations on code. Limitations are not intrinsically *bad*.

**However.** When you write a framework that you expect others to build real 
projects with (i.e. it isn't just a toy), you are taking on a much greater 
responsibility than you would with a library.

A framework, usually, must predict ahead of time every kind of thing a user of 
it might need to do within its walls. For each piece of the puzzle that it 
assimilates into its own vocabulary, it must take over responsibility for that 
set of tasks. It must not only take care that every task that needs to be done 
in it *can* be done, it ideally needs to offer a *better* way of doing those 
things than the way they would be done normally. Otherwise, why use it?

This translates to the developer experience as well. Does your framework 
introduce convention-based behaviors that go beyond the base langauge? You'd 
better thoroughly document those, or users will become hopelessly lost. Do you 
introduce a domain-specific language? You're now responsible for part of the 
build chain, and for editor integration.

Now, if there's a major organization backing the framework, maybe the calculus
works out. Google can back Angular, Pivotal can back Spring, Epic can back 
Unreal Engine. These are the cases where the framework approach can work out,
because there exist the resources and the will to really cover all of the bases 
that need covering.

But if there is not a major organization; if the project is written and 
maintained by an individual, or a startup, or a small team who isn't central to 
their company, it almost certainly should err on the "library" side
of things. With a library, editor integration and documentation of core concepts 
are more likely to remain in the hands of the language matinainers themselves. 
With a library, any shortcomings - in the form of bugs, missing documentation, 
missing functionality, lack of continued maintenance, combatibility with other
libraries, etc. - are much more likely to be able to be papered-over with custom
code or with pieces from other libraries. With a library, the good bits can be 
used piecemeal without having to throw the whole thing away because of one 
problem that nobody's ever going to fix in the trunk.

So here's my point: frameworks aren't always bad, but they are a much bigger 
risk - for both the creators and the users - than libraries are. If your 
framework can be a library without losing much, it probably should be. If you
don't work at a major tech company, you probably don't have the time or energy
to give a framework all of the attention it requires. Libraries aren't 
everything, but they should be preferred.