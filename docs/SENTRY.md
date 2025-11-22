# Sentry Monitoring

We use [Sentry](https://sentry.io/) for error tracking and performance monitoring.

## Configuration

- **Client-side**: `sentry.client.config.ts` initializes Sentry for the browser.
- **Server-side**: `sentry.server.config.ts` initializes Sentry for the Node.js server.
- **Edge**: `sentry.edge.config.ts` initializes Sentry for Edge routes.

## Environment Variables

Ensure the following variable is set in your `.env.local` (and production environment):

```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## Usage

Errors are automatically captured by the global error handlers. You can also manually report errors using the helper in `src/utils/errorHandler.ts`:

```typescript
import { handleError } from '@/utils/errorHandler';

try {
  // ... risky code
} catch (error) {
  handleError(error as Error, { context: 'custom context' });
}
```
