---
title: "Grasping React Hooks"
date: February 2, 2022
tags: ["programming", "react"]
---

Hooks are weird, and can be hard to reason about. They kind of (but don't actually!) establish a new domain-specific language on top of JavaScript, with its own set of rules and behaviors, and they can make it easy to lose track of what's actually really happening in your code.

It's very possible to do your job without fully "getting" hooks. It's just that every once in a while, you trip over a weird edge-case or performance trap, and the abstraction cracks, and you don't necessarily know what to do about it. I've heard many capable React devs talk about having blind spots when it comes to hooks, so I wanetd to write a post that hopefully shines some light on a more foundational (but still pragmatic) understanding of how hooks work, and what causes them to behave the way they do.

<aside>
    But what about the official docs?
    <p>
        React's official docs are great, but when covering hooks they tend to focus on how to <i>use</i> hooks, rather than how they work or how to think about them. This is probably for the best as a starting point, but it leaves room for a different kind of explanation.
    </p>
</aside>

## Anatomy of a React component

```jsx
function CollapsibleSection({ heading, content }) {
    const [visible, setVisible] = useState(true)

    function toggleVisible() {
        setVisible(!visible)
    }

    return (
        <div>
            <div onClick={toggleVisible}>{heading}</div>
            {visible &&
                <div>{content}</div>}
        </div>
    )
}
```

<aside>
    Due to the subject matter and React's current trajectory, we're going to skip class-based components and stick to function-based components.
</aside>

A (modern) React component is defined by the user as a function. When the component gets rendered by React, the function gets executed. It computes some stuff, possibly calls some hooks, and at the end it returns some JSX content. React then takes this JSX content and renders it.

When React decides the component needs to _re_-render, the function gets called again. All the hooks get called again, all the consts and/or functions get created again, and then the JSX is constructed again and returned.

When does React decide a component should be re-rendered? There are two main cases:
1. Its parent component re-renders
2. One of its `useState` "setter functions" is called (more details in the next section)

To reiterate: when either of these things happens, the entire component function runs again.

<aside>
    <code>React.memo()</code> carves out an exception to the above: when a component is passed through this higher-order component and case 1 happens, its props will first be compared against what they were on the last render. If they're equal, the component will skip rendering. Case 2 is unaffected by <code>React.memo()</code>. If you don't already know what <code>React.memo()</code> is, don't worry about it for this post.
</aside>

## useState()

`useState()` is probably the most important hook: It is the only way a component can tell React it needs to re-render.

<aside>
    Well, except for <code>useContext()</code>. But <code>useContext()</code> is fairly niche, and it works on mostly the same principles (just for multiple components instead of one), so I'm skipping over it in this post.
</aside>

`useState()` seems really simple; it's definitely the most straightforward of the hooks. But being a hook, it does have a couple of sneaky nuances that are good to have a firm grasp on. Let's bring back that example from earlier:

```jsx
function CollapsibleSection({ heading, content }) {
    const [visible, setVisible] = useState(true)

    function toggleVisible() {
        setVisible(!visible)
    }

    return (
        <div>
            <div onClick={toggleVisible}>{heading}</div>
            {visible &&
                <div>{content}</div>}
        </div>
    )
}
```

- Every time `CollapsibleSection` is rendered (the first time as well as subsequent times), `useState()` gets called again and gets passed `true`. Even if `visible` has since changed to `false`!
- If `useState()` were initialized with a more complex expression - say, `useState({ someProp: a + b })` - that expression would be evaluated again on every render. Even if, again, the state has already been replaced with another value! That new object would just be thrown away by `useState()` on every render after the first one.
- If the state held by a `useState()` hook has *not* changed since the previous render (meaning we're re-rendering either because a parent component rendered, or because some other `useState()` had its state changed), then the two values returned by it will be the *exact same* values that were returned last time. `setVisible`, in our example, will not just be a function that does the same thing as the previous `setVisible`; it will be the *exact same* function instance. We'll see why this is important in a minute.

Calling `useState()` feels like we're just declaring something one time, but it's actually code that gets called over and over. This is intentional, and it's a trait of hooks as a category.

## useEffect()

This is the other big one. Nearly all other hooks could be redefined with just `useState()` and `useEffect()`!

`useEffect()` is for when we want to trigger some side-effect **outside** of React's jurisdiction. This might be a network request, or logging, or a DOM or browser effect that can't be described in JSX, etc. That process may involve calling some setters from `useState` - like if you need to store the result of a fetch request somewhere - but it should not be *just* state changes.

Let's add a `useEffect()` to our running example:

```jsx
function CollapsibleSection({ heading, content }) {
    const [visible, setVisible] = useState(true)

    function toggleVisible() {
        setVisible(!visible)
    }

    useEffect(() => {
        if (visible) {
            Logger.log(`Section ${heading} visible`)
        } else {
            Logger.log(`Section ${heading} hidden`)
        }
    }, [visible, heading])

    return (
        <div>
            <div onClick={toggleVisible}>{heading}</div>
            {visible &&
                <div>{content}</div>}
        </div>
    )
}
```

So this will log "Section foo visible", or something like that, as relevant.

There's a question that may come up here: why does this need to be wrapped in a `useEffect()` at all? Why can't we just call `Logger.log()` on its own, as part of the render function?

Well, technically we could. But there are two main reasons we don't want to:
1. Separating it out gives React more flexibility in how it schedules work. This is a complicated topic and out of scope for this post, so I'll leave it at that.
2. `useEffect()` gives us more control over the circumstances under which the effect should happen (or really, when it *shouldn't* happen)

Remember how I said the *entire* render function executes every time (1) the parent component renders, or (2) any `useState()` setter is called?

Well, we probably don't want our `log` call to run on *every* render. It might log the exact same thing several times in a row. And what's more, whoever's looking at our logs probably doesn't care to know the details of how often this particular UI component got re-rendered! They probably care to know when it was interacted with- when it changed state.

To this end, we pass `useEffect()` a "dependencies array" as the second argument. Every time the component re-renders for any reason, it sets up our `useEffect()` anew, and it passes the dependency array, anew. It then compares each item in the dependency array with the corresponding item in the dependency array from the previous render. If none of the items have **changed**, it **skips** running the effect we've given it. For this reason it's generally important (and enforced by React's react-hooks eslint plugin) that every value **used from inside the effect** is also **passed to the dependency array**. This basically tells the hook: "if the effect will do the exact same thing it did last time, don't bother".

### Comparing values in JavaScript

We should talk about some nuances of the JavaScript language.

When React is comparing dependency-arrays for some hook, it does an `===` comparison. This is known as a "shallow comparison", and it has some important nuances.

Consider the following:
```javascript
false === false
// > true

2 === 2
// > true

'abc' === 'abc'
// > true
```
```javascript
['a', 'b', 'c'] === ['a', 'b', 'c']
// > false

{ foo: 'bar' } === { foo: 'bar' }
// > false

const a = () => {
    console.log('hello')
}
const b = () => {
    console.log('hello')
}
a === b
// > false
```

You can try these out in your browser console if you'd like.

In JavaScript, as in most languages, **primitive** values are compared "by value", while **non-primitive** values are compared "by reference". You can declare two arrays, objects, functions, etc the exact same way, but they are not actually "the same" array, object, or function. They are two different entities that happen to look the same, and they will not be equivalent as far as `===` and `!==` are concerned.

This also applies when we declare "the same" array, object, or function across two different renders of the same React component! On each render, we will normally get a **new** array/object/function which is **not** equivalent to the one from the previous render.

So this is why it's important that `useState` always returns **the same value and setter function**, unless its state actually gets changed. Otherwise, if we were to put it in a dependencies array (which we need to sometimes!), it would be different on every render and the whole dependencies array comparison would be pointless.

## useMemo() and useCallback()

So what about situations like this?

```jsx
function CollapsibleSection({ heading, content }) {
    const [visible, setVisible] = useState(true)

    function toggleVisible() {
        setVisible(!visible)
    }

    const loggerPayload = { heading, content, visible }

    useEffect(() => {
        Logger.log(loggerPayload)
    }, [loggerPayload])

    return (
        <div>
            <div onClick={toggleVisible}>{heading}</div>
            {visible &&
                <div>{content}</div>}
        </div>
    )
}
```

Here, `loggerPayload` isn't anything special or magical; we're constructing a brand new object on each render. Which means we'll be passing a new, different object to the dependencies array on every render. Which means the effect will run on every render no matter what!

We need to be able to say "the things that go into it haven't meaningfully changed, give me the *exact same* array/object/function as last time". This is what `useMemo()` does:

```jsx
function CollapsibleSection({ heading, content }) {
    const [visible, setVisible] = useState(true)

    function toggleVisible() {
        setVisible(!visible)
    }

    const loggerPayload = useMemo(() => {
        return { heading, content, visible }
    }, [heading, content, visible])

    useEffect(() => {
        Logger.log(loggerPayload)
    }, [loggerPayload])

    return (
        <div>
            <div onClick={toggleVisible}>{heading}</div>
            {visible &&
                <div>{content}</div>}
        </div>
    )
}
```

If heading, content, and visible don't change, then `loggerPayload` will be the exact same object instance on every render.

There are two key things to notice here:
- `useMemo()` takes a dependency array, just like `useEffect()`. It needs to compare the "source material" of its contents against what they were on the previous render, just like `useEffect()`, so it can know whether or not to do anything.
- You'll note it also takes a *function*, not just the expression. This is so `useMemo()` can wait and decide whether or not to evaluate the expression until *after* it's compared the dependency array with the previous one. If it's going to be returning the same thing as last time, it won't even do the work to create a new one (it would just be thrown away!).

So the major purpose of `useMemo()` is to give you control over the "newness" of values used in dependency arrays, since those are used to trigger further effects. But another handy thing about it is that since it doesn't generate the value *at all* unless needed, it can be used to avoid work! If you calculate some large expensive set of data based on some other data, you don't want to do all that work again unless it's absolutely needed! Give `useMemo()` the right set of dependencies, and the work will only be re-done when the result will be different.

### useCallback()

`useCallback()` is almost the same as `useMemo()`, it just does things slightly differently to make a common case more ergonomic:

```jsx
const a = useMemo(() => {
    return () => setFoo(true)
}, [setFoo])

const b = useCallback(
    () => setFoo(true)
, [setFoo])
```

These two are pretty much equialent. The React team wisely realized that memoizing a function was going to be a really common use-case (event handlers, for example). And at the same time, creating a function is almost never going to be a costly operation that needs to be deferred until after we've checked to see if it's needed.

So they made a shortcut: instead of passing a function that returns the value to be memoized (another function in this case), you can just pass the value itself, *as long as* it's going to be a function. Beyond that this behaves the same as the `useMemo()` version: if the dependencies array has the same contents as last time, the returned value will be the *exact same* function as it was in the previous render, not just an equivalent one, making it safe to then use in other dependency arrays.

## The big picture

So with these chains of dependency arrays, you end up with a tree-like structure. You have some core state (and props), which filter down through `useMemo()`s and `useCallback()`s, and (possibly! not necessarily) end up at `useEffect()`s. When any "upstream" prop or piece of state changes, the relevant dependency arrays get invalidated, and the results of those might trigger other dependency arrays, etc, all the way down the tree. But anything not affected by the change at the top should remain unbothered.

I think one of the hardest things to grok about hooks is the fact that they look like one-time declarations, and they sorta act like them, but they're actually function calls that happen over and over and occasionally that fact rears its head in weird ways. It can also be hard to know which things will and won't trigger a re-render (and trigger hooks to update, for various definitions of "update").

These rules also get much tricker when it comes to third-party hooks. They will be calling the core ones internally, but it may not be obvious exactly how they do so without seeing their implementation. Generally you should defer to their docs, but the usage contract will have a whole extra layer on top of the usual stuff because they can not only return values, they can and will trigger *your* code to get called again, perhaps based on what they're passed but also perhaps based on totally external and hidden mechanisms (a GraphQL query completing, for instance). So you're really dependent on the docs for these. The good news is that in practice, they're typically written to behave in reasonably intuitive ways. Some conventions have also arisen that can help when looking at a new library. But not everything follows the same conventions, so watch out. Third-party hooks can really do whatever they want.

I hope this was helpful. It's not comprehensive, but I tried to focus on pain points that I've seen people get tripped up on in real life. I also tried to establish a working mental model rooted in known facts about how JavaScript works as a language: at the end of the day hooks are not magic, or even a new language, they're just JavaScript function calls. They work in ways that are can be strange and unique, but when it comes down to it they have to follow the exact same basic rules as everything else.