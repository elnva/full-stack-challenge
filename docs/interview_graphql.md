# GraphQL — Interview Questions & Answers

Assumes Apollo Client 3/4 on the consumer side, a generic server (Apollo Server / GraphQL Yoga / urql) on the producer side.

---

### 1. What is GraphQL and how does it differ from REST?

GraphQL is a query language and runtime for APIs. The client declares *exactly* the shape of data it wants in a single request; the server resolves each field. Compared to REST: one endpoint instead of many, no over/under-fetching, a strongly-typed schema as the contract, and introspection. The tradeoffs: caching is harder (no HTTP URL identity), you must defend against expensive queries, and file uploads need a convention.

### 2. Explain the schema, types, and SDL.

The schema is the contract — written in Schema Definition Language (SDL). It declares object types (`type Employee { id: ID!, name: String! }`), enums, interfaces, unions, input types, and the three root types: `Query`, `Mutation`, `Subscription`. `!` marks non-null. `[T!]!` is a non-null list of non-null items. The schema is the single source of truth that both client and server are generated/validated against.

### 3. Queries vs mutations vs subscriptions.

Queries are read-only and should be idempotent; servers may parallelize their resolvers. Mutations are writes, executed serially in the order they appear in the selection set. Subscriptions are long-lived streams (usually over WebSockets or SSE) that push events to the client — e.g. `messageAdded(roomId: ID!)`.

### 4. What is a resolver?

A function that returns the value for a single field. Signature: `(parent, args, context, info) => value`. `parent` is the resolved value of the enclosing field, `args` are the field arguments, `context` is request-scoped (auth, loaders), `info` has AST/path info. Resolvers can return promises; the runtime awaits them.

### 5. What is the N+1 problem and how do you fix it?

Resolving a list of N parents and then hitting the database once per parent for a child field = 1 + N queries. Fix with DataLoader: it batches calls inside a single tick and caches by key for the request's lifetime. Instead of `db.user.find(id)` you call `ctx.loaders.user.load(id)`, and the loader executes one `WHERE id IN (...)` query per tick.

### 6. How does GraphQL handle errors?

Errors don't replace the response — they accompany it. The response is always `{ data, errors }`. A field error nullifies the field (propagating up until it hits a nullable parent) and pushes an entry into `errors[]` with a `path`. Partial success is the default. Use `extensions.code` to categorize (e.g. `UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`). Top-level parse/validation errors return `errors` with no `data`.

### 7. Fragments — what are they for?

A fragment is a reusable selection set: `fragment EmployeeRow on Employee { id name status }`. Clients use them to share selections across queries and to scope data requirements to the component that renders it ("colocated fragments") — so changing a component updates its query without rippling through callers.

### 8. What is a directive? Give examples.

A directive annotates parts of a query or schema. Built-in query directives: `@include(if:)` and `@skip(if:)` conditionally include a field. `@defer` and `@stream` return parts of the response incrementally. Schema directives: `@deprecated(reason:)`, custom auth directives like `@auth(role: ADMIN)`.

### 9. How does Apollo Client cache data?

By default, Apollo normalizes the cache: objects are stored under `${__typename}:${id}` and queries hold references to them. Updating one field of `Employee:5` updates every query that reads it. `typePolicies` let you customize the cache ID (`keyFields`), merge strategies for lists, and computed fields. Without a stable id, Apollo falls back to storing the object inline — fine for small cases, a footgun for lists.

### 10. What is an optimistic update?

A local cache update applied *before* the server responds so the UI reflects the change instantly. In Apollo: pass `optimisticResponse` to `useMutation` alongside an `update` function. If the mutation fails, Apollo rolls back the optimistic write and re-runs `update` with the real result. Essential for star buttons, likes, and status toggles.

### 11. How would you implement pagination?

Two common shapes:
- **Offset/limit:** `employees(limit: 20, offset: 40)` — simple, but unstable if items are inserted between pages.
- **Cursor-based (Relay spec):** `employees(first: 20, after: "cursor")` returning `{ edges: [{ node, cursor }], pageInfo: { hasNextPage, endCursor } }` — stable, supports bidirectional traversal, plays well with caching.

Use cursor-based for anything user-facing; offset is acceptable for admin tables with stable data.

### 12. How do you prevent expensive / malicious queries?

Combine defences: query depth limiting, query complexity analysis (assign costs to fields, reject above a threshold), persisted queries (server only accepts hashes of pre-approved documents), timeouts, and rate limiting per IP/user. Never expose the full schema to anonymous traffic without these in place.

### 13. Persisted queries — what problem do they solve?

The client no longer sends the query string at runtime; it sends a hash. The server looks up the hash in an allowlist (built at release time) and executes the matching document. Benefits: smaller payloads, reduced attack surface (arbitrary queries rejected), cacheable at the CDN by hash.

### 14. What is schema stitching vs federation?

Both combine multiple underlying GraphQL services into one. **Schema stitching** merges schemas at a gateway and delegates fields — older approach, manual conflict resolution. **Federation** (Apollo) treats subgraphs as first-class: each subgraph declares which types it owns and extends, and the gateway composes them using directives (`@key`, `@external`, `@requires`). Federation scales across teams; stitching is simpler for small compositions.

### 15. Input types vs regular types.

Object types are for *outputs* (what resolvers return). Input types are for *arguments* — they can't contain functions or interfaces, only scalars and other input types. This separation keeps the argument schema mechanically serializable and prevents circular fetching logic from leaking into inputs.

### 16. Scalars — built-in and custom.

Built-in: `Int`, `Float`, `String`, `Boolean`, `ID`. Custom scalars let you enforce domain types: `DateTime`, `Email`, `URL`, `UUID`. You implement `serialize` (value → output), `parseValue` (variable input), and `parseLiteral` (inline literal). Beware: clients won't automatically understand custom scalars — they're strings on the wire.

### 17. Interfaces vs unions.

Both express "this field returns one of several types." An **interface** requires shared fields (`interface Node { id: ID! }`); implementers must include them. A **union** imposes no shared shape (`union SearchResult = User | Post`). Clients disambiguate with inline fragments: `... on User { name }`. `__typename` is the tag.

### 18. How does introspection work and should you disable it in production?

Every GraphQL server answers meta-queries about its own schema (`__schema`, `__type`). This powers tooling (GraphiQL, codegen). In production, some teams disable introspection for unauthenticated traffic to reduce surface area, though a determined attacker can still probe via query errors. Persisted queries are a stronger defence.

### 19. What's a `@key` directive in federation?

It declares an entity's identifying fields in a subgraph: `type User @key(fields: "id")`. The gateway uses it to resolve references across subgraphs — when subgraph A returns a `User { id }` and subgraph B owns `User.email`, the gateway issues a `_entities` query to B with the key to resolve the remaining fields.

### 20. What is `fetchPolicy` in Apollo and what are the options?

It controls how a query interacts with the cache.
- `cache-first` (default): return cache if present, else network.
- `cache-and-network`: return cache immediately, *also* fire network and update.
- `network-only`: always fetch, still write to cache.
- `no-cache`: fetch, never write.
- `cache-only`: read cache, error if miss.
- `standby`: no fetch until re-enabled — for paused queries.

### 21. How do subscriptions work in transport?

Two common transports: **WebSockets** with the `graphql-ws` protocol (the older `subscriptions-transport-ws` is deprecated), and **SSE** for one-way server→client streams. The client opens a long-lived connection; the server sends `next`, `complete`, or `error` frames keyed by subscription id.

### 22. Mutation design — single vs composite result types.

Return a mutation-specific payload type, not the bare entity: `type UpdateEmployeeStatusPayload { employee: Employee, errors: [UserError!] }`. This gives you room to add fields (client-side errors, derived values) without breaking consumers, and lets you surface validation errors inside `data` instead of abusing top-level `errors`.

### 23. What does "graph" mean in GraphQL — is it about graph databases?

No. The "graph" refers to the *application data graph* — the network of relationships between your entities exposed as a single queryable schema. The backing store can be Postgres, Mongo, REST microservices, or anything else; GraphQL is a facade.

### 24. What is `__typename` and why do clients request it?

A meta field every object type implicitly has, returning the type name as a string. Clients like Apollo and Relay add it automatically to every selection so the cache can normalize entries by type and resolve unions/interfaces.

### 25. How do you version a GraphQL API?

You don't — not the way REST does. You add fields freely (additive changes are safe) and mark old ones `@deprecated(reason:)`. Clients get a warning in tooling; you monitor usage and remove the field once traffic drops to zero. Breaking changes require coordination, never a `/v2` endpoint.

### 26. Query variables vs inline arguments — why prefer variables?

Variables separate the query document from its inputs: `query Emp($id: ID!) { employee(id: $id) { ... } }` sent with `{ id: "5" }`. Benefits: the query string is constant (better caching, persisted queries), no string interpolation injection risk, and the server validates variable types against the schema.

### 27. What is a resolver chain?

The tree of resolver executions for a query. Each field's resolver runs after its parent resolves, with the parent value as the first argument. The runtime parallelizes siblings; mutation siblings are serialized. Understanding the chain is how you reason about DataLoader batching windows and auth checks.
