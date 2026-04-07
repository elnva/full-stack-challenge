# Senior Frontend Engineer Challenge

Welcome to the Frontend Engineering Challenge! This test is designed to measure your proficiency with React, state management, modern asynchronous data fetching, and performance optimization.

## Scenario
You are building an internal admin dashboard. We need a performant component to view and manage our employees. 

## The Task
Build a React Single Page Application (SPA) that displays a paginated datatable of employees fetched via GraphQL.

### Minimum Requirements
1. **Data Fetching:** Fetch employee data using a GraphQL client (e.g., Apollo Client, urql) from a simulated GraphQL endpoint.
2. **Datatable View:** Display the employees in a clean, readable table format (ID, Name, Role, Status).
3. **Filtering:** Provide a dropdown to filter employees by their `status` (`ALL`, `ACTIVE`, `INACTIVE`, `SUSPENDED`).
4. **Sorting:** Allow sorting by clicking on the column headers (`id`, `name`, `role`, `status`) in both ascending and descending order.
5. **Pagination:** Implement offset or cursor-based pagination (limiting the view to 10 employees per page).
6. **Autocomplete Search:** Add a text input to search employees by name.

## The "Senior" Bar
Providing a working datatable is the baseline. We are looking for senior-level polish. Please ensure you handle the following:

- **Optimized Rendering:** Ensure your table does not re-render unnecessarily when unrelated state changes.
- **Debouncing:** The autocomplete search should not flood the network with requests on every keystroke. Use a debounce strategy.
- **Race Condition Prevention:** If the user quickly types "A" and then "Al", guarantee that the UI never displays the result of the slower "A" request if it resolves last.
- **Optimistic UI:** Allow the user to change an employee’s status. The UI should update instantly while the mutation processes in the background. If the mutation fails, gracefully roll back the change in the UI.
- **Deep Linking (Bonus):** Synchronize your filters, sorting, and pagination with the URL search parameters so the current view can be shared via a link.

## Setup Instructions
You are starting from an empty project. You have full freedom over the tech stack, provided you meet the requirements above.

1. Initialize your project (`Vite`, `Create React App`, or `Next.js` are all acceptable).
2. Set up your GraphQL client.
3. For the backend, you may mock the GraphQL endpoint locally (we recommend `msw` - Mock Service Worker) or set up a simple local Apollo server using a static JSON file as your database.
4. Typescript is highly encouraged.

## Evaluation Criteria
- **Architecture & Component Design:** Are components scoped appropriately?
- **State Management:** Is state kept locally when possible, or lifted correctly?
- **Performance:** Is the application doing unnecessary work?
- **Network Resilience:** How well do you handle loading states, errors, and fast typing?
- **TypeScript (if used):** Are types properly inferred and safely defined?

Good luck!
