---
title: "Rust's BufRead, And When To Use It"
date: February 28, 2023
tags: [ "programming", "rust" ]
---


Rust is a low-level language, and its standard library is careful to give the programmer lots of control over how things will behave and avoid implicit behavior, especially when that behavior impacts performance. But at the same time, it doesn't want to make the programmer's life harder than it needs to be. As a result, Rust's language features and standard library often give you access to really low-level concepts with no assumptions baked in, but then also give you abstractions you can *optionally* layer on top.

One example of this is the `Read` and `BufRead` traits. `Read` is a low-level and unopinionated abstraction for ingesting data from things like files, network sockets, and process input, while `BufRead` represents a specific kind of layer you can choose to put on top of `Read` to make it slightly higher-level.

## What is `Read`?

Several things on a computer may be thought of as a "stream" of bytes. These streams may not immediately have all of the bytes available! The data will come in gradually, over time, and the code that consumes it will have to load it gradually (and usually either process it as it comes in, or store it all in one place before working with it all at once). Examples include a file being read from disk (which gets read gradually from the storage device), data being sent over the network (which gradually makes its way over the wire), or data piped in from another process via stdin (which may come from anywhere!)

To make these easier to work with, Rust exposes a [trait](https://doc.rust-lang.org/rust-by-example/trait.html) called [`Read`](https://doc.rust-lang.org/std/io/trait.Read.html). This trait has various methods, but all of them are based on a single key method called `read`:

```rust
fn read(&mut self, buf: &mut [u8]) -> Result<usize>;
```

This method says "for `self` (the stream-like entity), take the next bytes that are currently available and write them into the byte array `buf` (up to `buf`'s length; we don't want more than that right now)". It then returns either an error, or a `usize` telling the caller how many bytes were actually available to be read (it could be as many as `buf`'s length, but it may be less, because they come in gradually!).

A `File`, `TcpStream`, etc can implement this trait (by implementing this method), and become usable as a `Read` for anything that knows how to work with a `Read`. The code that wants to read data from it can then call `.read()` over and over, to gradually load the data from the stream.

## System calls

Now as I said, `Read` is low-level by design! And many of these stream-like entities translate directly to operating-system entities, and reading from them translates directly to a system call. Rust doesn't assume we want anything between us and the system.

The thing about system calls is they're slow, at least compared to normal program logic. The reason for this is a little bit out of scope for the article, but it has to do with privileges: there are certain things that for security reasons, only the kernel is allowed to do. And when a system call is made from non-kernel code (like yours!), a request is made to the kernel to do something on its behalf, and then the CPU has to totally switch contexts to the kernel so it can fulfill your request safely, and then switch everything back to your code afterward. In low-level code, reducing the number of system calls is one of the bigger ways to squeeze out more performance!
So, if we've got a loop that reads from a stream over and over in rapid succession, a little bit at a time, that might be a lot of extra system calls, which could slow down our code quite a bit. This is where `BufRead` comes in!

## Buffered reading

The idea with buffered reading is this: instead of asking the *system* for little bits of data one at a time, we keep a cache of our own, in non-kernel userspace. This cache (or "buffer") gets filled up *as much as possible* each time we request more data. If we only need one byte in our aplication logic, we don't just request one byte from the system- we request as many bytes as our buffer can hold, using a single system call, and then dole out just one of those bytes to the application logic that requested it. Then the next time the application logic requests a single byte, we may not even need to make a system call! If we already have the next byte cached in our buffer, we can return it straight away without the whole complicated dance that slows down our program.

You could implement buffered reading yourself on top of a plain `Read`, but it's a common enough thing that Rust provides us `BufRead` and `BufReader`.


## `BufReader`

`BufReader` is a **struct** which implements the `BufRead` **trait**. I'll explain why both exist in a second.

`BufReader` implements exactly the mechanism described in the previous section: it wraps an existing `Read` entity (like a network stream), and internally it also stores a buffer (8KB by default, but you can specify a custom size). `BufReader` itself implements `Read`, so you can then use it just like you would a normal `Read` and it will do the buffering behavior internally.

When you call `read` on a `BufReader`, it will fill up as much of its internal buffer as possible with a single large `read` from the original stream, before handing you the number of bytes you requested. The next time you call `read`, if it's already cached enough bytes to fulfill what you requested, it will return those directly without making another system call, hopefully speeding up your program! If you then `read` again and it doesn't have enough bytes cached, it will make a new system call that (you guessed it) fills up the buffer again, with as much data as is available at that time.

## `BufRead`

`BufRead` is a **trait** that's implemented by `BufReader` (as well as some other things). It's a little odd- being a trait, it doesn't actually implement the buffering mechanism or anything. So why does it exist?

`Read` describes the base operations you can do on any readable stream, but there are some operations you *could* want to do on a stream that would be really inefficient if the stream's content wasn't buffered! So those operations live in `BufRead`, to separate them out. `BufRead` says "this `Read`'s data is buffered, so we can do these additional operations without worrying about tanking performance".

An example is the `lines` method. This method returns an iterator over the "lines" of bytes coming in (delimited by ASCII newline characters). This would be slow to do without a buffer, because you never know when the next byte is going to be a newline. To avoid over-shooting, you would have to read one byte at a time and check if it's a newline before reading the next one. And as we know, a series of tiny reads that translate to a long series of system calls is very inefficient! So this method is only built-in for `Read` structs that are explicitly marked as being buffered, via `BufRead`.

## Demonstration

To demonstrate, I've created an [example project](https://github.com/brundonsmith/read-demo) that you can clone and run on your machine, to demonstrate the performance impact of `BufReader`. Let's walk through it.

### Running the demo

This project contains both a TCP server and a TCP client. You can start each of them on your machine, and when the client is started it will request a stream of data from the server and then report how long it took with and without `BufReader`.
With the code cloned, open two terminals and navigate both to the project directory. In the first one, type:


```
cargo run server
```

It should give you something like this:

```
  Compiling read-demo v0.1.0 (/Users/my-profile/read-demo)
    Finished dev [unoptimized + debuginfo] target(s) in 0.79s
     Running `target/debug/read-demo server`
Listening started, ready to accept
```

Now in the other terminal, type:

```
cargo run client
```

The program will start in client-mode, find the local server in the other terminal, connect to it, and request a stream of bytes. It will then do the same thing with a `BufReader`. It will record the time each of these takes, and print it to the console. You should get something like:

```
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
     Running `target/debug/read-demo client`
TcpStream (Read) took 469ms
BufReader<TcpStream> (BufRead) took 109ms
```
Of course your numbers won't match mine exactly, but the `BufReader` one should be significantly faster.

### How it works

Here's what happens when we start up the server:

```rust
fn server() {
    let listener = TcpListener::bind(HOST).unwrap();
    println!("Listening started, ready to accept");
    // listen for incoming connections
    for stream in listener.incoming() {
        thread::spawn(move || {
            // create a large set of data [0, 1, .., 255, 0, 1, ..]
            let data: Vec<u8> = (0..TOTAL_BYTES).map(|n| (n % 255) as u8).collect();
            // write entire set of data
            stream.unwrap().write(&data).unwrap();
            println!("Data sent, closing connection");
        });
    }
}
```

We open a TCP socket on localhost, and wait for incoming connections. When one is made, we spawn a new thread, generate a 1MB array of junk bytes (0-255 over and over), and send it all over the socket.

The client is where the relevant part happens. We run the client logic twice, once without and then once with a `BufReader`:


```rust
fn client() {
    // test with a raw TCP stream
    client_inner("TcpStream (Read)", TcpStream::connect(HOST).unwrap());
    // test with the stream wrapped in a buffered reader
    client_inner(
        "BufReader<TcpStream> (BufRead)",
        BufReader::new(TcpStream::connect(HOST).unwrap()),
    );
}
```

The core logic is then the same between the two:

```rust
fn client_inner<TRead: Read>(description: &str, mut stream: TRead) {
    let mut index = 0;
    // create a large buffer to hold all incoming data
    let mut buffer: Vec<u8> = (0..TOTAL_BYTES).map(|_| 0).collect();
    let start = Instant::now();
    // loop while there are still bytes to be read
    loop {
        // get the next one-byte slice of the buffer to use for reading (the
        // tiny slice is chosen to make this as inefficient as possible, for
        // illustration purposes)
        let buffer_slice = &mut buffer[index..usize::min(index + 1, TOTAL_BYTES)];
        // read new data into the buffer slice
        let received_bytes = stream.read(buffer_slice).unwrap();
        if received_bytes > 0 {
            // advance `index` by the number of bytes read
            index += received_bytes;
        } else {
            // if there are no more bytes to be read, we're done
            break;
        }
    }
    let end = Instant::now();
    println!(
        "{} took {}ms",
        description,
        end.duration_since(start).as_millis()
    );
}
```

We create a buffer large enough to hold the expected payload. Then we loop, reading exactly one byte at a time from the stream on each iteration. Once we've stopped receiving bytes (the stream has been closed), we break out of the loop and print how long the whole thing took.

### One byte at a time

_Intentionally_ reading only one byte at a time is a bit silly; it isn't a very common situation to be in where you need to do that. But it's done here for illustration purposes, to make sure the difference is as exaggerated as possible.

## Reasons to use or not use `BufReader`

So, when should you wrap your `Read` in `BufReader`? It may be surprising to hear that the answer isn't "always".

First and foremost: it's unlikely to be helpful if there isn't a system call underlying your `Read` stream (i.e., if your `Read` is just handing you data that's already in your program's memory). `Read`s are often, but not always, backed by system calls: you could just as easily write a struct that implements `Read` but doesn't make any system calls!

Second: the larger each of your own `read`s is, the less helpful `BufReader` will be. You can read any number of bytes each time you call `read`, so if that number of bytes is large, you'll already be making fewer system calls than you would otherwise. At some point, `BufReader` won't help you reduce them, it'll just be an extra intermediate memory copy happening each time.

And `BufReader` itself isn't free! So if it's not helping, you don't want to be using it. It has two main costs:

1. The buffer it holds will take up memory. If you've got the default buffer of 8KB, that's 8KB being occupied no matter how fully it's being utilized. That may sound small, but if you have many `BufReader`s alive at one time, or if you choose to give each of them a larger buffer, it can add up.

2. Allocating the buffer is itself a system call! If you're making one system call to avoid many other system calls then it can easily be worth it, but if you aren't avoiding many other system calls it could do more harm than good, especially if you're creating and tearing down `BufReader`s repeatedly.

These costs bring us to the third situation where you might not use `BufReader`: when you're creating a very large number of streams. Consider situations where you might be loading thousands of files from disk, or handling thousands of incoming network connections. If every one of those has to allocate a buffer, and then take up that extra memory while it's alive, both the allocations and the memory usage will add up quickly! That doesn't automatically mean it's the wrong choice, but it's something to take into account.

## Benchmarks, benchmarks, benchmarks

But above all: `BufReader` is an optimization, and any optimization should be grounded in real-life benchmarks. Before incorporating it you should test out your real code with and without it, like we did above, and compare the two. Make sure there's a real - not hypothetical - performance gain, and that you understand why the bottleneck was happening and why adding `BufReader` will consistently solve it.

It's good to understand how performance will _probably_ work, but it's better to check your assumptions!
