# API Integration

This document details the data fetching strategies used in the LeafInk project.

## GraphQL (Apollo)

We use [Apollo Client](https://www.apollographql.com/docs/react/) for interacting with GraphQL APIs.

### Setup

- **Client Initialization**: `src/lib/apollo.ts` creates the Apollo Client instance.
- **Provider**: The application is wrapped with `ApolloProvider` in `src/pages/_app.tsx`.

### Usage

Use standard Apollo hooks in your components:

```tsx
import { useQuery, gql } from '@apollo/client';

const GET_DATA = gql`
  query GetData {
    items {
      id
      name
    }
  }
`;

function MyComponent() {
  const { loading, error, data } = useQuery(GET_DATA);
  // ...
}
```

## REST API (Axios)

We use [Axios](https://axios-http.com/) for making HTTP requests to REST endpoints.

### Setup

- **Instance**: `src/lib/axios.ts` exports a pre-configured Axios instance with base URL and default headers.

### Usage

Import the `api` instance to make requests:

```typescript
import api from '@/lib/axios';

async function fetchData() {
  try {
    const response = await api.get('/items');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
  }
}
```
