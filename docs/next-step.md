# Progress log + next step

## Phase 2 — wire Apollo + MSW ✅ DONE

Wired end-to-end. Table now fetches via GraphQL through an MSW-mocked `/graphql` endpoint.

Files created:
- `src/graphql/schema.graphql` — SDL (extracted from `.ts` so graphql-config can point at it).
- `src/graphql/queries.ts` — `EmployeesQuery` gql doc.
- `src/mocks/handlers.ts` — MSW handler returning `data/employees.json`.
- `src/mocks/browser.ts` — `setupWorker(...handlers)`.
- `src/apollo/client.ts` — `ApolloClient` + `HttpLink({ uri: '/graphql' })` + `InMemoryCache`.
- `.graphqlrc.yml` — tells the VSCode GraphQL extension where schema + documents live.

Files modified:
- `src/main.tsx` — `await enableMocking()`, `<ApolloProvider>`.
- `src/components/EmployeeTable.tsx` — `useQuery<{ employees: Employee[] }>(EmployeesQuery)`, loading/error gates, `useMemo` deps corrected to include `data?.employees` and `statusFilter`.

### Loose ends to clean up before moving on

1. **`.env` is tracked in git.** Should be gitignored; keep only `.env.example`. Add `.env` to `.gitignore` and `git rm --cached .env`.
2. **`client.ts` ignores `VITE_GRAPHQL_URL`.** Either use `import.meta.env.VITE_GRAPHQL_URL ?? '/graphql'`, or drop the env var from `.env`/`.env.example`. Pick one — don't carry a dead variable.
3. **Manual typing of `useQuery`.** `useQuery<{ employees: Employee[] }>(EmployeesQuery)` works but drifts from the schema. Phase 3+ should introduce **GraphQL Code Generator** (`@graphql-codegen/cli` + `typescript`, `typescript-operations`, `typed-document-node` presets) so the query doc is a `TypedDocumentNode` and `data` is inferred automatically. Low priority — do it once pagination is in.
4. **React Compiler warning.** If the `preserve-manual-memoization` lint still fires, the simplest resolution with the compiler enabled is to **drop `useMemo`** — the compiler auto-memoizes based on reads. Keeping manual memoization fights the compiler.
5. **`Employee` type.** `data?.employees` is typed as `Employee[]` manually; make sure `src/types/Employee.ts` matches the schema (`id: string` because `ID` serializes to string in JSON — not number).

---

## Phase 3 — Pagination + loading skeleton + error boundary

Goal: move from "fetch all, render all" to server-driven pagination, with a loading skeleton instead of the bare `<p>Loading…</p>` and a proper error boundary around the table.

### Schema changes (`src/graphql/schema.graphql`)

Add paging args + a page-info shape:
```graphql
type EmployeePage {
  items: [Employee!]!
  total: Int!
}

type Query {
  employees(limit: Int = 20, offset: Int = 0): EmployeePage!
}
```

Offset/limit is fine for this phase. Cursor-based pagination is a Phase 6 consideration.

### Mock handler (`src/mocks/handlers.ts`)

Read `variables.limit` and `variables.offset` from the request; slice `employees` accordingly; return `{ items, total: employees.length }`.

```ts
graphql.query("Employees", ({ variables }) => {
  const { limit = 20, offset = 0 } = variables;
  return HttpResponse.json({
    data: {
      employees: {
        items: employees.slice(offset, offset + limit),
        total: employees.length,
      },
    },
  });
});
```

### Query (`src/graphql/queries.ts`)

```graphql
query Employees($limit: Int, $offset: Int) {
  employees(limit: $limit, offset: $offset) {
    items { id name role status }
    total
  }
}
```

### Component (`src/components/EmployeeTable.tsx`)

- Add `const [page, setPage] = useState(0)` and a `PAGE_SIZE` constant.
- `useQuery(EmployeesQuery, { variables: { limit: PAGE_SIZE, offset: page * PAGE_SIZE } })`.
- Replace `<p>Loading…</p>` with a **skeleton**: render `<PAGE_SIZE>` grey placeholder rows while `loading && !data`. Use `previousData` (or `keepPreviousData: true` via `fetchPolicy`) to avoid a flash on page change.
- Pager UI below the table: `Prev` / `Next` buttons, disable based on `offset <= 0` and `offset + items.length >= total`. Show `Page X of Y`.
- Sorting + filtering stay client-side for now (operating on the current page). Server-side sort/filter is a later step.

### Error boundary (`src/components/ErrorBoundary.tsx`)

Class component with `getDerivedStateFromError` and `componentDidCatch`. Fallback UI: "Something went wrong loading employees." Wrap `<EmployeeTable />` in `App.tsx`. Note: this catches **render-time** errors only — Apollo `error` from `useQuery` is already handled by the component's own guard; the boundary is for unexpected throws.

### Skeleton (`src/components/EmployeeTableSkeleton.tsx`)

A pure presentational component: renders `n` `<tr>`s with `<td>` containing a grey `<div>` styled to pulse. No hooks. Keeps the heavy component untouched.

### Verification

1. `npm run dev` → table shows first 20 rows; `Next` advances to rows 20–39; `Prev` goes back; edge buttons disabled at boundaries.
2. Network tab: each page change fires one `POST /graphql` with updated variables.
3. Throttle network → skeleton appears during the initial load, and persists during page transitions (no flash to empty).
4. Force the handler to return `errors: [{ message: "boom" }]` → Apollo's `error` branch renders; boundary *doesn't* trigger (it's for render crashes).
5. Throw inside the table's render (`if (data) throw new Error('x')`) → boundary catches and shows fallback. Revert.
6. Sort/filter controls still operate on the current page.

### Files

- Create: `src/components/ErrorBoundary.tsx`, `src/components/EmployeeTableSkeleton.tsx`.
- Modify: `src/graphql/schema.graphql`, `src/graphql/queries.ts`, `src/mocks/handlers.ts`, `src/components/EmployeeTable.tsx`, `src/App.tsx`.

---

## After Phase 3

- Phase 4: debounce a `name` search field, cancel stale requests.
- Phase 5: `updateEmployeeStatus` mutation with optimistic cache update.
- Phase 6: sync `page`, `sortKey`, `sortOrder`, `statusFilter` to URL query params.
