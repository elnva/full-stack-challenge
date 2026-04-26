# JavaScript — Interview Questions & Answers

Modern JS (ES2020+), browser + Node runtimes.

---

### 1. `var` vs `let` vs `const`.

`var` is function-scoped and hoisted with an initial value of `undefined`. `let` and `const` are block-scoped and live in the "temporal dead zone" from the start of the block until their declaration — accessing them there throws. `const` prevents *reassignment* of the binding; the value itself can still mutate (`const x = []; x.push(1)` is fine).

### 2. `==` vs `===`.

`===` is strict equality — no coercion. `==` performs type coercion and has a notoriously messy spec (`[] == ![]` is `true`). Use `===` everywhere except the one useful case: `x == null` catches both `null` and `undefined`. Lint rules should flag the rest.

### 3. Explain the event loop.

JS is single-threaded. The runtime has a call stack, a microtask queue (promise callbacks, `queueMicrotask`), and a macrotask queue (timers, I/O). When the stack empties, the loop drains *all* microtasks before taking the next macrotask, then renders (in the browser). This is why `Promise.resolve().then(fn)` runs before `setTimeout(fn, 0)`.

### 4. What's a closure?

A function plus the lexical environment it was created in. The function keeps references to outer variables even after the outer function returns. Closures are the mechanism behind module privacy, factory functions, and most bugs where "the counter always logs 5" in a `for (var i …)` + `setTimeout` loop.

### 5. `this` — how is it determined?

Rules in precedence order: (1) arrow functions inherit `this` from the enclosing scope — they have no binding of their own. (2) `new F()` → `this` is the new instance. (3) `f.call(obj)` / `f.apply(obj)` / `f.bind(obj)` → explicit. (4) `obj.f()` → `this` is `obj`. (5) Otherwise `undefined` in strict mode, global object in sloppy mode.

### 6. Prototypal inheritance in one paragraph.

Every object has an internal `[[Prototype]]` link (accessible via `Object.getPrototypeOf`). Property lookups walk the chain until a match or `null`. `class` is syntactic sugar over this: `class Dog extends Animal` sets `Dog.prototype`'s prototype to `Animal.prototype`. No classical "class" exists at runtime — just linked objects.

### 7. `call` vs `apply` vs `bind`.

All three set `this`. `call(thisArg, ...args)` invokes immediately with spread args. `apply(thisArg, argsArray)` invokes immediately with an array. `bind(thisArg, ...args)` returns a *new* function with `this` and optional leading args permanently fixed — useful for event handlers or partial application.

### 8. Synchronous vs asynchronous vs parallel.

Synchronous: one operation blocks until it returns. Asynchronous: the operation returns a promise/callback and the main thread continues — but only one task runs on the main thread at a time. Parallel: multiple things execute *simultaneously* on different threads/cores. JS is asynchronous but not parallel — for true parallelism you need Web Workers, Worker Threads (Node), or `SharedArrayBuffer` + `Atomics`.

### 9. Promise states and chaining.

A Promise is `pending`, `fulfilled`, or `rejected` — transitions are one-way and terminal. `.then(onFulfilled, onRejected)` returns a *new* promise. If a handler returns a promise, the chain waits for it ("promise unwrapping"). Throwing inside `.then` rejects the returned promise. Unhandled rejections fire `unhandledrejection` and crash Node by default in recent versions.

### 10. `async`/`await` — what is it sugar for?

An `async` function always returns a promise. `await p` suspends the function until `p` settles, then resumes with the resolved value (or throws the rejection). Underneath it's equivalent to `.then` chains, but preserves try/catch semantics and stack traces. Loops become sequential when you `await` inside them — use `Promise.all` for concurrent.

### 11. `Promise.all` vs `allSettled` vs `race` vs `any`.

- `all([p1, p2])`: fulfills when *all* do; rejects as soon as *any* rejects.
- `allSettled`: waits for all, returns an array of `{status, value|reason}` — never rejects.
- `race`: settles with the first to settle (fulfilled *or* rejected).
- `any`: fulfills with the first *fulfilled*, rejects with an `AggregateError` only if all reject.

### 12. What is hoisting?

The engine allocates bindings before executing code. `function` declarations are hoisted with their value — callable above their line. `var` is hoisted as `undefined`. `let`/`const`/`class` are hoisted but not initialized (TDZ). Expression forms (`const f = () => ...`) aren't callable above their line.

### 13. Shallow vs deep copy.

`{...obj}` and `Object.assign({}, obj)` copy the first level; nested objects remain shared references. Deep copy options: `structuredClone(obj)` (built-in, handles cycles, `Map`/`Set`/`Date`, not functions/DOM nodes), or `JSON.parse(JSON.stringify(obj))` (drops functions, `Date` → string, loses cycles, throws on BigInt).

### 14. `Map` and `Set` vs object and array.

`Map` keys can be any type (objects, functions); iteration order is insertion order; size is `.size`. `Set` stores unique values with O(1) membership checks. Plain objects coerce all keys to strings and have prototype-chain pollution risks. Use `Map`/`Set` for dynamic keyed collections; use objects for fixed-shape records.

### 15. What is currying?

Transforming `f(a, b, c)` into `f(a)(b)(c)` — a chain of unary functions each returning the next. Useful for partial application (`const add5 = curried(add)(5)`), point-free composition, and APIs where you want to configure ahead and apply the last argument later.

### 16. Debounce vs throttle.

**Debounce:** delay execution until N ms have passed since the *last* invocation. Good for autocomplete — fire once the user stops typing. **Throttle:** ensure at most one call per N ms. Good for scroll/resize handlers — maintain a regular cadence. Neither is a drop-in replacement for the other.

### 17. Memory leaks in JS — common causes.

Accidental globals (`x = 1` without `let` in sloppy mode), forgotten timers holding closures, detached DOM nodes retained by JS references, event listeners never removed, caches that grow unboundedly, closures over large objects when only one field is needed. DevTools' heap snapshot comparison is how you find them.

### 18. `typeof` — gotchas.

`typeof null === 'object'` (historical bug, can't be fixed). `typeof []` is also `'object'` — use `Array.isArray`. `typeof undeclaredVar` returns `'undefined'` without throwing (the only safe way to check for a global that may not exist). Functions report `'function'`.

### 19. What is the prototype chain for arrays?

`[] → Array.prototype → Object.prototype → null`. `[]` inherits `.map`, `.filter`, `.forEach` from `Array.prototype`. Modifying `Array.prototype` affects every array — don't. This is also why `for…in` on arrays is wrong: it iterates inherited enumerable keys; use `for…of` or array methods.

### 20. `for…in` vs `for…of` vs `.forEach`.

`for…in` iterates enumerable *keys* of an object, including inherited ones — rarely what you want. `for…of` iterates *values* of any iterable (arrays, strings, Maps, Sets, generators). `.forEach` is an array method — can't `break` or `return` to skip the remaining iterations, and ignores promises.

### 21. What is `Symbol` and why does it exist?

A primitive type whose values are guaranteed unique. Two uses: (1) collision-free object keys — `const hidden = Symbol('debug'); obj[hidden] = ...` — won't clash with other code or appear in `Object.keys`. (2) Well-known symbols (`Symbol.iterator`, `Symbol.asyncIterator`) hook into language protocols to make your object iterable, thenable, etc.

### 22. What is a generator?

A function declared with `function*` that can pause (`yield value`) and resume. It returns an iterator whose `.next()` runs to the next `yield`. Generators power lazy sequences, custom iteration protocols, and were the original building block for `async/await` before it became a language feature. `yield*` delegates to another iterable.

### 23. What are modules — ESM vs CommonJS?

**CommonJS** (Node legacy): `require()` is synchronous, resolves at call time, exports are a mutable object. **ESM** (standard): `import`/`export` are static — resolved and parsed before execution, support tree-shaking, top-level `await`, and circular-dependency handling via live bindings. Node can run both; browsers run only ESM.

### 24. Strict mode — what does it change?

Opt in with `"use strict"` at a file/function top. Changes: `this` is `undefined` (not global) in unbound calls, silent assignment failures throw, duplicate parameter names throw, octal literals forbidden, `delete` on a variable throws. ES modules and classes are always in strict mode — no opt-in needed.

### 25. What is `Reflect` and `Proxy`?

`Proxy(target, handler)` wraps an object, intercepting operations (`get`, `set`, `has`, `deleteProperty`, `apply`, …) via handler traps. `Reflect` exposes those same operations as functions (`Reflect.get(obj, key)`) — typically called inside traps to perform the default behavior. Together they power reactive systems (Vue 3), validation, logging, and virtual objects.

### 26. `WeakMap` and `WeakRef` — why are they needed?

A `WeakMap`'s keys are held *weakly* — if nothing else references the key, the entry can be garbage-collected. Use for associating private data with objects you don't own (DOM nodes, 3rd-party instances) without leaking them. `WeakRef` takes a regular object and lets you observe without preventing GC. Both are escape hatches — reach for them only when ordinary references cause leaks.

### 27. Shallow equality, structural equality, referential equality.

JS `===` is referential for objects: `{a:1} === {a:1}` is `false`. Shallow equality: compare top-level keys/values. Deep/structural equality: recurse. There's no built-in deep equal — `JSON.stringify` works for simple cases, libraries like `fast-deep-equal` or `lodash.isEqual` handle Maps, Sets, Dates, and cycles.

### 28. How does `JSON.stringify` handle edge cases?

It drops `undefined`, functions, and symbols (as object values); throws on BigInt and cycles; converts `Date` to ISO strings; uses a `toJSON` method if defined. The second argument is a replacer (function or whitelist array); the third is indentation. `JSON.parse` has a reviver with symmetric semantics.
