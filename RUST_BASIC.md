# Rust Basics Documentation

## Table of Contents

1. [Ownership](#ownership)
2. [Borrowing & References](#borrowing--references)
3. [String Types: String vs &str](#string-types-string-vs-str)
4. [Macros](#macros)
5. [Vectors](#vectors)
6. [Stack vs Heap](#stack-vs-heap)
7. [Expressions vs Statements (Semicolons)](#expressions-vs-statements-semicolons)
8. [Result Type & Error Handling](#result-type--error-handling)
9. [Tauri Commands](#tauri-commands)
10. [Code Examples](#code-examples)

---

## Ownership

Ownership is **fundamental to Rust**. It's the language's core design principle for memory safety and concurrency safety without a garbage collector.

### The Three Rules of Ownership

1. **Each value has one owner** — Only one variable owns a piece of data at a time.
2. **Ownership can be transferred (moved)** — When ownership transfers, the old owner can't use it anymore.
3. **Value is dropped when owner goes out of scope** — Memory is automatically freed when the owner exits scope.

### Why Ownership Matters

- **No garbage collector needed** — Memory is freed deterministically.
- **No memory leaks** — Impossible to accidentally leak heap memory.
- **No double-free errors** — Can't free the same memory twice.
- **No use-after-free** — Can't access memory after it's been freed.
- **Concurrency safety** — Eliminates data races at compile time.

### Move: Ownership Transfer

```rust
let s1 = String::from("hello");  // s1 owns the String
let s2 = s1;                     // Ownership moves to s2
// println!("{}", s1);           // ERROR! s1 no longer owns the data
println!("{}", s2);              // OK! s2 is the owner
```

### Clone: Explicit Deep Copy

```rust
let s1 = String::from("hello");
let s2 = s1.clone();  // Deep copy; both s1 and s2 own independent copies
println!("{}", s1);   // OK
println!("{}", s2);   // OK
```

### Copy Types (Implicit Copy)

Some types implement the `Copy` trait and are implicitly copied instead of moved (e.g., integers, bools, chars):

```rust
let x = 5;
let y = x;  // x is copied, not moved
println!("{}", x);  // OK! x still usable because i32 is Copy
```

### Analogy

Think of ownership like owning a book:

- **Move**: You sell the book to someone else — you can't read it anymore.
- **Clone**: You photocopy the book — both you and the buyer have independent copies.
- **Borrow**: You lend the book temporarily — you get it back when done.

---

## Borrowing & References

Borrowing allows temporary access to data **without transferring ownership**. Use `&T` (immutable borrow) or `&mut T` (mutable borrow).

### Immutable Borrow (`&T`)

```rust
fn calculate_length(s: &String) -> usize {
    s.len()  // Read-only access; s not owned by this function
}

let s1 = String::from("hello");
let len = calculate_length(&s1);  // Borrow s1
println!("{}", s1);  // s1 still usable after the call
```

Key rules:

- Multiple immutable borrows can exist simultaneously.
- Cannot modify through an immutable borrow.

### Mutable Borrow (`&mut T`)

```rust
fn add_exclaim(s: &mut String) {
    s.push('!');  // Modify the borrowed data
}

let mut s = String::from("hello");
add_exclaim(&mut s);  // Mutable borrow
println!("{}", s);    // "hello!"
```

Key rules:

- Only **one mutable borrow** at a time (prevents data races).
- Cannot have immutable borrows while a mutable borrow is active.
- Mutable borrow must come after any immutable borrows go out of scope.

### Borrow Checker

The Rust compiler's **borrow checker** enforces these rules at compile time:

- Borrows cannot outlive the owner (lifetime enforcement).
- No aliasing with mutable borrows (prevents data races).
- All violations are caught before runtime.

---

## String Types: String vs &str

### `String` (Owned String)

- **Heap-allocated**, growable, mutable.
- Owns its data; when the `String` goes out of scope, memory is freed automatically (Drop trait).
- Use when the caller should own the string data.

```rust
let s = String::from("hello");  // Allocate on heap
let s2 = s.clone();             // Another heap allocation
```

### `&str` (String Slice)

- **Borrowed reference** to string data stored elsewhere.
- Could reference a `String`, a string literal, or other string data.
- Immutable and fixed-size.
- Does not own the data; just points to it.

```rust
let s = String::from("hello");
let slice: &str = &s[0..5];  // Borrow part of the String
let lit: &str = "hello";      // String literal (lives in binary)
```

### When to Use Each

**Use `&str`:**

- For read-only string parameters (idiomatic & flexible).
- Automatically coerces from `&String` via Deref coercion.
- Accepts both string literals and borrowed `String`s.

```rust
fn get_length(s: &str) -> usize {
    s.len()
}

let owned = String::from("hello");
get_length(&owned);    // &String -> &str (coerces)
get_length("literal"); // &str literal works directly
```

**Use `String`:**

- When you need to build, mutate, or own string data.
- As function return types when caller should own the result.
- When storing strings in data structures (if ownership is needed).

```rust
fn build_greeting(name: &str) -> String {
    format!("Hello, {}!", name)  // Returns owned String
}
```

---

## Macros

A **macro** is metaprogramming—code that writes code at compile time.

### Macros vs Functions

| Aspect         | Function           | Macro                          |
| -------------- | ------------------ | ------------------------------ |
| Execution time | Runtime            | Compile time                   |
| Arguments      | Fixed types, count | Variable, works on code syntax |
| Return type    | Single, specific   | Flexible                       |
| Purpose        | Execute logic      | Generate or transform code     |

### Types of Macros

**Declarative Macros** (using `macro_rules!`)

- Pattern matching on code syntax.
- Example: `println!`, `vec!`

```rust
let v = vec![1, 2, 3];  // Macro generates Vec initialization
```

**Procedural Macros** (custom attributes)

- **Attribute macros**: Transform code with attributes like `#[derive(Debug)]`, `#[tauri::command]`
- **Derive macros**: Auto-implement traits
- **Function-like macros**: Syntactically resemble functions

### `#[tauri::command]` Macro

This attribute macro exposes your Rust function to the frontend as a callable command. It generates all the boilerplate:

- Serialization/deserialization of arguments and return values.
- Async handling and Promise integration.
- Command routing and registration.

```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

Without the macro, you'd write dozens of lines of serialization & dispatch code manually.

---

## Vectors

A **vector** (`Vec<T>`) is a dynamic, growable array stored on the heap.

### Characteristics

- **Growable**: Can grow or shrink at runtime (unlike fixed-size arrays `[T; N]`).
- **Heap-allocated**: Data stored on the heap for dynamic sizing.
- **Contiguous memory**: Elements stored next to each other for fast access.
- **Generic**: `Vec<T>` where `T` is the element type (e.g., `Vec<String>`, `Vec<i32>`).
- **Owned**: The vector owns its data; when dropped, memory is freed.

### Common Operations

```rust
let mut v = Vec::new();        // Create empty vector
let v = vec![1, 2, 3];         // Create with values using macro
let v = vec![0; 5];            // Five zeros

v.push(4);                     // Add element to end
v.pop();                       // Remove and return last element
v.len();                       // Get length
v[0];                          // Access by index
v.is_empty();                  // Check if empty
v.iter();                      // Iterate over references
v.drain(..);                   // Remove and iterate over elements
```

### Iteration with `map`

```rust
let nums = vec![1, 2, 3];
let doubled = nums.iter()
    .map(|n| n * 2)           // Transform each element
    .collect::<Vec<i32>>();  // Collect into new Vec
```

### Comparison

- **Array**: `[String; 5]` — exactly 5 Strings, fixed size, stack-allocated.
- **Vector**: `Vec<String>` — any number of Strings, growable, heap-allocated.

Think of it like ArrayList (Java), list (Python), or array (JavaScript)—a flexible list that can change size.

---

## Stack vs Heap

### Stack

- **Fast**: Allocation/deallocation is just moving a pointer.
- **Automatic**: Memory freed when variable goes out of scope.
- **Fixed size**: Must know size at compile time.
- **Limited space**: Typically a few MBs (stack overflow if exceeded).
- **LIFO order**: Last In, First Out (like stacking plates).
- **Examples**: Local variables, function parameters, fixed-size arrays `[T; N]`.

```rust
let x = 5;              // Stack: simple value
let arr = [1, 2, 3];    // Stack: fixed-size array
```

### Heap

- **Slower**: Allocation requires finding suitable memory space.
- **Manual (but automated)**: Rust's ownership automatically frees heap memory.
- **Dynamic size**: Size can be unknown at compile time or change at runtime.
- **Large space**: Limited by system RAM.
- **Random access**: Memory can be allocated/freed in any order.
- **Examples**: `Vec<T>`, `String`, `Box<T>`, dynamically-sized data.

```rust
let v = vec![1, 2, 3];         // Heap: can grow/shrink
let s = String::from("hello"); // Heap: dynamic string
```

### Visual Analogy

- **Stack**: A stack of plates in your kitchen.
  - Quick to add/remove from top.
  - Limited height.
  - Must remove in reverse order.
- **Heap**: A warehouse with labeled boxes.
  - Takes time to find/retrieve.
  - Lots of room.
  - Can access any box anytime.

### In `Vec<String>`

The vector structure itself (pointer, length, capacity) lives on the **stack**, but the actual data lives on the **heap** so it can grow dynamically.

---

## Expressions vs Statements (Semicolons)

In Rust, **expressions produce values** and **statements perform work but produce no value**.

### The Difference

**Expression** (no semicolon):

- Evaluates to a value that can be returned or assigned.
- Last expression in a function is the return value.
- Last expression in a block is the block's value.

**Statement** (with semicolon):

- Performs work but produces the unit type `()`.
- Adding `;` converts an expression into a statement.

### Examples

Function return via last expression:

```rust
fn five() -> i32 {
    5        // Expression: returns 5
}

fn broken() -> i32 {
    5;       // Statement: returns () — type mismatch error!
}
```

Block expression in let binding:

```rust
let x = {
    let y = 2;
    y + 3    // Expression: block evaluates to 5
};           // x = 5

let z = {
    let a = 2;
    a + 3;   // Statement: block evaluates to ()
};           // z = ()
```

If as expression:

```rust
let n = if cond { 1 } else { 2 };  // if/else are expressions
```

Apply to your `list_files` function:

```rust
fn list_files(path: &str) -> Vec<String> {
    let path = Path::new(path);

    path.read_dir()
        .unwrap()
        .map(|entry| entry.unwrap().file_name().to_str().unwrap().to_owned())
        .collect::<Vec<String>>()   // NO semicolon -> returns Vec<String>
}  // If you add `;` the block value becomes (), causing type mismatch
```

### Key Takeaway

- **No semicolon** = expression = value is returned.
- **Semicolon** = statement = value is discarded.
- This is why you must omit the semicolon on the last expression in a function!

---

## Result Type & Error Handling

Instead of panicking with `.unwrap()`, use `Result<T, E>` for safe error handling.

### `.unwrap()` Problems

- Panics (crashes) if the `Result` is `Err` or `Option` is `None`.
- Not suitable for production code.
- No graceful error recovery.

```rust
let x = some_result.unwrap();  // Crashes if Err
```

### Result<T, E>

Two variants:

- `Ok(T)` — successful value of type `T`.
- `Err(E)` — error of type `E`.

```rust
fn parse_int(s: &str) -> Result<i32, std::num::ParseIntError> {
    s.parse()  // Returns Result
}

match parse_int("42") {
    Ok(num) => println!("Parsed: {}", num),
    Err(e) => println!("Error: {}", e),
}
```

### The `?` Operator (Error Propagation)

The `?` operator automatically propagates errors up the call stack. If the operation returns `Err`, the error is returned from the current function.

```rust
fn read_file_to_int(path: &str) -> Result<i32, Box<dyn std::error::Error>> {
    let content = std::fs::read_to_string(path)?;  // Propagate on error
    let num = content.parse::<i32>()?;             // Propagate on error
    Ok(num)
}
```

Without `?`, you'd need verbose matching:

```rust
let content = match std::fs::read_to_string(path) {
    Ok(c) => c,
    Err(e) => return Err(e.into()),
};
```

### Safe list_files Example

```rust
use std::path::Path;

#[tauri::command]
fn list_files(path: &str) -> Result<Vec<String>, String> {
    let path = Path::new(path);

    path.read_dir()
        .map_err(|e| e.to_string())?
        .filter_map(|entry| {
            entry.ok()
                .and_then(|e| e.file_name().into_string().ok())
        })
        .collect::<Vec<String>>()
        |> Ok  // Wrap in Ok
}
```

Or with a loop:

```rust
#[tauri::command]
fn list_files_safe(path: &str) -> Result<Vec<String>, String> {
    let path = Path::new(path);
    let mut names = Vec::new();

    for entry in path.read_dir().map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let name_os = entry.file_name();
        if let Some(name_str) = name_os.to_str() {
            names.push(name_str.to_owned());
        }
    }

    Ok(names)
}
```

### Option<T>

Similar to `Result`, but only two variants:

- `Some(T)` — contains a value.
- `None` — absence of a value.

```rust
let maybe_num: Option<i32> = Some(5);
match maybe_num {
    Some(n) => println!("{}", n),
    None => println!("No value"),
}

// Using `?` with Option
fn get_first(v: &Vec<i32>) -> Option<i32> {
    Some(v[0]?)  // Propagate None
}
```

---

## Tauri Commands

### Overview

Tauri commands bridge Rust and the frontend (JavaScript/TypeScript). They allow the frontend to invoke Rust functions and handle async operations.

### How It Works

1. **Frontend** calls `invoke('command_name', { arg1, arg2 })`.
2. **Tauri runtime** receives the invoke request.
3. **Handler** (generated by `#[tauri::command]` + `generate_handler!`) deserializes args and calls your Rust function.
4. **Rust function** runs (synchronously or awaits if async).
5. **Handler** serializes the result back to JSON.
6. **Frontend** receives the result (Promise resolves/rejects).

### The `#[tauri::command]` Macro

Marks a function as invocable from the frontend:

```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command(async)]
fn list_files(path: &str) -> Vec<String> {
    // ... implementation
}
```

### The `generate_handler!` Macro

Registers commands so Tauri knows how to route incoming invokes:

```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet, list_files])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

### Frontend Invocation

```typescript
import { invoke } from "@tauri-apps/api/tauri";

// Invoke a command
const greeting = await invoke("greet", { name: "Alice" });
console.log(greeting); // "Hello, Alice!"

// With error handling
try {
  const files = await invoke("list_files", { path: "/home/user" });
  console.log(files);
} catch (error) {
  console.error("Error listing files:", error);
}
```

### Return Type Considerations

**Returning a simple value:**

```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

**Returning a Result (error handling):**

```rust
#[tauri::command]
fn list_files(path: &str) -> Result<Vec<String>, String> {
    // If Err is returned, the frontend invoke Promise rejects
    // If Ok is returned, Promise resolves with the inner value
}
```

**Async command:**

```rust
#[tauri::command(async)]
async fn fetch_data(url: &str) -> Result<String, String> {
    // Async implementation; frontend await works as expected
}
```

---

## Code Examples

### Example 1: Owned String in a Function

```rust
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let greeting = greet("Alice");  // &str from function
    println!("{}", greeting);       // Owned String returned
}
```

### Example 2: Borrowing with References

```rust
fn calculate_length(s: &str) -> usize {
    s.len()  // Read-only access; no ownership transfer
}

fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);  // Borrow s1
    println!("The length of '{}' is {}.", s1, len);
    // s1 still usable after the call
}
```

### Example 3: Mutable Borrow

```rust
fn add_exclaim(s: &mut String) {
    s.push('!');  // Modify the borrowed String
}

fn main() {
    let mut s = String::from("hello");
    add_exclaim(&mut s);
    println!("{}", s);  // "hello!"
}
```

### Example 4: Vec Iteration and Transform

```rust
fn double_numbers(nums: &[i32]) -> Vec<i32> {
    nums.iter()
        .map(|n| n * 2)              // Transform each element
        .collect::<Vec<i32>>()
}

fn main() {
    let nums = vec![1, 2, 3, 4, 5];
    let doubled = double_numbers(&nums);
    println!("{:?}", doubled);  // [2, 4, 6, 8, 10]
}
```

### Example 5: Safe Error Handling with Result

```rust
use std::fs;

fn read_file_count(path: &str) -> Result<usize, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| e.to_string())?;
    Ok(content.lines().count())
}

fn main() {
    match read_file_count("data.txt") {
        Ok(count) => println!("Lines: {}", count),
        Err(e) => println!("Error: {}", e),
    }
}
```

### Example 6: Tauri Command with Result

```rust
use std::path::Path;

#[tauri::command]
fn list_files(path: &str) -> Result<Vec<String>, String> {
    let path = Path::new(path);
    let mut names = Vec::new();

    for entry in path.read_dir().map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        if let Some(name) = entry.file_name().to_str() {
            names.push(name.to_owned());
        }
    }

    Ok(names)
}
```

### Example 7: Async Tauri Command

```rust
#[tauri::command(async)]
async fn fetch_data(url: &str) -> Result<String, String> {
    // Simulate async work
    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    Ok(format!("Data from {}", url))
}
```

---

## Summary

### Key Takeaways

1. **Ownership** is Rust's foundation for memory safety without a garbage collector.
2. **Borrowing** with `&T` and `&mut T` allows access without transferring ownership.
3. **Use `&str` for read-only strings**, `String` when ownership is needed.
4. **Macros** like `#[tauri::command]` generate boilerplate code at compile time.
5. **Vectors** are growable, heap-allocated arrays.
6. **Stack** is fast but fixed-size; **Heap** is flexible but slower.
7. **Expressions** (no `;`) return values; **statements** (with `;`) discard values.
8. **Result** and `?` operator replace panicking `.unwrap()` for safe error handling.
9. **Tauri commands** bridge Rust and frontend via serialization and async Promise integration.

### Best Practices

- Prefer `&str` over `&String` for function parameters.
- Use `Result<T, E>` and `?` for error handling.
- Avoid `.unwrap()` in production code.
- Clone only when necessary; prefer borrowing.
- Return owned data from functions when the caller needs it.
- Use immutable references by default; only use `&mut` when modification is needed.
