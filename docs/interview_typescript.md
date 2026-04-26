# TypeScript — Interview Questions & Answers

TS 5.x, with React/Node context in mind.

---

### 1. What does TypeScript add over JavaScript?

Static typing, type inference, structural type checking, and a compiler that erases types to plain JS. You get IDE autocomplete, refactoring safety, and catches errors at build time that would otherwise surface at runtime. TS does *not* change runtime behavior — types are gone after compilation.

### 2. `any` vs `unknown` vs `never`.

- `any`: opts out of type checking. The value can do anything and flow anywhere. Contagious and unsafe — use sparingly.
- `unknown`: the safe counterpart. Accepts anything but you must narrow (via type guards) before using it.
- `never`: a value that never occurs. Return type of functions that throw or loop forever; the type of an exhaustively-handled variable in a `switch`.

### 3. Structural vs nominal typing.

TS is structurally typed: two types are compatible if their shapes match, regardless of declaration. `{ name: string }` accepts any object with a `name: string` field. Nominal typing (Java, C#) requires an explicit `implements`/`extends` relationship. To simulate nominal types in TS, use *branded types*: `type UserId = string & { readonly __brand: 'UserId' }`.

### 4. Interface vs type alias — when to use which?

Both describe object shapes. Differences:
- `interface` can be *declaration-merged* (multiple declarations combine) — essential for augmenting third-party types.
- `interface` can only describe object/function shapes; `type` can alias anything (unions, primitives, tuples, mapped types).
- `type` is slightly more flexible for computed types.

Rule of thumb: `interface` for public API shapes and class contracts, `type` for unions, utilities, and internal aliases.

### 5. Union vs intersection types.

Union `A | B`: a value that is *either* A or B — you can only access members common to both until you narrow. Intersection `A & B`: a value that is *both* A and B — it has every member of each. Intersections are how you compose mixins; unions are how you model state machines and variants.

### 6. What are generics?

Type parameters that let a function/class/type work over a family of types while preserving the relationship. `function identity<T>(x: T): T` returns the same type it receives. Constraints: `<T extends { id: string }>`. Defaults: `<T = string>`. Inference fills them in at call sites so callers rarely write them explicitly.

### 7. Explain type narrowing.

The compiler tracks how a value's type refines within a scope based on control flow. `typeof x === 'string'`, `Array.isArray(x)`, `x instanceof Date`, `'prop' in x`, and discriminated unions all narrow. User-defined type guards: `function isUser(x: unknown): x is User { ... }` teach the compiler a custom narrowing.

### 8. Discriminated unions.

A union where each member has a shared literal tag field:

```ts
type Result = { ok: true; value: string } | { ok: false; error: Error };
```

Switching on `result.ok` narrows each branch to the right shape. The pattern makes impossible states (both value *and* error) unrepresentable and gives exhaustiveness for free.

### 9. `readonly` and immutability.

`readonly` on a property: can't be reassigned. `ReadonlyArray<T>` / `readonly T[]`: no `push`, `pop`, etc. — but still aliasable to a mutable array. `as const`: deeply readonly and narrows literals (`'ACTIVE'` instead of `string`). TS doesn't enforce runtime immutability — `Object.freeze` does that.

### 10. Mapped types.

Transform every property of a type:

```ts
type Partial<T> = { [K in keyof T]?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

Key remapping (`as`) lets you rename: `{ [K in keyof T as \`get${Capitalize<K & string>}\`]: () => T[K] }`. Foundation of nearly every utility type.

### 11. Conditional types.

`T extends U ? X : Y` — evaluated at type level. Combined with `infer` they extract parts of other types:

```ts
type ReturnType<T> = T extends (...a: any[]) => infer R ? R : never;
```

Distribute over unions: `T extends string ? T[] : never` applied to `'a' | 'b'` gives `'a'[] | 'b'[]`.

### 12. What are the main utility types?

- `Partial<T>` / `Required<T>`: toggle optionality.
- `Readonly<T>`: make props readonly.
- `Pick<T, K>` / `Omit<T, K>`: subset / remove keys.
- `Record<K, V>`: object with keys K, values V.
- `Parameters<F>` / `ReturnType<F>` / `ConstructorParameters<F>`.
- `Awaited<T>`: unwrap promise chains.
- `NonNullable<T>`: strip `null`/`undefined`.
- `Exclude<T, U>` / `Extract<T, U>`: subtract / intersect from a union.

### 13. `keyof`, `typeof`, `in`.

- `keyof T`: the union of property names of T. `keyof { a: 1; b: 2 }` = `'a' | 'b'`.
- `typeof v`: *value-to-type* operator — take a runtime value's type and use it in the type domain. Often used with `as const` for literal preservation.
- `in`: used in mapped types and in the `in` operator's runtime narrowing.

### 14. What is `infer`?

Used inside a conditional type's `extends` clause to extract a sub-type. `type First<T> = T extends [infer F, ...any[]] ? F : never`. Essential for library types that peek inside function signatures, promises, tuples.

### 15. `strict` mode — what does it turn on?

`"strict": true` enables the bundle: `strictNullChecks` (null/undefined not assignable everywhere), `noImplicitAny`, `strictFunctionTypes` (contravariant parameter checking), `strictBindCallApply`, `strictPropertyInitialization`, `alwaysStrict`, `useUnknownInCatchVariables`. Turning these on catches whole categories of bugs — always start new projects with strict on.

### 16. Declaration merging.

Multiple `interface Foo {}` declarations in the same scope merge into one. Namespaces merge with interfaces/classes. You can also augment external modules: `declare module 'some-lib' { interface Config { extraOption: string } }`. This is how you extend types you don't own — Express request objects, React DOM attributes, etc.

### 17. `enum` vs union of literals vs `as const` object.

- Numeric `enum`: emits runtime code, reverse mapping — more bundle size and legacy baggage.
- `const enum`: inlined at compile time, but incompatible with isolated modules and `babel`.
- Union of literals (`type Status = 'ACTIVE' | 'INACTIVE'`): zero runtime cost, plays well with discriminated unions.
- `as const` object (`const Status = { ACTIVE: 'ACTIVE' } as const; type Status = typeof Status[keyof typeof Status]`): gives you both a runtime value and an equivalent type.

The last two are preferred in modern code.

### 18. Covariance and contravariance.

Function *parameters* are contravariant (a function taking `Animal` is assignable where one taking `Dog` is expected — it accepts more). Function *return types* are covariant (a function returning `Dog` is assignable where one returning `Animal` is expected). TS applies bivariance to method parameters by default for ergonomics; `strictFunctionTypes` enforces strict contravariance on function-typed *properties*.

### 19. `void` vs `undefined`.

`undefined` is the value. `void` is "the return value is intentionally ignored" — in a callback signature, `() => void` tolerates callbacks that return any value, because the caller throws it away. You can't use a `void`-returning function's value, even if at runtime it returns something.

### 20. What is a type predicate?

The return-type syntax `x is Foo`. The function returns `boolean` at runtime, but the compiler uses the predicate to narrow the argument in the caller:

```ts
function isString(x: unknown): x is string { return typeof x === 'string' }
if (isString(v)) v.toUpperCase();
```

### 21. `satisfies` operator — what does it do?

Checks that a value conforms to a type *without* widening its inferred type.

```ts
const config = { host: 'x', port: 8080 } satisfies Config;
config.port.toFixed(); // still 'number', not widened to Config's 'number | string'
```

Use it for config objects and lookup tables where you want both validation and precise inference.

### 22. Why does `as` feel unsafe?

`x as T` is an *assertion*, not a conversion — the compiler trusts you. There's no runtime check. If you're wrong, you get a runtime crash later with no type error. Prefer type guards, schema validators (`zod`), or `unknown` + narrowing. `as const` is the safe exception — it narrows, it doesn't override.

### 23. Index signatures and `Record`.

An index signature `{ [key: string]: User }` says "any string key maps to a User". Lookup returns `User`, not `User | undefined`, even when the key may not exist — this is a common foot-gun. Enable `noUncheckedIndexedAccess` to get the correct `User | undefined` type. `Record<K, V>` is the generic form.

### 24. How do you type React components?

Function components: `function Foo(props: FooProps) { ... }` — no `React.FC` needed (and `FC` adds implicit `children`, which you usually don't want). For props with children: declare `children: React.ReactNode`. For refs: `React.Ref<HTMLDivElement>`. Use `ComponentPropsWithoutRef<'button'>` to inherit all native button props.

### 25. Generics in React.

You can write generic components: `function List<T>(props: { items: T[], render: (item: T) => ReactNode })`. TSX treats `<T>` as a tag, so use `<T,>` (trailing comma) or `<T extends unknown>` in `.tsx` files. Generic hooks are straightforward: `function useLatest<T>(value: T): RefObject<T>`.

### 26. `tsc --noEmit` and type-only imports.

`--noEmit` runs type checking without producing JS — the typical CI setup when you let Babel/esbuild/swc do the transpile. Type-only imports (`import type { User } from './user'`) are erased at compile time, avoiding circular-dependency issues and ensuring nothing at runtime pulls in the module just for a type.

### 27. Template literal types.

Types built from string literals: `type Path = \`/users/\${string}\``. Combined with unions they generate variants: `type Event = \`on\${Capitalize<'click' | 'hover'>}\`` → `'onClick' | 'onHover'`. Used extensively in libraries that type string DSLs (routes, CSS-in-JS, event emitters).

### 28. How do you approach "impossible states"?

Model your types so invalid combinations can't be expressed. Instead of `{ loading: boolean, data?: T, error?: Error }` (8 combinations, only 3 valid), use a discriminated union: `{ status: 'idle' } | { status: 'loading' } | { status: 'success', data: T } | { status: 'error', error: Error }`. The compiler forces you to handle each state.

### 29. `Pick<T, K>` / `Omit<T, K>` — gotchas.

`Omit` uses `Exclude<keyof T, K>`, which does *not* distribute over unions — omitting a key from `A | B` loses discriminants. For discriminated unions, write a distributive variant: `type DistributiveOmit<T, K> = T extends any ? Omit<T, K> : never`. This comes up constantly when wrapping components and stripping props.

### 30. What's the difference between a type assertion and a type guard?

An **assertion** (`x as T`) is a promise to the compiler with no runtime effect. A **type guard** (runtime check that narrows a type) performs actual validation and returns a boolean the compiler trusts because you proved it. Guards compose, fail safely, and work at system boundaries — assertions belong only where you genuinely know more than the compiler.
