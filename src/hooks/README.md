# Hooks Directory

This directory contains **custom React hooks** for shared logic and state management.

## Purpose

Custom hooks provide reusable logic for:
- **Configuration Loading**: Fetch and cache page configurations
- **Data Fetching**: Load data from APIs with loading/error states
- **Authentication**: Manage user session and permissions
- **Form Handling**: Form state and validation
- **UI State**: Modal, toast, drawer state management

## Hook Categories

### Configuration Hooks
- `usePageConfig` - Load page configuration
- `useWidgetConfig` - Load widget configuration
- `useBootstrap` - Initial app bootstrap data

### Data Hooks
- `useData` - Generic data fetching with loading/error states
- `useQuery` - Query data with caching
- `useMutation` - Mutate data with optimistic updates

### Authentication Hooks
- `useAuth` - Current user and authentication state
- `usePermissions` - User permissions and policies
- `useSession` - Session management

### Form Hooks
- `useForm` - Form state management (uses react-hook-form)
- `useValidation` - Validation logic
- `useFieldArray` - Dynamic form fields

### UI Hooks
- `useModal` - Modal state management
- `useToast` - Toast notifications
- `useDrawer` - Drawer/sidebar state

### Utility Hooks
- `useDebounce` - Debounce values
- `useLocalStorage` - Persist state to localStorage
- `usePrevious` - Track previous value

## Hook Pattern

Custom hooks follow React hooks conventions:

```javascript
// Example: usePageConfig.js
import { useState, useEffect } from 'react';
import configService from '../services/configService';

function usePageConfig(pageId) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        setLoading(true);
        const data = await configService.getPageConfig(pageId);
        
        if (isMounted) {
          setConfig(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setConfig(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [pageId]);

  return { config, loading, error };
}

export default usePageConfig;
```

## Hook Guidelines

1. **Naming**: Start with "use" prefix: `usePageConfig`, `useAuth`
2. **Return Values**: Return object with named properties: `{ data, loading, error }`
3. **Dependencies**: Properly declare dependencies in useEffect
4. **Cleanup**: Always cleanup effects and subscriptions
5. **Error Handling**: Return error state, don't throw
6. **TypeScript**: Define return types for better DX

## Common Return Pattern

Most data-fetching hooks follow this pattern:

```javascript
return {
  data,           // The fetched data (null if loading or error)
  loading,        // Boolean indicating loading state
  error,          // Error message (null if no error)
  refetch,        // Function to refetch data
  isValidating    // Boolean indicating revalidation
};
```

## File Structure

```
hooks/
├── config/
│   ├── usePageConfig.js
│   ├── useWidgetConfig.js
│   └── useBootstrap.js
├── data/
│   ├── useData.js
│   ├── useQuery.js
│   └── useMutation.js
├── auth/
│   ├── useAuth.js
│   ├── usePermissions.js
│   └── useSession.js
├── form/
│   ├── useForm.js
│   ├── useValidation.js
│   └── useFieldArray.js
├── ui/
│   ├── useModal.js
│   ├── useToast.js
│   └── useDrawer.js
├── utils/
│   ├── useDebounce.js
│   ├── useLocalStorage.js
│   └── usePrevious.js
└── README.md
```

## Testing

Hook tests should:
- Use `@testing-library/react-hooks` (or React Testing Library)
- Test all return values
- Test loading and error states
- Test cleanup on unmount
- Mock service calls

Example test:
```javascript
import { renderHook, waitFor } from '@testing-library/react';
import usePageConfig from './usePageConfig';

test('loads page configuration', async () => {
  const { result } = renderHook(() => usePageConfig('home'));

  expect(result.current.loading).toBe(true);

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.config).toBeDefined();
  expect(result.current.error).toBeNull();
});
```

## Best Practices

1. **Composition**: Compose hooks from other hooks
2. **Memoization**: Use useMemo/useCallback for expensive operations
3. **Custom Events**: Use custom events for cross-component communication
4. **Context Integration**: Integrate with React Context where appropriate
5. **Documentation**: Document parameters and return values
6. **Error Recovery**: Provide retry/refetch mechanisms

## Dependencies

- `react` - React hooks (useState, useEffect, etc.)
- `react-hook-form` - Form state management
- Services from `src/services/`
