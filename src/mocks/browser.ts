// MSW = Mock Service Worker.
// This file creates the browser-side mock worker.
//
// A worker is the thing that runs in the browser and intercepts network requests
// before they go to a real server.
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// setupWorker() creates the MSW worker and gives it the list of request handlers.
// The handlers tell MSW how to respond to mocked API requests.
export const worker = setupWorker(...handlers);