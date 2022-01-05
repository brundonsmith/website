---
title: Three Kinds of Polymorphism in Rust
date: January 5, 2022
tags: ["programming", "rust"]
---

This information probably won't be new to you if you've been writing Rust for a
bit! But I'm hoping the framing will be useful anyway. It's been useful for me.

When faced with a situation where you're writing code that should work across a 
few different kinds of values without knowing what they are ahead of time, Rust
asks slightly more of you than many languages do. Dynamic languages will let
you pass in anything, of course, as long as the code works when it's run. 
Java/C# would ask for an interface or a superclass. Duck-typed languages like
Go or TypeScript would want some structural type- an object type with a 
particular set of properties, for instance.

Rust is different. In Rust there are three main approaches for handling this 
situation, and each has its own advantages and disadvantages.

## A toy problem

Say we need to represent shapes, a classic polymorphism problem:

```
Shape
 |-Rectangle
 |-Triangle
 |-Circle
```

We want to represent these in such a way that they each expose their `perimeter()` 
and `area()`, and code can be written that works with those properties without
caring which specific shape it's looking at at a given time.

## 1. Enums

```rust
// Data

enum Shape {
    Rectangle { width: f32, height: f32 },
    Triangle { side: f32 },
    Circle { radius: f32 },
}

impl Shape {

    pub fn perimeter(&self) -> f32 {
        match self {
            Shape::Rectangle { width, height } => width * 2.0 + height * 2.0,
            Shape::Triangle { side } => side * 3.0,
            Shape::Circle { radius } => radius * 2.0 * std::f32::consts::PI
        }
    }

    pub fn area(&self) -> f32 {
        match self {
            Shape::Rectangle { width, height } => width * height,
            Shape::Triangle { side } => side * 0.5 * 3.0_f32.sqrt() / 2.0 * side,
            Shape::Circle { radius } => radius * radius * std::f32::consts::PI
        }
    }
}
```
```rust
// Usage

fn print_area(shape: Shape) {
    println!("{}", shape.area());
}

fn print_perimeters(shapes: Vec<Shape>) {
    for shape in shapes.iter() {
        println!("{}", shape.perimeter());
    }
}
```

An `enum` in Rust is a data structure that can take one of a few different 
shapes. These different shapes ("variants") will all fit into the same slot in 
memory (which will be sized to fit the largest of them).

This is the most straightforward way to do polymorphism in Rust, and it comes
with some key advantages:
- Struct data is inline (a reference to some other memory location doesn't have
  to be followed to find it). The most important thing here is that it helps 
  with cache locality: entities in a collection will be "next to each other" in
  memory, so fewer trips have to be made to retrieve them. Cache locality is too
  big a topic for this article, but it's important in performance-critical code.
- Even though the data is inline, each item in eg. a collection can take a 
  different variant from its neighbors. As we'll see, this is not a given.
- You can work with them as raw data much more easily; the other approaches, as
  we'll see, only allow you to work with mixed values via method calls. That can
  be needlessly burdensome for some usecases.

However, they have a couple of disadvantages too:
- If there's a large difference in the sizes of different variants, some memory
  may be wasted. This isn't usually significant because if you're storing eg. a 
  large collection in some variant, it probably lives on the heap anyway, not 
  inline. But there are situations where this can matter.
- The more important one: enums exposed in a library can't be extended by users
  of that library. Where an enum is defined, it's set in stone: all possible
  variants are listed in that one spot. This can be a deal-breaker for certain
  uses.

## 2. Traits
```rust
// Data

trait Shape {
    fn perimeter(&self) -> f32;
    fn area(&self) -> f32;
}

struct Rectangle { pub width: f32, pub height: f32 }
struct Triangle { pub side: f32 }
struct Circle { pub radius: f32 }

impl Shape for Rectangle {
    fn perimeter(&self) -> f32 {
        self.width * 2.0 + self.height * 2.0
    }
    fn area(&self) -> f32 {
        self.width * self.height
    }
}

impl Shape for Triangle {
    fn perimeter(&self) -> f32 {
        self.side * 3.0
    }
    fn area(&self) -> f32 {
        self.side * 0.5 * 3.0_f32.sqrt() / 2.0 * self.side
    }
}

impl Shape for Circle {
    fn perimeter(&self) -> f32 {
        self.radius * 2.0 * std::f32::consts::PI
    }
    fn area(&self) -> f32 {
        self.radius * self.radius * std::f32::consts::PI
    }
}
```

Traits are the other big polymorphic concept in Rust. They can be thought of 
like an interface or protocol from other languages: they specify a set of 
methods that a struct must implement, and then they can be implemented for 
arbitrary structs and those structs can be used where the trait is expected.

A major advantage they have over enums is that the trait can be implemented for
new structs elsewhere- even in a different crate. You can import a trait
from a crate, implement it for your own struct, and then pass that struct to
code from the crate which requires the trait. That can be crucial for certain
kinds of libraries.

There's also a neat, if niche, benefit: you have the option of 
writing code that *only* accepts a specific variant. With enums you can't do 
that (I wish you could!).

One disadvantage, which will not be obvious coming from other languages: there's
no way with a trait to find out which variant you're working with and get at its 
other properties. There's no `instanceof`, there's no `as` casting. You can 
*only* work with the value via the actual trait methods.

And unlike in most languages with a similar concept, Rust gives us an 
interesting choice to make in terms of how we use traits.

### 2a. Traits with generics
```rust
// Usage

fn print_area<S: Shape>(shape: S) {
    println!("{}", shape.area());
}

fn print_perimeters<S: Shape>(shapes: Vec<S>) { // !
    for shape in shapes.iter() {
        println!("{}", shape.perimeter());
    }
}
```

A Rust trait can be used to constrain a type parameter in a generic function 
(or generic struct). We can say "`S` has to be a struct that implements `Shape`",
and that gives us permission to call the trait's methods in the relevant code.

Like enums, this gives us good locality because the data's size is known at
compile-time (Rust stamps out a copy of the function for each concrete type 
that gets passed to it somewhere).

Unlike enums, though, this prevents us from using multiple variants in the same
generic code at the same time. For example:
```rust
fn main() {
    let rectangle = Rectangle { width: 1.0, height: 2.0 };
    let circle = Circle { radius: 1.0 };

    print_area(rectangle); // ✅
    print_area(circle); // ✅

    print_perimeters(vec![ rectangle, circle ]); // compiler error!
}
```
This doesn't work because we need a *single* concrete type for `Vec`. We can
have a `Vec<Rectangle>` or a `Vec<Circle>`, but not both at once. We can't just
have a `Vec<Shape>` either, because `Shape` doesn't have a fixed size in memory.
It's just a contract. Which brings us to...

### 2b. Traits with dynamic dispatch

```rust
// Usage

fn print_area(shape: &dyn Shape) {
    println!("{}", shape.area());
}

fn print_perimeters(shapes: Vec<&dyn Shape>) {
    for shape in shapes.iter() {
        println!("{}", shape.perimeter());
    }
}
```

In Rust syntax, `&Foo` is a reference to a struct `Foo`, while `&dyn Bar` is a 
reference to a struct implementing some *trait* `Bar`. A trait doesn't have a fixed 
size, but a pointer does, regardless of what it points to. So to revisit the 
problem above with our new definitions:

```rust
fn main() {
    let rectangle = Rectangle { width: 1.0, height: 2.0 };
    let circle = Circle { radius: 1.0 };

    print_area(&rectangle); // ✅
    print_area(&circle); // ✅

    print_perimeters(vec![ &rectangle, &circle ]); // ✅
}
```

We can mix and match structs here because all of their data is behind
pointers, and a pointer has a known size that the collection can use to
allocate memory.

So what's the downside? Mainly, we lose cache-locality. Because all of the structs'
data are behind pointers, the computer has to jump all over the place to track
it down. Done many times, this can start to have a big impact on performance.

Of smaller note: dynamic dispatch itself involves looking up the desired method
in a lookup table. Normally the compiler will know ahead of time the exact 
memory location for a method's code, and can hard-code that address. But with
dynamic dispatch, it can't know ahead of time what kind of struct it has, so 
when the code is actually run there's some extra work to figure that out and go 
look up where its method lives.

Finally: in practice, if some struct *owns* a value where only its trait is 
known, you're probably going to have to put that value in a `Box`, which means 
making a heap allocation, and that allocation/deallocation can itself be costly.

## Bonus: Enum with inner structs

I said there were three approaches, and I lied a little bit. There's a fourth,
frankenstein approach, which combines the above:
```rust
enum ShapeEnum {
    Rectangle(Rectangle),
    Triangle(Triangle),
    Circle(Circle)
}

struct Rectangle { pub width: f32, pub height: f32 }
struct Triangle { pub side: f32 }
struct Circle { pub radius: f32 }

trait Shape {
    fn perimeter(&self) -> f32;
    fn area(&self) -> f32;
}

impl Shape for ShapeEnum {
    fn perimeter(&self) -> f32 {
        match self {
            ShapeEnum::Rectangle(rect) => rect.perimeter(),
            ShapeEnum::Triangle(tri) => tri.perimeter(),
            ShapeEnum::Circle(circ) => circ.perimeter(),
        }
    }
    fn area(&self) -> f32 {
        match self {
            ShapeEnum::Rectangle(rect) => rect.area(),
            ShapeEnum::Triangle(tri) => tri.area(),
            ShapeEnum::Circle(circ) => circ.area(),
        }
    }
}

impl Shape for Rectangle {
    fn perimeter(&self) -> f32 {
        self.width * 2.0 + self.height * 2.0
    }
    fn area(&self) -> f32 {
        self.width * self.height
    }
}

impl Shape for Triangle {
    fn perimeter(&self) -> f32 {
        self.side * 3.0
    }
    fn area(&self) -> f32 {
        self.side * 0.5 * 3.0_f32.sqrt() / 2.0 * self.side
    }
}

impl Shape for Circle {
    fn perimeter(&self) -> f32 {
        self.radius * 2.0 * std::f32::consts::PI
    }
    fn area(&self) -> f32 {
        self.radius * self.radius * std::f32::consts::PI
    }
}
```

This monstrosity gives you the best of all worlds; the cost being that it's
ugly as sin, and there's boilerplate to deal with whenever you add new variants 
or capabilities.

It also has the slightly weird effect of separating "first-class" `Shape`s from
others: other crates that implement `Shape` for their own structs won't be able
to pass those to code that expects a `ShapeEnum`, only code that expects a 
`Shape`. Care would need to be taken to make sure user-added variants will work 
everywhere they need to.


## Summary

So which should you use? Here's a handy table for reference:

|        | Inline layout  | No wasted memory | Mixed-type collections | Extensibile | Easy to write and maintain |
|--------|----------------|------------------|------------------------|---------------|---|
|Enums   |✅              |❌                |✅                      |❌|✅
|Generics|✅              |✅                |❌                      |✅|✅
|Dynamic |❌              |✅                |✅                      |✅|✅
|Frankenstein|✅|✅|✅|✅|❌

In practice: if variants are small, finite, known, and I'm not writing a 
library where others will need to extend them, I mostly use enums. They're
performance-sensible and Rust makes them very ergonomic.

It's worth noting, though, that dynamic-dispatch is what most languages *always* 
do for this stuff. So even though it's less performant, it's still plenty
performant most of the time. And then wherever you're just working with one item
at a time, you can skip that cost anyway by using a generic. As with many
things, Rust gives us an extra *opportunity* to optimize, but it's important 
not to get sucked down the rabbit-hole unless you really need to squeeze out
more performance.

So in most cases: it probably doesn't matter that much! But it's still good to
know how to navigate the landscape. Since I formed this mental model, it's 
framed any data-modeling decisions I make in Rust that involve groups of 
"things" that need to all play the same role sometimes. Hopefully it's useful 
to you too! 🦀