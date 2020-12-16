---
title: Write code. Not too much. Mostly functions.
date: December 15, 2020
tags: [ "programming", "software-engineering" ]
---

There's a well-known quote by author [Michael Pollan](https://en.wikipedia.org/wiki/Michael_Pollan):
"Eat food. Not too much. Mostly Plants." I like it because it doesn't 
attempt to be dogmatic: it encapsulates some basic guiding principles that get 
you 90% of the way there 90% of the time. Wikipedia describes the book the quote 
is from (emphasis mine):

> He explains...the notion that nutritionism and, therefore, the whole Western 
framework through which we intellectualize the value of food **is more a religious 
and faddish devotion to the mythology of simple solutions than a convincing and 
reliable conclusion of incontrovertible scientific research**.

That...sounds familiar.

## Write code

Code, like food, has value. I think those of us who write it can (hopefully) 
agree on that. Some, though, are so afraid of writing/eating 
*too much* that they avoid writing/eating what they should.

In the context of programming, I think this translates to an unhealthy fear 
(again, for some) of duplication. A little bit of duplication - writing 
something in a way that doesn't completely maximize conciseness - isn't the end
of the world. Sometimes it's the best path forward. Sometimes it's okay to 
copy-and-modify here and there, especially when you're still figuring out what
your application will end up being.

## Not too much

Of course too much code, like too much food, can also be a bad thing. This is
a well-trodden topic so I don't feel the need to go too far into it here.

Just be aware of your project's "appetite": write what needs to be written, 
and then try not to over-indulge.

## Mostly functions

By "functions" here I mean "pure functions". You could make a case that pure 
functions aren't the "plants" of code, though I feel
that they are. In my experience most codebases have a pure functional 
subset, and I believe writing that subset in a pure-functional style is nearly
always a win for the long-term health of the project.

Of course the qualifier is "mostly": this isn't a dogma. Writing a 100% 
functional system ("going vegan", if you will) often requires you to jump 
through a bunch of extra hoops to get all the functionality you need. Looking
at it solely from the perspective of health, those extra complications may not 
be worth it.

And then different projects have different needs: just as an athlete may need 
a larger percentage of protein, or individuals may have certain nutrient 
deficiencies, a project may have a very small functional subset, or may not
be able to afford to return new values each time due to data size or 
performance-sensitivity. There's nothing wrong with that.

## "Real code"

Pollan later qualifies his snappy statement a bit further:

> He contends that most of what Americans now buy in supermarkets, fast food 
stores, and restaurants is not in fact food, and that a practical tip is to eat 
only those things that people of his grandmother's generation would have 
recognized as food.

At the risk of stretching the analogy, maybe the equivalent is 
"code only those things that people at a junior level would recognize for what
they do". Code in simple, straightforward terms. Don't get too clever, 
"manufacturing artificial ingredients". Use the primitives that are there, when 
possible. Write what is simple, and natural, and human.