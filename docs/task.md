# Tasks & Challenges

Work through these items sequentially. Write the code yourself manually.

## Challenge 1: The React Refactor
1. Modify `EmployeeTable.tsx` to remove the `getEmployees` function.
2. Use `useMemo` to derive `displayedEmployees`. Make sure to provide the correct dependency array.
3. Fix the `compareHelper` function to remove the `any` types. Hint: You can use generics `<T>` or declare `a: Employee[SortKey]`.
4. Wrap the native `<select>` with a proper `<label>` for accessibility.

## Challenge 2: Apollo & Mock Integration
1. Run `npm install @apollo/client graphql`.
2. Setup standard Apollo Client in `main.tsx` pointing to `/graphql`.
3. Set up MSW (Mock Service Worker) to intercept `/graphql` and serve the json data. *(You can use an alternative mocking approach if you prefer, as long as it behaves asynchronously).*

## Challenge 3: Network Data Fetching
1. Write a `GET_EMPLOYEES` GraphQL document.
2. Fetch the data using Apollo's `useQuery`.
3. Handle loading state: Render a loading skeleton or text.
4. Handle error state: Render an error UI if the query fails.
5. Move the "filtering" and "sorting" logic out of `useMemo` and push them to the network layer (pass them as GraphQL variables).

## Challenge 4: The Autocomplete & Race Condition
1. Add an `<input type="text" />` above the table to search for employee names.
2. Implement a debounce logic (e.g., wait 300ms after the user stops typing before sending the new query variable). You can write a custom `useDebounce` hook.
3. **Hard Question Check:** If you type "A" (takes 1000ms to resolve) and then quickly type "Al" (takes 100ms to resolve), what happens? Ensure your code natively avoids the race condition where "A" resolves last and overwrites the UI with the wrong data. (Hint: Apollo handles this natively for queries, but be ready to explain *why* or how to do it with `AbortController` in standard fetch).

## Challenge 5: Optimistic Updates
1. Add an action column with buttons (or a dropdown) to change a user's status (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
2. Write a `UPDATE_STATUS` mutation.
3. Configure the `useMutation` hook to use an `optimisticResponse` so the UI changes instantly, bypassing the network delay.

## Challenge 6: Sync to URL
1. Using standard browser APIs (`URLSearchParams` and `window.history.pushState`) OR `react-router-dom`, sync the Status filter and Sort keys to the URL.
2. On initial page load, read from the URL to set the initial state of the table.
