# API Mocking

This document covers the API mocking setup using Mock Service Worker (MSW) and Faker.js for development and testing.

## Overview

The application uses MSW to intercept and mock both REST and GraphQL API requests, with Faker.js generating realistic random data.

## Configuration

### Files

- **`src/mocks/handlers.ts`** - Request handlers for REST and GraphQL
- **`src/mocks/browser.ts`** - MSW worker for browser
- **`src/mocks/server.ts`** - MSW server for Node.js (tests)
- **`src/mocks/index.ts`** - Initialization helper
- **`public/mockServiceWorker.js`** - Service worker script (auto-generated)

### Environment Variable

```bash
NEXT_PUBLIC_API_MOCKING='true'
```

## Usage

### Enable Mocking

Set the environment variable in `.env.local`:

```bash
NEXT_PUBLIC_API_MOCKING='true'
```

### REST API Mocking

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
    ]);
  }),
];
```

### GraphQL Mocking

```typescript
// src/mocks/handlers.ts
import { graphql, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

export const handlers = [
  graphql.query('GetUsers', () => {
    return HttpResponse.json({
      data: {
        users: [
          {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
          },
        ],
      },
    });
  }),
];
```

## Testing

Visit `/playground/mocks` to see both REST and GraphQL mocks in action.

## Using in Tests

```typescript
// jest.setup.js or test file
import { server } from '@/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Faker.js Examples

```typescript
import { faker } from '@faker-js/faker';

// Person
faker.person.fullName();
faker.person.firstName();
faker.person.lastName();

// Internet
faker.internet.email();
faker.internet.url();
faker.internet.avatar();

// Commerce
faker.commerce.productName();
faker.commerce.price();

// Date
faker.date.past();
faker.date.future();

// Lorem
faker.lorem.paragraph();
faker.lorem.sentence();
```

## Best Practices

1. **Keep mocks close to reality** - Use Faker to generate realistic data
2. **Match production API structure** - Ensure mock responses match real API
3. **Test error scenarios** - Create handlers for error cases
4. **Disable in production** - Never enable mocking in production builds
5. **Use for development** - Speed up development without backend dependencies
