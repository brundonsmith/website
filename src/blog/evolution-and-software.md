---
title: "Evolution and Software Development"
date: October 9, 2019
tags: [ "programming", "software-engineering" ]
---

<aside>
    I don't <i>think</i> I was the first person to make this connection, but I 
    did some searching and couldn't find another mention of it, and it's 
    gotten a lot of mileage as a mental tool for me, so here goes.
</aside>

I was at one point introduced to the [recurrent laryngeal nerve](https://en.wikipedia.org/wiki/Recurrent_laryngeal_nerve). 
Put simply, this is a nerve that exists in several types of animals, including 
humans, which instead of taking a very obvious direct path from source to 
destination, wraps hilariously around a major artery before doubling back and 
getting on its way:

<img 
    alt="Diagram" 
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Recurrent_laryngeal_nerve.svg/500px-Recurrent_laryngeal_nerve.svg.png" 
    style="background-color: white"
    height="300">

To quote Wikipedia:

> The extreme detour of the recurrent laryngeal nerves...is cited as evidence 
of evolution, as opposed to Intelligent Design. The nerve's route would have 
been direct in the fish-like ancestors of modern tetrapods...Over the course 
of evolution, as the neck extended and the heart became lower in the body, 
the laryngeal nerve was caught on the wrong side of the heart. Natural selection 
gradually lengthened the nerve by tiny increments to accommodate, resulting in 
the circuitous route now observed.

In other words the incremental changes that led to this outcome made sense, 
yet they resulted in something that _no sane person would have designed from 
the get-go_.

## Sane Software

If you've worked on code that's been around for more than a couple years, you've 
encountered something similar: systems that have evolved gradually -
feature by feature, fix by fix - until the end result of all those changes 
makes no sense when taken as a whole.

Maybe a piece of data gets from one function context to another via a global 
variable, where it could easily be passed in as an argument.

Maybe something gets passed in as an argument where it could be a static 
constant.

Maybe something gets passed from context A to context B through an 
intermediary construct that has no direct concern with it, where it 
could take a more direct route and reduce coupling.

## Refactoring

This isn't a revolutionary idea, but I've found this particular analogy 
helpful for framing things - both in discussions with coworkers and in my 
own head as I'm combing through code. Going beyond the subjective goal of 
"making the code better"; specifically keeping an eye out for weird wandering 
paths in logic, access, whatever.

Much as we like to pretend otherwise, software is an organic thing. It grows
and evolves and ages gradually, over time. It's made by humans, for humans.
And like organisms, it suffers from evolutionary flubs over the natural course
of its development. We can't avoid this.

What we _can_ do, which evolution can't (yet), is step back and look at the 
big picture periodically and ask ourselves whether it still makes sense, or 
whether there's a recurrent laryngeal nerve that we can straighten out.
