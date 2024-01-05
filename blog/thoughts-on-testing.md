---
title: Thoughts on Testing
date: January 4, 2024
tags: ["programming", "software-engineering"]
---

Today I was thinking about tests.

## Skepticism

I'm skeptical of tests. I'm not _against_ tests (even though my coworker opened
a conversation today with "I know you hate tests" and I quickly projected my
voice across the office as I said "I don't hate tests!" just to make sure
everyone knew), but _a lot of people really love tests_ and I sometimes feel
like I have to pour some cold water on that.

## Cost

The thing is that _tests are code_, and _all code is technical debt_, but unlike
normal code tests can grow without bounds, and they don't always get seen as a
something with a cost because they don't get shipped to production. But every
test is...

Code that takes time to write

Code that takes time to maintain (when requirements change, dependencies change,
etc)

Code that takes time running in CI

And bad tests can give a false sense of security

So I think it's fair to say that (despite certain engineering books and
management directives) _the optimal number of tests isn't as many as we can
possibly come up with_.

## Judgement calls

So what is the optimal number of tests? It depends, but here are some ways I
like to frame the question

### "Is this something static analysis can test?"

Anything that can be checked by static types, linting, etc, is better caught by
those than by tests. A whole lot of things can't, but this is a starting point.

It's not just personal preference: static analysis prevents entire classes of
bugs at once, while tests cover individual inputs. You always might forget to
write a test for an edge case, but a type checker won't.

But static analysis isn't available in every language, and in those unit tests
become more important as they try to fill that gap.

### "How often will the behavior _intentionally_ change?"

This question tells us how often we'll get false-positives (tests that need to
"be fixed"). Consider two functions having tests written for them:

The first is a [fibonacci](https://en.wikipedia.org/wiki/Fibonacci_sequence)
function. The fibonacci sequence is well-defined, it has a clear definition, it
will never change. If we test a given input + output combination, and our test
fails, it will _always_ mean our code is broken. There will _never_ be a
false-positive (failed test when the implementation is actually doing what we
want it to do), because if we ever wanted `fib(3)` to equal `100`, we're no
longer talking about a fibonacci function.

Imagine another function that returns a greeting message containing a person's
name (eg. `"Hello, Brandon!"`). Suppose we write a test that checks that
`greet("Brandon")` returns `"Hello, Brandon!"`:

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

test("greeting is correct", () => {
  expect(greet("Brandon")).toBe("Hello, Brandon!");
});
```

Now, suppose that the product manager comes to us one day and says, "We have a
new design, we'd now like it to say
`"Greetings Brandon, welcome to our website!"`

```javascript
function greet(name) {
  return `Greetings ${name}, welcome to our website!`;
}

test("greeting is correct", () => {
  expect(greet("Brandon")).toBe("Hello, Brandon!"); // fail
});
```

We change the code behavior, and now our test fails! But the failure isn't
because we introduced a bug, it's because _we changed our mind_. The new message
is now the _correct_ behavior of `greet()`, and so the test is now incorrect and
needs to be updated. Time spent "fixing" the test is pure overhead.

Put differently: what's the definition of "correct" for the code being tested,
and how durable is that definition?

Most cases aren't as clear-cut as these two, but in general:

- Really general utilities are unlikely to need their behavior changed
- Core business logic is unlikely to need its behavior changed (depending on how
  close it is to feature churn)
- Surface behaviors like user interfaces (more on this later) are more likely to
  intentionally change

### "Does the test just mirror the logic being tested?"

Consider the following:

```javascript
function calculation(n) {
  return n * 2 + 6;
}

test("calculation returns correct output", () => {
  const n = 4;
  expect(calculation(n)).toBe(n * 2 + 6);
});
```

This hasn't told us anything interesting about the logic being tested, we're
just writing it twice. It'll tell us if `calculation`'s behavior _changed_, but
not if it's _wrong_. Good tests check against _intent_ instead of _behavior_.
Example:

```javascript
function isEligible(age) {
  if (age < 18) {
    return false;
  } else {
    return true;
  }
}

test("isEligible returns correct output", () => {
  expect(isEligible(100)).toBe(true);
  expect(isEligible(22)).toBe(true);
  expect(isEligible(16)).toBe(false);
});
```

Here we're documenting a _meaningful concept_ in our test that isn't directly
represented in the code being tested, and so it's more likely to be _stable over
time_ than implementation details.

### "Is the test simpler than the implementation?"

Along the same lines, a good candidate for testing is code that's complicated
enough for its behavior to be _hard_ to just copy in a test. A great function to
test is one where _you're not sure it's going to do the right thing just by
looking at it_.

For code like this, the test will be simpler than what it's testing. "Test
intent instead of implementation"; the _intent_ of most code will be simpler
than the implementation, and we want the test to reflect the intent.

### "How much does the code being tested interact with the outside world?"

Mocking adds a ton of complexity and reduces the amount of functionality
actually being tested. It makes code both harder to test and less valuable to
test.

But it's unavoidable when you're testing code that's coupled to external
systems. Unit tests that rely on outside systems are never a good idea; they can
break mysteriously and inconsistently.

Sometimes mocking can be avoided by re-structuring your code, but sometimes it
can't be. If it can't be, the need for lots of mocking is one clue that a piece
of code might not be worth (unit) testing.

### "How important is this code?"

Of course, the more business-critical a piece of code is, and/or the more
widespread its use is (eg. a core component used in lots of places), the more
valuable it is to test. It may be worth testing `coreBusinessRule` even if the
implementation is trivial, even if our test can only make sure it doesn't change
by surprise. It may be worth dealing with a ton of mocking just to make sure the
testable part of an auth flow prevents illegal operations. Everything is a
judgement call.

## Integration tests

So far I've been talking about unit tests, but integration tests are different
in certain ways, especially the mocking question: almost by definition you
aren't really mocking systems, you're testing the interactions between them that
are otherwise hard to test.

Other rules still apply though: writing tests that reflect intent (eg, "click
the button with the label 'Submit'") instead of implementation ("click the third
`<button>` tag on the page") will make them less fragile. Favoring tests that
check valuable behavior ("can the user log in?") over tests that check
unvaluable behavior ("is the submit button blue?") makes the best use of your
effort. Etc.

## UI tests

I hinted above, but my controversial take is that _I think UI rendering code is
rarely worth unit-testing_ based on these heuristics. User interfaces:

- Often change output/behavior intentionally (leading to flaky tests)
- Often (not always!) have trivial logic that's easy to verify by looking at it
- Are usually tightly coupled to their framework/platform, requiring elaborate
  mocking and test suite plugins

_But_ I really only mean the rendering layer, not the entire front-end codebase:

- State management decoupled from the UI (React hooks, stores, etc) can be a
  great candidate; that's where most of the complexity is, and it doesn't have
  most of the problems above
- Business rules like validation are also great to test; the logic is often pure
  (which makes it super easy to test), and they often have really stable
  definitions of "correct" and "incorrect" (when was the last time the meaning
  of "valid phone number" changed?)
- Any other core utilities that are far away from user-facing feature churn

And then, a library of UI components that are really general and used in a bunch
of places may tip the scales towards unit testing. The value is higher, and the
cost (of mocking, etc) is usually lower because they're meant to be reusable.
They may also change less often than product features.

## Closing thoughts

I don't hate tests (I promise, Avid!), I just try to question them on a case by
case basis, and I haven't met a lot of people who do.

They have a very real organizational cost, which as engineers we need to be
aware of. Having more of them makes more little green things light up in the
console and makes that coverage number go up, so it feels good to add them. But
like anything, testing needs to be done with consideration.
