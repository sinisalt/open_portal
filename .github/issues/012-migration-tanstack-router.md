# Issue #012: Migration - TanStack Router v1.132 Setup

**Phase:** Phase 0.5 - Technology Stack Migration  
**Component:** Frontend Routing  
**Estimated Effort:** 4 days  
**Priority:** High  
**Labels:** phase-0.5, frontend, migration, routing

## Description
Replace React Router v6 with TanStack Router v1.132, implementing file-based routing and migrating existing routes (login, OAuth callback). This provides type-safe routing with automatic code splitting.

## Context
TanStack Router offers superior TypeScript integration, automatic route generation from files, built-in code splitting, and better developer experience compared to React Router. The migration preserves existing authentication flows while modernizing the routing infrastructure.

## Acceptance Criteria
- [ ] TanStack Router v1.132 installed
- [ ] File-based routing configured
- [ ] Route tree auto-generated
- [ ] Root route with layout
- [ ] Login route migrated
- [ ] OAuth callback route migrated
- [ ] Index/home route created
- [ ] Type-safe route navigation
- [ ] Deep link preservation (redirect after login)
- [ ] 404 not found route
- [ ] Route guards for authentication
- [ ] React Router removed

## Dependencies
- Depends on: ISSUE-010 (Vite + TypeScript)
- Depends on: Existing auth work (LoginPage.js, OAuthCallback.js remain functional)
- Blocks: ISSUE-013 (MSAL implementation needs routing)
- Blocks: Future page routing (Phase 1.2)

## Installation Steps

### Step 1: Install TanStack Router
```bash
# Remove React Router
npm uninstall react-router-dom

# Install TanStack Router
npm install @tanstack/react-router@1.132.47
npm install -D @tanstack/router-vite-plugin @tanstack/router-devtools
```

### Step 2: Configure Vite Plugin
Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(), // Auto-generates route tree
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Step 3: Create Route File Structure
Create file-based routes in `src/routes/`:

```
src/routes/
├── __root.tsx          # Root layout with outlet
├── index.tsx           # Home page (/)
├── login.tsx           # Login page (/login)
└── oauth-callback.tsx  # OAuth callback (/oauth-callback)
```

### Step 4: Implement Root Route
Create `src/routes/__root.tsx`:
```typescript
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
      {/* Dev tools only in development */}
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  )
}
```

### Step 5: Migrate Login Route
Create `src/routes/login.tsx`:
```typescript
import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/components/LoginPage'
import { tokenManager } from '@/services/tokenManager'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: async ({ location }) => {
    // If already authenticated, redirect to home or intended destination
    if (tokenManager.isAuthenticated()) {
      const redirect = location.search?.redirect || '/'
      throw redirect({ to: redirect })
    }
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || '/',
    }
  },
})
```

### Step 6: Migrate OAuth Callback Route
Create `src/routes/oauth-callback.tsx`:
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { OAuthCallback } from '@/components/OAuthCallback'

export const Route = createFileRoute('/oauth-callback')({
  component: OAuthCallback,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: search.code as string,
      state: search.state as string,
      error: search.error as string,
    }
  },
})
```

### Step 7: Create Index Route
Create `src/routes/index.tsx`:
```typescript
import { createFileRoute, redirect } from '@tanstack/react-router'
import { tokenManager } from '@/services/tokenManager'

export const Route = createFileRoute('/')({
  component: HomePage,
  beforeLoad: async () => {
    // Require authentication
    if (!tokenManager.isAuthenticated()) {
      throw redirect({ to: '/login', search: { redirect: '/' } })
    }
  },
})

function HomePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to OpenPortal</h1>
      <p className="text-muted-foreground">
        Configuration-driven business UI platform
      </p>
    </div>
  )
}
```

### Step 8: Create 404 Route
Create `src/routes/$404.tsx` (or handle in __root.tsx):
```typescript
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/$404')({
  component: NotFoundComponent,
})

function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <Link
        to="/"
        className="text-primary hover:underline"
      >
        Go back home
      </Link>
    </div>
  )
}
```

### Step 9: Update App Entry Point
Update `src/main.tsx` (or `src/index.tsx` if not yet renamed):
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Type augmentation for type-safe navigation
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
```

### Step 10: Update Navigation in Components
Update `LoginPage.js` to use TanStack Router:
```javascript
// Replace react-router-dom imports:
// import { useNavigate, useLocation } from 'react-router-dom'

// With TanStack Router:
import { useNavigate, useSearch } from '@tanstack/react-router'

// In component:
const navigate = useNavigate()
const search = useSearch({ from: '/login' })
const redirectTo = search.redirect || '/'

// After successful login:
await navigate({ to: redirectTo })
```

Update `OAuthCallback.js` similarly:
```javascript
import { useNavigate, useSearch } from '@tanstack/react-router'

const navigate = useNavigate()
const search = useSearch({ from: '/oauth-callback' })
const { code, state, error } = search

// After OAuth success:
await navigate({ to: '/' })
```

### Step 11: Add Router DevTools (Development Only)
Already added in `__root.tsx`:
```typescript
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

// In component:
{import.meta.env.DEV && <TanStackRouterDevtools />}
```

### Step 12: Update .gitignore
```
# TanStack Router generated files
/src/routeTree.gen.ts
```

## Route Migration Mapping

| Old (React Router) | New (TanStack Router) | File |
|-------------------|----------------------|------|
| `/` | `/` | `src/routes/index.tsx` |
| `/login` | `/login` | `src/routes/login.tsx` |
| `/oauth-callback` | `/oauth-callback` | `src/routes/oauth-callback.tsx` |
| 404 (catch-all) | `/$404` | `src/routes/$404.tsx` |

## Authentication Flow Preservation

**Login Flow:**
1. User visits protected route (e.g., `/`)
2. `beforeLoad` check detects no auth
3. Redirect to `/login?redirect=/`
4. User logs in
5. Navigate to `redirect` parameter (or `/`)

**OAuth Flow:**
1. User clicks OAuth button on login page
2. Redirect to OAuth provider
3. Provider redirects to `/oauth-callback?code=...&state=...`
4. `OAuthCallback` component processes code
5. Navigate to `/` after success

**Deep Link Flow:**
1. User visits `/some/page` without auth
2. Redirect to `/login?redirect=/some/page`
3. After login, navigate to `/some/page`

## Type Safety Examples

```typescript
// Type-safe navigation
import { useNavigate } from '@tanstack/react-router'

const navigate = useNavigate()

// ✅ Type-safe: knows about all routes
navigate({ to: '/login' })
navigate({ to: '/oauth-callback', search: { code: '123' } })

// ❌ Type error: route doesn't exist
navigate({ to: '/invalid-route' })

// ✅ Type-safe search params
import { useSearch } from '@tanstack/react-router'

const search = useSearch({ from: '/login' })
search.redirect // string | undefined (type-safe!)
```

## Testing Requirements
- [ ] All routes render correctly
- [ ] Authentication guards work
- [ ] Deep linking preserved
- [ ] OAuth flow unchanged
- [ ] Type-safe navigation works
- [ ] 404 page displays for invalid routes
- [ ] Route transitions smooth
- [ ] Dev tools work in development
- [ ] Existing auth tests pass (update imports)

## Security Considerations
- [ ] Route guards prevent unauthorized access
- [ ] Deep link parameters validated
- [ ] No sensitive data in URL state
- [ ] OAuth state validation unchanged

## Documentation
- [ ] Update README.md with routing patterns
- [ ] Document route file structure
- [ ] Update `.github/copilot-instructions.md` with TanStack Router patterns
- [ ] Create routing examples for future pages

## Migration Checklist for Components
- [ ] Update `LoginPage.js`: Replace react-router-dom imports
- [ ] Update `OAuthCallback.js`: Replace react-router-dom imports
- [ ] Remove `<BrowserRouter>` from App.js (if present)
- [ ] Update any `<Link>` components
- [ ] Update any `useNavigate()` hooks
- [ ] Update any `useLocation()` hooks

## Success Metrics
- All existing routes work
- Type-safe navigation throughout
- Route tree auto-generates on file changes
- DevTools provide route inspection
- Authentication flows preserved
- Deep linking works correctly

## Deliverables
- File-based route structure
- Migrated login and OAuth routes
- Type-safe router configuration
- Updated components (LoginPage, OAuthCallback)
- Route guards for authentication
- Documentation updates

## Notes
- Keep existing LoginPage.js and OAuthCallback.js (no TypeScript conversion yet)
- Only update routing imports/hooks in these files
- Route tree auto-generates - don't edit `routeTree.gen.ts`
- TanStack Router DevTools help debug routing issues
- File-based routing makes adding new pages trivial
