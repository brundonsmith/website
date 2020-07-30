---
title: Beware of Async/Await
date: July 29, 2020
tags: [ "programming", "software-engineering" ]
---

Can you spot the problem with this piece of code?

```javascript
async function getPeople() {
  const members = await fetch("/members");
  const nonMembers = await fetch("/non-members");

  return members.concat(nonMembers);
}
```

Take a minute to look. Code just like this probably exists in more JavaScript codebases 
than not. Sometimes it flies right under the nose of people who know better, 
myself included. In fact a case where I made this mistake was what prompted me 
to write this post in the first place.

I'll give you a hint. Here's what it looks like without async/await syntax:

```javascript
function getPeople() {
  return fetch("/members")
    .then(members => fetch("/non-members")
      .then(nonMembers => members.concat(nonMembers)))
}
```

Do you see it now? It was actually tricky to even write this version, because 
this mistake is so hard to make *without* async/await.

Here's what the above looks like in the network log:
![Staggered waterfall](/img/blog/async-await/staggered.png)

We've taken two independent, asynchronous tasks, and put them into a **sequence**. 
This function takes twice as long as it needs to.

Here's what it should be:
```javascript
async function getPeople() {
  const members = fetch("/members");
  const nonMembers = fetch("/non-members");
  const both = await Promise.all([ members, nonMembers ]);

  return both[0].concat(both[1]);
}
```

Or, without async/await:
```javascript
function getPeople() {
  const members = fetch("/members");
  const nonMembers = fetch("/non-members");

  return Promise.all([ members, nonMembers ])
          .then(both => both[0].concat(both[1]));
}
```

And here's what that looks like:
![Parallel waterfall](/img/blog/async-await/parallel.png)


## Easy mistakes

Take note how much more complicated the "bad" version was when written as plain
promises. The Promises API encourages parallelism, and gets clunky when you need to put 
things in sequence. Async/await largely arose as a solution for when you *do* 
need things to happen in sequence, like when you need to feed the output of one 
request into the next as a parameter. And it does arguably make both cases at 
least a little cleaner. But importantly, it inverts them, making **the 
sequential flow easier than the parallel flow**.

Even if you understand the Promises code that the syntax ends up translating to, it's 
easy to fall into this trap. If you *don't* already understand Promises and 
what exactly async/await is really doing, even more so.

I wouldn't go so far as to say that async/await are "bad" (or perhaps, 
["considered harmful"](https://en.wikipedia.org/wiki/Considered_harmful)). 
Especially in languages that don't have a reasonable API like Promises, or do 
have other restrictions around closures that make them less trivial to use, 
async/await can make code much more readable overall.

But they do come with a pretty large pitfall. Both the strength and the weakness of
the syntax is that it allows us to take asynchronous things and pretend they're 
sequential again. Our brains have an easier time reasoning about sequential
processes.

But I think it's a shame that the easiest and clearest way to write
something with async/await is, more often than not, wrong. And wrong in a subtle
way that may never be noticed, because it only affects performance, not
correctness.

I'm a big believer in languages and libraries that make it easy to do the 
thing that's usually right, and hard to do the thing that's usually wrong. That
said, I don't have a proposal for how async/await could have been done 
differently. I just regret the way things turned out.

But at the very least, I think it's increasingly important - as more and more 
languages adopt this syntax - that people are aware of how it can easily be 
misused.

## Mitigating the problem

If you're ever not sure how your code is behaving, look at the 
waterfall graph and see if you might have an easy opportunity to make your 
application much faster.

You can also use this rule of thumb: If an `await`ed 
function call doesn't use the result from another `await`ed function call (or 
something derived from the result), you should use `Promise.all()` to make 
them happen at the same time.