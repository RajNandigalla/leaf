# Zustand State Management

This document provides comprehensive guidance on using Zustand for state management in the LeafInk project.

## Overview

Zustand is a small, fast, and scalable state management solution for React. It provides a simple API with minimal boilerplate while offering powerful features like middleware support and DevTools integration.

### Benefits

- **Minimal Boilerplate**: No providers, reducers, or actions required
- **TypeScript Support**: Full type safety out of the box
- **Performance**: Optimized re-renders through selector-based subscriptions
- **DevTools**: Redux DevTools integration for debugging
- **Persistence**: Built-in localStorage persistence middleware
- **Small Bundle Size**: ~1KB gzipped
- **No Context Provider**: Works without wrapping your app in providers

## Store Structure

The store is organized into separate slices for different domains:

```
src/store/
├── index.ts          # Main entry point, exports all stores
├── types.ts          # TypeScript type definitions
├── userStore.ts      # User authentication and preferences
└── uiStore.ts        # UI state (theme, sidebar, modals, notifications)
```

## Usage Examples

### Basic Usage

```tsx
import { useUserStore, useUIStore } from '@/store';

function MyComponent() {
  // Access state and actions
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  return (
    <div>
      <p>User: {user?.name}</p>
      <p>Theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### Using Selectors for Performance

Selectors help prevent unnecessary re-renders by subscribing only to specific state slices:

```tsx
import { useUserStore, userSelectors } from '@/store';

function UserProfile() {
  // Only re-renders when user changes, not when preferences change
  const user = useUserStore(userSelectors.user);

  return <div>{user?.name}</div>;
}
```

### Accessing Multiple State Values

```tsx
import { useUserStore } from '@/store';

function UserSettings() {
  // Subscribe to multiple values
  const { preferences, updatePreferences } = useUserStore((state) => ({
    preferences: state.preferences,
    updatePreferences: state.updatePreferences,
  }));

  return (
    <div>
      <p>Theme: {preferences.theme}</p>
      <button onClick={() => updatePreferences({ theme: 'dark' })}>Set Dark Theme</button>
    </div>
  );
}
```

### Outside React Components

You can access and update the store outside React components:

```tsx
import { useUserStore, useUIStore } from '@/store';

// Get current state
const currentUser = useUserStore.getState().user;
const currentTheme = useUIStore.getState().theme;

// Update state
useUserStore.getState().setUser({
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'user',
});

// Subscribe to changes
const unsubscribe = useUserStore.subscribe((state) => {
  console.log('User changed:', state.user);
});

// Later: unsubscribe
unsubscribe();
```

## Middleware Configuration

### Persist Middleware

The user store uses persist middleware to save state to localStorage:

```typescript
persist(
  (set) => ({
    // store implementation
  }),
  {
    name: 'user-storage', // localStorage key
    partialize: (state) => ({
      // Only persist these fields
      user: state.user,
      preferences: state.preferences,
      isAuthenticated: state.isAuthenticated,
    }),
  }
);
```

**Benefits:**

- User session persists across page refreshes
- Preferences are remembered
- Selective persistence (doesn't save loading states)

### DevTools Middleware

Both stores integrate with Redux DevTools for debugging:

```typescript
devtools(
  (set) => ({
    // store implementation
  }),
  {
    name: 'UserStore', // Name shown in DevTools
  }
);
```

**Features:**

- View current state
- Track action history
- Time-travel debugging
- State snapshots

**To use:**

1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
2. Open browser DevTools
3. Navigate to Redux tab
4. Select store from dropdown

## Store Reference

### User Store

**State:**

- `user: User | null` - Current user object
- `preferences: UserPreferences` - User preferences
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state

**Actions:**

- `setUser(user: User)` - Set current user and mark as authenticated
- `clearUser()` - Clear user and reset to defaults
- `updatePreferences(preferences: Partial<UserPreferences>)` - Update user preferences
- `setLoading(isLoading: boolean)` - Set loading state

**Selectors:**

- `userSelectors.user` - Get user object
- `userSelectors.isAuthenticated` - Get auth status
- `userSelectors.preferences` - Get all preferences
- `userSelectors.theme` - Get theme preference
- `userSelectors.language` - Get language preference

### UI Store

**State:**

- `theme: 'light' | 'dark'` - Current theme
- `sidebarOpen: boolean` - Sidebar visibility
- `modalStack: string[]` - Stack of open modal IDs
- `notifications: Notification[]` - Active notifications

**Actions:**

- `toggleTheme()` - Toggle between light and dark
- `setTheme(theme)` - Set specific theme
- `toggleSidebar()` - Toggle sidebar visibility
- `setSidebarOpen(open)` - Set sidebar state
- `openModal(modalId)` - Add modal to stack
- `closeModal(modalId)` - Remove modal from stack
- `closeAllModals()` - Clear all modals
- `addNotification(notification)` - Add notification
- `removeNotification(id)` - Remove notification
- `clearNotifications()` - Clear all notifications

**Selectors:**

- `uiSelectors.theme` - Get current theme
- `uiSelectors.sidebarOpen` - Get sidebar state
- `uiSelectors.modalStack` - Get modal stack
- `uiSelectors.notifications` - Get notifications
- `uiSelectors.hasOpenModals` - Check if any modals are open
- `uiSelectors.isModalOpen(modalId)` - Check if specific modal is open

## Best Practices

### 1. Use Selectors for Performance

```tsx
// ❌ Bad: Re-renders on any user store change
const userStore = useUserStore();

// ✅ Good: Only re-renders when user changes
const user = useUserStore((state) => state.user);

// ✅ Better: Use predefined selectors
const user = useUserStore(userSelectors.user);
```

### 2. Keep Actions Simple

```tsx
// ✅ Good: Simple, focused actions
setUser(user);
updatePreferences({ theme: 'dark' });

// ❌ Avoid: Complex logic in components
// Move complex logic into store actions instead
```

### 3. Organize by Domain

Create separate stores for different domains (user, UI, cart, etc.) rather than one large store.

### 4. Use TypeScript

Always define proper types for state and actions to catch errors at compile time.

### 5. Avoid Storing Derived State

```tsx
// ❌ Bad: Storing computed values
const fullName = user.firstName + ' ' + user.lastName;

// ✅ Good: Compute in component or selector
const fullName = useUserStore((state) =>
  state.user ? `${state.user.firstName} ${state.user.lastName}` : ''
);
```

## Migration from Context API

If you have existing Context-based state, you can gradually migrate to Zustand:

### Before (Context API)

```tsx
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

function MyComponent() {
  const { user, setUser } = useContext(UserContext);
  return <div>{user?.name}</div>;
}
```

### After (Zustand)

```tsx
// No provider needed!

function MyComponent() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  return <div>{user?.name}</div>;
}
```

### When to Use Context vs Zustand

**Use Zustand for:**

- Global application state
- Frequently updated state
- State that needs persistence
- State accessed by many components

**Use Context for:**

- Dependency injection (e.g., Firebase, Apollo)
- Theme providers (if using CSS-in-JS)
- Localization providers
- Feature flags from Remote Config

## Testing

### Testing Components Using Stores

```tsx
import { renderHook, act } from '@testing-library/react';
import { useUserStore } from '@/store';

describe('UserStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.getState().clearUser();
  });

  it('should set user', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });
    });

    expect(result.current.user).toEqual({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    });
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

## Troubleshooting

### State Not Persisting

Check that:

1. The store uses `persist` middleware
2. localStorage is available in the browser
3. The `name` option is set correctly
4. The fields are included in `partialize`

### DevTools Not Working

1. Install Redux DevTools browser extension
2. Ensure `devtools` middleware is applied
3. Check that you're in development mode
4. Look for the store name in the DevTools dropdown

### Performance Issues

1. Use selectors to subscribe to specific state slices
2. Avoid subscribing to the entire store
3. Use `shallow` comparison for objects if needed
4. Consider splitting large stores into smaller ones

## Additional Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
- [TypeScript Guide](https://github.com/pmndrs/zustand#typescript)
