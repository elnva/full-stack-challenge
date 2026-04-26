// Apollo Client is the library that lets our React app talk to GraphQL.
//
// It handles sending queries, storing cached data, and updating components
// when the data changes.
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// HttpLink is the network connection.
// It tells Apollo where GraphQL requests should be sent.
const link = new HttpLink({
    uri: "/graphql",
});

// InMemoryCache stores GraphQL results in the browser memory.
// This helps Apollo avoid unnecessary repeated requests.
const cache = new InMemoryCache();

// ApolloClient is the main GraphQL client object.
// We export one shared client instance for the whole app.
export const client = new ApolloClient({
    link,
    cache,
})