# Mastery Plan

This plan is structured to help you progressively tackle the datatable from memory, focusing on one core concept at a time. Do not move to the next phase until the previous one is fully complete and understood.

## Phase 1: React Fundamentals Polish
Your first goal is to ensure the base React code is flawless. No performance leaks, strict types, and good component boundaries.
- Goals: `useMemo`, Generics in TypeScript, Accessibility (A11y).

## Phase 2: Mocking & GraphQL Setup
In an interview, you rely on a mock backend. Setting this up shows systemic thinking.
- Goals: Install Apollo Client, install Mock Service Worker (MSW), and connect them to your app.

## Phase 3: Data Fetching & Pagination
Moving from a static JSON import to a network request.
- Goals: Write the `useQuery`, implement a loading state (skeleton or spinner), handle error boundaries, and implement basic pagination (limit/offset).

## Phase 4: Advanced React Patterns & Race Conditions
This is where Seniors separate themselves from Mids. You need an autocomplete feature that doesn't flood the network and handles race conditions (where an older, slower request overwrites a newer, faster request).
- Goals: Debounce the input, implement request cancellation / ignoring stale promises.

## Phase 5: Mutations & Optimistic UI
Updating data and ensuring the UI feels instantly responsive.
- Goals: Write `useMutation` for changing a user's status. Program the Apollo Cache to update instantly before the network responds (Optimistic Update), and revert if the network fails.

## Phase 6: URL State Synchronization (The Staff Level Bonus)
Datatables should be shareable. If I filter by "ACTIVE" and sort by "Name", copying the URL and sending it to a coworker should yield the exact same view.
- Goals: Sync the sorting, filtering, and pagination states to the URL Query Parameters.
