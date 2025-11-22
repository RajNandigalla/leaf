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

- **Zustand**: Lightweight state management for global application state. See [Zustand Documentation](./ZUSTAND.md).
  - **User Store**: Manages authentication, user data, and preferences with localStorage persistence.
  - **UI Store**: Manages theme, sidebar, modals, and notifications.
  - **Middleware**: Configured with persist (localStorage) and devtools (Redux DevTools) middleware.
- **Apollo Client**: Used for GraphQL data fetching. Configured in `src/lib/apollo.ts`.
- **Axios**: Used for REST API requests. Configured in `src/lib/axios.ts`.
- **Firebase Remote Config**: Used for dynamic feature flagging and configuration. See [Firebase Integration](./FIREBASE_INTEGRATION.md).
  - **Context**: `RemoteConfigContext` fetches config on app load.
  - **Hook**: `useRemoteConfig` provides easy access to values.
- **React Context**: Used for specific use cases like Remote Config and dependency injection.

## API Mocking

For development and testing, the application uses Mock Service Worker (MSW) with Faker.js. See [API Mocking](./API_MOCKING.md).

- **MSW**: Intercepts and mocks REST and GraphQL requests.
- **Faker.js**: Generates realistic random data for mocked responses.
- **Configuration**: Enabled via `NEXT_PUBLIC_API_MOCKING=enabled` environment variable.
- **Handlers**: Defined in `src/mocks/handlers.ts`.
- **Test Page**: `/playground/mocks` demonstrates both REST and GraphQL mocking.

## Internationalization (i18n)

The application supports multiple languages with type-safe translations. See [i18n Documentation](./I18N.md).

- **Framework**: `next-i18next` for Next.js integration.
- **Supported Languages**: English (default), Spanish, French.
- **Type Safety**: TypeScript declarations in `src/types/i18next.d.ts` provide IntelliSense and compile-time errors.
- **Language Switcher**: `src/components/LanguageSwitcher.tsx` for easy language switching.
- **Locale Files**: `public/locales/{locale}/common.json` for translations.

## Environment Variables

Type-safe environment variable access with IntelliSense. See [Environment Variables](./ENVIRONMENT_VARIABLES.md).

- **Utility**: `src/utils/env.ts` provides type-safe `env()` function.
- **Benefits**: IntelliSense, automatic fallbacks, centralized definitions.
- **Usage**: Replace `process.env` with `env()` for type safety.

## Design System (@clover)

The project uses an internal design system located in `src/@clover`. This ensures consistency across the application.

- **Themes**: Centralized theme definitions.
- **Icons**: Standardized icon set.
