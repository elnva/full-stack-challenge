import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { client } from "./apollo/client";
import {ApolloProvider} from "@apollo/client/react";

async function enableMocking() {
  // Only load MSW in development.
  // This keeps the mock setup out of production builds.
  if (import.meta.env.DEV) {
    // Dynamically import the worker so the browser mock code is only loaded
    // when we actually need it.
    const { worker } = await import("./mocks/browser");

    // Start the mock worker before rendering the app.
    // onUnhandledRequest: 'bypass' means requests that do not match a mock
    // handler are allowed to continue to the real network.
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

// Wait for the mock worker to be ready before mounting the React app.
// This helps make sure GraphQL requests are intercepted from the start.
await enableMocking();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* ApolloProvider makes the Apollo client available to all React components. */}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
);
