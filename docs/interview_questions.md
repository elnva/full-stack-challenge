# Senior Frontend Interview Questions (Hard Mode)

These questions focus heavily on React architecture, network fetching, caching, and state management.

## 1. Race Conditions
**Question:** You have an autocomplete input. The user types "M" and a network request starts. Then quickly they type "Mac" and a second network request starts. The backend is slow to respond to "M" (takes 2 seconds), but fast to respond to "Mac" (takes 0.5 seconds). What happens to the UI, and how do you prevent the data from "M" from overwriting the data for "Mac"?
**Answer:** Without protection, the UI will first show "Mac" results, and then 1.5 seconds later, it will be overwritten by "M" results (stale data). 
**How to prevent:**
1. **AbortController:** With `fetch`, create an `AbortController`. Before the "Mac" request fires, call `controller.abort()` on the "M" request. This terminates the old network call entirely.
2. **React 19 (`use` or Suspense):** Built-in handling with strict mode dropping stale promises.
3. **GraphQL Clients:** `Apollo` and `urql` queries are mathematically linked to the latest variables. If the variables change to "Mac", Apollo natively ignores the eventual resolution of the "M" query because the active variable context has shifted.

## 2. Apollo Cache & Normalized Stores
**Question:** You execute a GraphQL query that returns an Employee with `id: 5` and `status: "ACTIVE"`. Later, you execute a completely separate query (or a mutation returns data) that includes an Employee with `id: 5` and `status: "INACTIVE"`. Will your first component update? Why or why not?
**Answer:** Yes, it will update automatically, assuming you queried the `id` field in both responses. Apollo uses a **Normalized Cache**. It stores entities by a combination of `__typename` and `id` (e.g., `Employee:5`). When the second request returns `id: 5` with a new status, Apollo merges it into the cache entity `Employee:5`. Any React component actively subscribing to `Employee:5` (via `useQuery`) will instantly re-render with the new data.

## 3. Stale Closures (The `useEffect` trap)
**Question:** In a React component, you setup a `setInterval` inside a `useEffect` with an empty dependency array `[]`. Inside the interval, you try to access a piece of React state `count`. But the `count` is always stuck at `0`. Why did this happen and how do you fix it?
**Answer:** This is a Stale Closure. The `setInterval` callback closed over the `count` variable from the *initial render* (where it was 0). Since the dependency array is `[]`, the effect never re-runs to capture the new block scope where `count` is higher.
**Fixes:** 
1. Use the functional updater: `setCount(prevCount => prevCount + 1)`. This avoids needing to read `count` directly.
2. Add `count` to the dependency array, and `clearInterval` in the cleanup function. (Though this resets the timer constantly).
3. Use a `useRef` to hold the latest `count` or the latest callback.

## 4. Derived State vs `useEffect`
**Question:** You have a `data` array prop passed to your component. You want to display a filtered version of it based on a local `search` state. You put the filtered data into its own `useState` and update it inside a `useEffect` whenever `data` or `search` changes. What's wrong with this?
**Answer:** This causes redundant re-renders. When `search` changes, the component renders once. Then the `useEffect` fires, calls the `setFilteredData`, and the component renders a *second* time.
Instead, use **Derived State**. Just calculate the filtered data directly in the render body. Wrap it in `useMemo` if the filtering is computationally expensive.

## 5. Cursors vs Offset Pagination
**Question:** For the datatable, why might your backend engineer insist on Cursor-based pagination (`after: "cursorX", first: 10`) instead of Offset-based pagination (`offset: 20, limit: 10`)?
**Answer:** Offset pagination fails in real-time systems. If a user deletes an employee from page 1 while you are viewing page 2, all the items shift up by 1. When you click "Next" to go to page 3, you will skip an item completely.
Cursor pagination relies on a pointer (the cursor, like a unique timestamp or ID tuple) to the last fetched item. "Give me the next 10 items *after* this specific employee ID" remains stable regardless of insertions or deletions earlier in the list.
