# Project Architecture

This document provides an overview of the architectural decisions and structure of the LeafInk project.

## Project Structure

The project follows a standard Next.js structure with some custom organization:

- **`src/pages`**: Next.js file-based routing.
  - `api/`: Server-side API routes.
  - `playground/`: Test pages for development (e.g., Remote Config test).
- **`src/components`**: Reusable React components.
- **`src/lib`**: Third-party library initializations (Firebase, Apollo, Axios).
- **`src/hooks`**: Custom React hooks (e.g., `useRemoteConfig`).
- **`src/contexts`**: React Context providers for global state.
- **`src/utils`**: Utility functions and helpers.
- **`src/@clover`**: Internal design system and shared core modules.
  - `core/`: Core logic and constants.
  - `icons/`: SVG icon components.
  - `themes/`: Theming definitions.

## Error Handling

We implement a robust error handling strategy to catch and report errors effectively. For detailed Sentry configuration, see [Sentry Documentation](./SENTRY.md).

- **Global Error Boundary**: `src/components/ErrorBoundary.tsx` wraps the application to catch React render errors. It displays a user-friendly fallback UI.
- **Global Handlers**: `src/pages/_app.tsx` sets up `window.onerror` and `window.onunhandledrejection` to catch runtime errors and promise rejections.
- **Utility**: `src/utils/errorHandler.ts` contains the logic for logging errors and reporting them to Sentry (if configured).

## Security

### Content Security Policy (CSP)

We enforce a strict Content Security Policy to mitigate XSS and other attacks. See [CSP Documentation](./CSP.md) for details.

- **Implementation**: `src/utils/csp.ts` generates the CSP header string.
- **Middleware**: The CSP is applied via Next.js middleware (or headers configuration) to ensure it covers all routes.

## State Management & Data Fetching

For detailed API documentation, see [API Integration](./API.md).

- **Apollo Client**: Used for GraphQL data fetching. Configured in `src/lib/apollo.ts`.
- **Firebase Remote Config**: Used for dynamic feature flagging and configuration. See [Firebase Integration](./FIREBASE_INTEGRATION.md).
  - **Context**: `RemoteConfigContext` fetches config on app load.
  - **Hook**: `useRemoteConfig` provides easy access to values.
- **React Context**: Used for global application state where appropriate (e.g., Remote Config status).

## Design System (@clover)

The project uses an internal design system located in `src/@clover`. This ensures consistency across the application.

- **Themes**: Centralized theme definitions.
- **Icons**: Standardized icon set.
