/*
**`src/mocks/handlers.ts`** —
* MSW v2 `graphql.query('Employees', ...)`
* handler that reads `data/employees.json`
* and returns `{ data: { employees: [...] } }`.
* Use `graphql.link(...)`
* only if pointing Apollo at a non-default URI;
* otherwise default `/graphql`.
*/

import {graphql, HttpResponse} from "msw";
import employees from "../../data/employees.json";

// A "handler" is just a function that tells MSW:
// "When you see a certain request, don't send it to the real server.
// Instead, return this fake response."
//
// In other words, this file describes how our mock API should behave.
// MSW = Mock Service Worker. It lets us fake network requests during development.

// We export an array of handlers so MSW can register all of them at once.
// Right now we only need one handler, but later we could add more
// for mutations, pagination, or other queries.
export const handlers = [
    // graphql.query() listens for a GraphQL query request.
    //
    // The first argument is the operation name:
    // "Employees" must match the name of the GraphQL query document
    // used in the frontend.
    //
    // The second argument is the function that creates the response.
    graphql.query("Employees", () => {
        // "employees" comes from the JSON file in /data.
        // We reuse that file so our mock data stays consistent.

        // HttpResponse.json() creates a JSON response object.
        // This is what the browser will receive instead of calling a real backend.
        return HttpResponse.json({
            data: {
                // GraphQL responses usually wrap the actual result inside a "data" object.
                // The field name "employees" must match the field name in the schema/query.
                employees,
            }
        })
    })
];