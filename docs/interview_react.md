# React — Interview Questions & Answers

Targeted at mid/senior React roles. Assumes React 18+/19.

---

### 1. What is the Virtual DOM and why does React use it?

The Virtual DOM is an in-memory tree of plain JavaScript objects describing the UI. On each render, React diffs the new tree against the previous one (reconciliation) and commits only the minimal set of real DOM mutations. This decouples *what you describe* (declarative JSX) from *how it's applied*, and avoids the cost of repeated layout/reflow caused by naive imperative DOM updates.

### 2. Explain reconciliation and the role of `key`.

Reconciliation is React's diffing algorithm. It assumes elements of different types produce different trees, and uses `key` to match children across renders in a list. Without stable keys, React falls back to positional matching, which causes state to attach to the wrong item when the list reorders — breaking inputs, focus, and animations. Keys must be stable, unique among siblings, and not derived from the array index when the list can reorder.

### 3. What's the difference between state and props?

Props are inputs passed from a parent — read-only from the child's perspective. State is data owned and mutated by the component itself via `useState`/`useReducer`. Props flow down; state changes trigger a re-render of the owning component and its subtree. Lifting state up (moving it to a common ancestor) is how you share state between siblings.

### 4. Why must hooks be called at the top level and only inside components?

Hooks rely on the *call order* within a render to associate each call with its internal state slot. Calling them conditionally or inside loops would shift the indices between renders, misaligning state. The ESLint rule `react-hooks/rules-of-hooks` enforces this. Custom hooks (functions starting with `use`) follow the same constraints.

### 5. `useMemo` vs `useCallback` vs `React.memo` — when to use each?

- `useMemo(fn, deps)` caches the *result* of a computation between renders.
- `useCallback(fn, deps)` caches a *function identity* so child components relying on referential equality don't re-render.
- `React.memo(Component)` skips rendering a child when its props are shallow-equal to the previous render.

They're all optimizations. Reach for them when you've measured a real cost — otherwise they add noise and create stale-closure bugs.

### 6. What is a stale closure?

A closure captures variables at the moment the function was created. Inside an effect or a memoized callback, captured variables become stale when their deps array omits them. The fix is usually adding the missing dep, using the updater form of `setState` (`setX(prev => ...)`), or moving the value into a ref when you deliberately want to read the "latest" without re-subscribing.

### 7. Explain `useEffect`'s dependency array and cleanup.

The effect runs after commit. It re-runs whenever any dependency changes by `Object.is` equality, and the cleanup returned from the *previous* run executes before the next run (and on unmount). Omitting the array runs the effect every render; passing `[]` runs it once on mount. In Strict Mode (dev), React intentionally mounts → unmounts → remounts to surface missing cleanups.

### 8. Controlled vs uncontrolled components.

A controlled input's value lives in React state (`value` + `onChange`). An uncontrolled input's value lives in the DOM and is read via a ref or on submit. Controlled gives you validation, formatting, and derived UI for free; uncontrolled is lighter for large forms where React doesn't need to know every keystroke.

### 9. What is context and when should you *not* use it?

`React.createContext` + `useContext` broadcasts a value to any descendant without prop drilling. The pitfall: every consumer re-renders whenever the context value's reference changes. Don't use it as a general state manager for frequently-changing values — split contexts by update frequency, memoize the value, or reach for a dedicated store (Zustand, Redux, Jotai) instead.

### 10. How does React batch state updates?

In React 18, all state updates inside event handlers, effects, timeouts, promises, and native handlers are automatically batched into a single render per microtask. Before 18, only updates inside React event handlers batched. You can opt out for a specific update with `flushSync` when you need the DOM updated before reading layout.

### 11. What is Suspense?

Suspense lets a component "wait" for something (code, data) and display a fallback in the meantime. A child throws a promise; the nearest `<Suspense fallback={...}>` catches it and renders the fallback until the promise resolves. Used by `React.lazy` for code-splitting and by data libraries (Relay, RSC, Apollo's `useSuspenseQuery`) for data fetching.

### 12. Server Components vs Client Components.

Server Components (RSC) render on the server, never ship JS to the client, and can directly read from databases or the filesystem. Client Components run in the browser and can hold state, use effects, and attach event handlers. You mark a module as client-side with `"use client"`. The boundary is one-way: a Client Component can't import a Server Component, but it can receive one as children/props.

### 13. What's the difference between `useLayoutEffect` and `useEffect`?

`useEffect` runs asynchronously after the browser paints. `useLayoutEffect` runs synchronously after DOM mutation but before paint. Use `useLayoutEffect` only when you need to measure the DOM and synchronously re-apply style/layout — otherwise prefer `useEffect` to avoid blocking paint.

### 14. Explain error boundaries.

An error boundary is a class component implementing `componentDidCatch` and/or `getDerivedStateFromError`. It catches render, lifecycle, and constructor errors in its subtree and displays a fallback UI. It does *not* catch errors in event handlers, async code, or SSR — those need try/catch or a global handler.

### 15. What is lifting state up?

When two siblings need the same state, you move it to their closest common ancestor and pass it down as props. It's the React equivalent of "single source of truth" and the reason most non-trivial trees end up with a handful of stateful ancestors and many presentational leaves.

### 16. Refs — what are they for?

Refs give you an imperative handle to either a DOM node or a mutable value that persists across renders without triggering re-renders. Use them for focus management, scroll position, integrating imperative libraries (maps, charts), or storing the latest value of something without causing a re-subscribe.

### 17. What is `forwardRef` and when is it needed?

By default refs can't be attached to function components, because the component receives `props`, not `ref`. `forwardRef` lets a component accept a ref and forward it to an inner DOM node — essential when building reusable primitives (inputs, buttons) that callers need to focus or measure. React 19 relaxes this: plain function components can accept `ref` as a prop directly.

### 18. Concurrent rendering — what changed in React 18?

The renderer gained the ability to pause, resume, and abandon renders. Features unlocked: automatic batching, `startTransition` for low-priority updates, `useDeferredValue` to show stale content while new content renders, and Suspense for data fetching. Concurrent rendering is opt-in per update, not a global mode.

### 19. `startTransition` vs debouncing.

Debouncing delays *when* you update state (trailing by N ms). `startTransition` marks an update as low priority — React can interrupt it to keep typing responsive and will discard intermediate results if a newer transition starts. Debounce for rate limiting a network call; `startTransition` for keeping the UI responsive while rendering a heavy list.

### 20. How does React handle events?

React attaches a single delegated listener at the root and synthesizes cross-browser events (`SyntheticEvent`). Handlers are called in capture or bubble phase matching DOM semantics. In React 17+, delegation is on the root container, not `document`, which makes multiple React roots on one page coexist safely.

### 21. What is the render → commit → effect lifecycle?

*Render phase:* React calls your component, builds the virtual tree. Must be pure — no side effects. *Commit phase:* React applies DOM mutations, runs `useLayoutEffect`, updates refs. *After paint:* `useEffect` runs. Understanding this ordering is how you reason about when a ref is attached, when the DOM is measurable, and why effects don't block paint.

### 22. Why is `useState(initializer)` sometimes a function?

`useState(expensiveFn())` calls `expensiveFn` on *every* render even though React ignores the result after mount. `useState(() => expensiveFn())` calls it lazily — only on the initial render. Same pattern applies to `useReducer`'s third-argument init function.

### 23. What causes "Cannot update a component while rendering a different component"?

Calling a setter during the render of another component (directly or via a child's render). The fix: move the update into an effect, an event handler, or derive the value instead of storing it. If you find yourself syncing state with props via effect, you almost always want to *compute* it during render or reset via `key` instead.

### 24. How does React decide whether to re-render?

A component re-renders when (a) its own state or one of its subscribed contexts changes, (b) its parent re-renders and passes new props, or (c) a hook it consumes schedules an update. `React.memo` + referentially stable props can short-circuit (b). There's no dirty-checking based on "did props change meaningfully" unless you opt in.

### 25. Testing — what's the philosophy behind React Testing Library?

Test the component the way a user interacts with it: query by accessible role/label, fire events that mirror real input, assert on visible output. Avoid testing implementation details (instance state, internal methods). Snapshots are tolerated for small, stable markup but rot fast for anything else.

### 26. What is hydration and what can go wrong?

Hydration attaches React event listeners and reconciles client-side state onto server-rendered HTML. It *must* produce the same tree on the first client render — otherwise you get a hydration mismatch (warnings, possibly a full client re-render). Common causes: using `Date.now()`, `Math.random()`, `window`/`document` during render, or branching on a client-only value before the first effect runs.

### 27. What is prop drilling and how do you avoid it?

Passing a prop through several intermediate components that don't themselves need it. Fixes in order of escalation: component composition (pass children/render props instead of data), context (for genuinely shared state), or a dedicated store. Drilling two levels is fine — ten levels is a smell.
