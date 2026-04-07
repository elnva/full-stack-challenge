# Code Review: Current Status

This is a review of the current implementation in `src/components/EmployeeTable.tsx`. Since you are aiming for a Staff/Senior level interview, an interviewer will look for perfect fundamentals before even getting to the GraphQL part.

## 🚩 Red Flags Identified

### 1. Re-rendering Performance (The Biggest Issue)
**Issue:** You are calling `{getEmployees()}` directly inside the `<tbody>`. Every time the state changes (even if it's an unrelated state, or a parent component renders), React calls `getEmployees()`. This triggers a `[...employees].sort()` and a `.filter()`.
**Why it's bad:** Sorting and filtering arrays on every render is a classic performance bottleneck. In an interview, failing to memoize expensive derived state is an immediate red flag.
**Fix:** You must use `useMemo` to cache the sorted/filtered results dependent on `sortKey`, `sortOrder`, and `statusFilter`.

### 2. Lack of Type Safety (`any`)
**Issue:** In `compareHelper`, your parameters are typed as `a: any | string, b: any | string`. 
**Why it's bad:** Using `any` in TypeScript defeats the purpose of TypeScript. As a Senior/Staff, you are expected to write strictly typed code.
**Fix:** Use generics (`<T>`) or define specific object keys to enforce type safety.

### 3. Separation of Concerns & Component Structure
**Issue:** The table, the filter dropdown, and the sorting logic are all tightly coupled inside one massive component.
**Why it's bad:** It makes testing harder and the component less readable. 
**Fix:** Extract the `StatusFilter` into its own component. Extract the `TableHead` or `TableRow` if they get complex.

### 4. Magic Strings
**Issue:** You are using `"asc"` and `"desc"`, and the status strings multiple times.
**Why it's bad:** Typo prone.
**Fix:** Export a type or enum for `SortOrder` and `StatusFilter`.

### 5. Accessibility (a11y)
**Issue:** The native `<select>` has an `id`, but no `<label>` associated with it. The `<th>` elements have `onClick` handlers but lack `role="button"` or `tabIndex={0}` for keyboard navigation.
**Why it's bad:** Senior engineers are expected to care about accessibility.
**Fix:** Add proper semantic HTML or ARIA attributes to interactive elements.
