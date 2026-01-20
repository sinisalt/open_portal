# ADR-002: State Management

**Status:** Accepted  
**Date:** 2026-01-20  
**Deciders:** Development Team  
**Issue:** #004 - Technical Stack Finalization

## Context

OpenPortal is a configuration-driven UI platform where the backend provides JSON configurations that define page structure, widgets, actions, and data sources. The frontend is a rendering engine that interprets these configurations and displays the UI.

Given this architecture, we need to decide on a state management solution for:
- User authentication context (user, tenant, permissions)
- Theme and branding context (colors, fonts, logos)
- Cached configurations (page configs, widget definitions)
- Page-level state (form data, widget states, UI state)
- Ephemeral UI state (modals, toasts, loading states)

### Key Considerations

1. **Configuration-driven**: Most state comes from backend configurations
2. **Minimal global state**: User context and theme are the main global concerns
3. **Page-level state**: Form data, widget states are page-scoped
4. **Performance**: Minimize unnecessary re-renders
5. **Simplicity**: Keep state management simple and predictable
6. **Bundle size**: Avoid heavy state management libraries

## Decision

**We will use React Context API with `useContext` and `useState`/`useReducer` hooks for state management.**

### State Architecture

```typescript
// Global Contexts (shared across entire app)
- AuthContext: user, tenant, permissions, login/logout
- ThemeContext: branding, colors, fonts, theme mode
- ConfigCacheContext: cached page configurations, invalidation

// Page-Level State (scoped to individual pages)
- useState: Simple component state
- useReducer: Complex page state with multiple state transitions
- Custom hooks: Shared state logic (useFormState, useWidgetState)

// No global store for page-specific state
```

## Alternatives Considered

### Option 1: React Context API + Hooks - SELECTED ✅

**Pros:**
- ✅ Built into React (no dependencies)
- ✅ Zero bundle size impact
- ✅ Simple and predictable
- ✅ Sufficient for configuration-driven architecture
- ✅ Good performance with proper optimization
- ✅ Easy to test
- ✅ Team already familiar with Context API

**Cons:**
- ❌ Requires careful optimization to avoid unnecessary re-renders
- ❌ No built-in DevTools (unlike Redux)
- ❌ More boilerplate for complex state logic

**Why Selected:**
- Configuration-driven architecture means minimal global state needs
- Most state is ephemeral and page-scoped
- No need for time-travel debugging or complex state synchronization
- Keeps bundle size small
- Simple mental model for team

### Option 2: Redux Toolkit

**Pros:**
- ✅ Robust and battle-tested
- ✅ Excellent DevTools
- ✅ Time-travel debugging
- ✅ Well-documented patterns
- ✅ Large ecosystem

**Cons:**
- ❌ Overkill for configuration-driven UI
- ❌ Adds ~45KB to bundle
- ❌ More boilerplate and complexity
- ❌ Steeper learning curve
- ❌ Not needed for our use case

**Why Not Selected:**
- Configuration-driven architecture doesn't need complex global state
- Bundle size impact not justified
- Complexity not warranted

### Option 3: Zustand

**Pros:**
- ✅ Lightweight (~3KB)
- ✅ Simple API
- ✅ Good performance
- ✅ Less boilerplate than Redux
- ✅ Easy to learn

**Cons:**
- ❌ External dependency (though small)
- ❌ Less familiar to team
- ❌ Context API is sufficient for our needs

**Why Not Selected:**
- Context API is sufficient
- Prefer built-in solutions when possible
- Can migrate to Zustand easily if needed

### Option 4: Jotai

**Pros:**
- ✅ Atomic state model
- ✅ Small bundle (~3KB)
- ✅ Modern approach
- ✅ Good TypeScript support

**Cons:**
- ❌ Different mental model (atoms)
- ❌ Less familiar to team
- ❌ Adds complexity we don't need

**Why Not Selected:**
- Atomic state model not needed
- Context API is simpler
- Team familiarity with Context API

## Consequences

### Positive

1. **Zero dependencies**: No external state management library needed
2. **Simple mental model**: Standard React patterns, easy to learn
3. **Smaller bundle**: No additional KB added to bundle
4. **Performance**: Good performance with proper optimization
5. **Testable**: Easy to test with React Testing Library
6. **Flexible**: Can migrate to Zustand if needs grow

### Negative

1. **Optimization required**: Need to prevent unnecessary re-renders with `useMemo`, `useCallback`
2. **No DevTools**: No time-travel debugging like Redux DevTools
3. **More boilerplate**: Need to create context providers and hooks manually

### Neutral

1. **Good enough**: Context API is sufficient for configuration-driven architecture
2. **Future migration path**: Can migrate to Zustand if state management becomes complex

## Implementation Details

### Global Contexts

#### 1. AuthContext

```typescript
// AuthContext.tsx
interface AuthContextValue {
  user: UserInfo | null;
  tenant: TenantInfo | null;
  permissions: string[];
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  const login = async (credentials: Credentials) => {
    const response = await fetch('/auth/login', { /* ... */ });
    const { user, tenant, permissions, accessToken } = await response.json();
    setUser(user);
    setTenant(tenant);
    setPermissions(permissions);
    localStorage.setItem('accessToken', accessToken);
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    setPermissions([]);
    localStorage.removeItem('accessToken');
  };

  const value = useMemo(
    () => ({ user, tenant, permissions, isAuthenticated: !!user, login, logout }),
    [user, tenant, permissions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

#### 2. ThemeContext

```typescript
// ThemeContext.tsx
interface ThemeContextValue {
  branding: BrandingConfig;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  loadBranding: (tenantId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const loadBranding = async (tenantId: string) => {
    const cached = getCachedBranding(tenantId);
    if (cached) {
      setBranding(cached);
      applyBrandingToDOM(cached);
      return;
    }

    const response = await fetch(`/ui/branding?tenantId=${tenantId}`);
    const brandingConfig = await response.json();
    setBranding(brandingConfig);
    cacheBranding(tenantId, brandingConfig);
    applyBrandingToDOM(brandingConfig);
  };

  const value = useMemo(
    () => ({ branding, theme, setTheme, loadBranding }),
    [branding, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

#### 3. ConfigCacheContext

```typescript
// ConfigCacheContext.tsx
interface ConfigCacheContextValue {
  getPageConfig: (pageId: string) => Promise<PageConfig>;
  invalidatePageConfig: (pageId: string) => void;
  clearCache: () => void;
}

const ConfigCacheContext = createContext<ConfigCacheContextValue | undefined>(undefined);

export function ConfigCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Map<string, PageConfig>>(new Map());

  const getPageConfig = async (pageId: string): Promise<PageConfig> => {
    if (cache.has(pageId)) {
      return cache.get(pageId)!;
    }

    const response = await fetch(`/ui/pages/${pageId}`);
    const config = await response.json();
    setCache(prev => new Map(prev).set(pageId, config));
    return config;
  };

  const invalidatePageConfig = (pageId: string) => {
    setCache(prev => {
      const next = new Map(prev);
      next.delete(pageId);
      return next;
    });
  };

  const clearCache = () => setCache(new Map());

  const value = useMemo(
    () => ({ getPageConfig, invalidatePageConfig, clearCache }),
    [cache]
  );

  return <ConfigCacheContext.Provider value={value}>{children}</ConfigCacheContext.Provider>;
}

export function useConfigCache() {
  const context = useContext(ConfigCacheContext);
  if (!context) throw new Error('useConfigCache must be used within ConfigCacheProvider');
  return context;
}
```

### Page-Level State

#### Using useState for Simple State

```typescript
function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: 'all' });

  return (
    // ...
  );
}
```

#### Using useReducer for Complex State

```typescript
interface PageState {
  formData: Record<string, any>;
  widgetStates: Record<string, any>;
  loading: boolean;
  errors: Record<string, string>;
}

type PageAction =
  | { type: 'SET_FORM_DATA'; payload: { field: string; value: any } }
  | { type: 'SET_WIDGET_STATE'; payload: { widgetId: string; state: any } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { field: string; error: string } };

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, [action.payload.field]: action.payload.value },
      };
    case 'SET_WIDGET_STATE':
      return {
        ...state,
        widgetStates: { ...state.widgetStates, [action.payload.widgetId]: action.payload.state },
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.field]: action.payload.error },
      };
    default:
      return state;
  }
}

function ComplexPage() {
  const [state, dispatch] = useReducer(pageReducer, initialState);
  
  return (
    // ...
  );
}
```

#### Custom Hooks for Shared Logic

```typescript
// useFormState.ts
export function useFormState(initialValues: Record<string, any>) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFieldValue = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const setFieldError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const resetForm = () => {
    setFormData(initialValues);
    setErrors({});
  };

  return { formData, errors, setFieldValue, setFieldError, resetForm };
}

// Usage
function MyForm() {
  const { formData, errors, setFieldValue, setFieldError } = useFormState({
    name: '',
    email: '',
  });
}
```

### Optimization Strategies

1. **Memoization**: Use `useMemo` for expensive computations
2. **Callback memoization**: Use `useCallback` to prevent unnecessary re-renders
3. **Context splitting**: Separate contexts for different concerns (auth, theme, cache)
4. **Selector patterns**: Use custom hooks to select specific context values
5. **Lazy initialization**: Initialize state lazily with functions

### Performance Monitoring

- Monitor context re-renders with React DevTools Profiler
- Use `React.memo` for expensive components
- Split contexts to minimize re-render scope
- Consider Zustand migration if performance becomes an issue

## Migration Path to Zustand (If Needed)

If state management becomes complex in Phase 2:

```typescript
// Install Zustand
npm install zustand

// Create store
import create from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  tenant: null,
  permissions: [],
  login: async (credentials) => {
    const { user, tenant, permissions } = await api.login(credentials);
    set({ user, tenant, permissions });
  },
  logout: () => set({ user: null, tenant: null, permissions: [] }),
}));

// Usage
function MyComponent() {
  const { user, login, logout } = useAuthStore();
  // ...
}
```

**Estimated migration effort**: 2-3 days

## Success Metrics

- No performance issues related to state management
- Context re-renders are minimal and optimized
- State management code is easy to understand and maintain
- New developers onboard quickly with Context API patterns
- No need for complex state debugging in Phase 1

## Review and Reevaluation

**Review Trigger**: End of Phase 1

**Reevaluate if:**
- Performance issues related to re-renders
- State management becomes too complex
- Team requests better DevTools
- Need for more sophisticated state synchronization

## References

- [React Context API Documentation](https://react.dev/reference/react/useContext)
- [useState Hook](https://react.dev/reference/react/useState)
- [useReducer Hook](https://react.dev/reference/react/useReducer)
- [You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)

---

**Last Updated:** January 20, 2026  
**Next Review:** End of Phase 1
