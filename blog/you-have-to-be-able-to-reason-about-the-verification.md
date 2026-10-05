---
title: You have to be able to reason about the verification
date: October 5, 2026
tags: []
---

Lots of people are no longer reading code. Agents are at a point where you can make software, as a black box, that might do what you wanted it to do. Maybe then you poke at it, and it doesn't do one of the things you wanted it to do, and then you tell your agent to make it do that thing, and now it does that thing too, and you never had to look at the code.

Whether this is a good idea or not in any particular case depends on a whole lot of things! But it is something that people are doing more and more, and on the spectrum between throwaway scripts and critical infrastructure, I think we can all agree that some fraction of the code that gets written can actually now be written blind.

But what does "blind" mean? We still look at its behavior, even if we don't see the code. We still see if the output of that script looks plausible, we still see if the interface looks right and seems to do what we wanted. We still _verify_, one way or another, that the artifact made by AI is roughly what was intended, even if we don't verify it by reading the code.

We normally hear the word "verification" in the context of tests, type systems, or formal proofs. Those things are part of this conversation too. But even if we don't use them, _verification is always there_. No matter what, we check somehow that we've produced what we want.
## Agents writing tests
It's common to have AI write tests for its own code. There's nothing wrong with this- tests [carry a burden of writing and maintenance](/blog/thoughts-on-testing), just like code does, and tests that are automatically written do still have value. But their value is _different_, depending on whether or not we do or even can read them.

Who verifies the verifier? Just like our other code, how do we know that the tests are doing what we intend? If we treat tests as a black box too, they _don't actually solve_ the verification problem, they just move it around.
## Two kinds of tests
We might look at tests as being one two kinds:
1. Ones that are used by the developer (or agent) to check their own work against mistakes
2. Ones that are used by the stakeholder (human, in this context) to verify that requirements are being met

The first kind has value, but the second kind is still required. And the second kind only works if _the stakeholder can personally verify the tests themselves_. Even if they didn't write the tests, the tests are an expression of their intent, and are useless as verification unless they are read and understood. A green suite of unit tests that you've never read may (or may not) internally help the agent with its work, but they _say nothing to you as an outsider about the state of your software_.
## It's not really about tests
There are lots of ways to verify software- manual QA, unit or integration tests, static types, formal verification, or even adversarial AI review (against some spec or list of requirements). Each has different tradeoffs in terms of maintenance burden, agility, rigor, manual labor, and suitability to a given problem space.

What's important is that _there's some kind of proof in the pudding_ that a _human brain can make sense of_. There always will be. Even (in the extreme) "did this break in production?" is verification, though we'd really like to find out before that point.

So, for any given code you're not going to read, think about: how and when will I find out if this does what I want? Maybe manual testing here and there is enough. Maybe just visual inspection, or a test run that looks fine. Maybe your risk profile allows you to ship it straight to users and do logging. Or maybe you need a formal proof.

Whatever it is, just remember: _the AI can't do that for you_. You have to digest it and think about it, even if it's the very last thing you still have to think about.
