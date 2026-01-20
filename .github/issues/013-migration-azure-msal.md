# Issue #013: Migration - Azure MSAL Parallel Implementation

**Phase:** Phase 0.5 - Technology Stack Migration  
**Component:** Frontend Authentication  
**Estimated Effort:** 5 days  
**Priority:** High  
**Labels:** phase-0.5, frontend, migration, authentication, azure-msal

## Description
Build a parallel Azure MSAL authentication implementation alongside the existing custom OAuth system, with feature flag switching and first shadcn component usage (Input, Button, Card, Label). Both auth systems coexist with runtime selection via environment variable.

## Context
OpenPortal currently has custom OAuth authentication (LoginPage.js, authService.js, tokenManager.js). This issue adds Azure Active Directory (AAD) authentication using @azure/msal-browser and @azure/msal-react, building LoginPageMSAL.tsx as the first TypeScript component using shadcn/ui. An environment variable toggles between auth providers.

## Acceptance Criteria
- [ ] @azure/msal-browser and @azure/msal-react installed
- [ ] MSAL configuration in `src/config/msalConfig.ts`
- [ ] `LoginPageMSAL.tsx` implemented with shadcn components
- [ ] `useMsalAuth.ts` hook created (parallel to useAuth.js)
- [ ] Token manager extended for MSAL token format
- [ ] HTTP client supports both token types
- [ ] Environment variable `VITE_AUTH_PROVIDER` switches implementations
- [ ] First shadcn components installed: `input`, `button`, `card`, `label`
- [ ] Both auth systems tested independently
- [ ] Feature flag switching works
- [ ] Existing custom OAuth remains functional

## Dependencies
- Depends on: ISSUE-010 (Vite + TypeScript)
- Depends on: ISSUE-011 (shadcn/ui setup)
- Depends on: ISSUE-012 (TanStack Router)
- Depends on: Existing auth (ISSUE-007, ISSUE-008, ISSUE-009)
- Blocks: ISSUE-014 (Widget registry)

## Installation Steps

### Step 1: Install MSAL Dependencies
```bash
npm install @azure/msal-browser @azure/msal-react
```

### Step 2: Install First shadcn Components
```bash
npx shadcn@latest add input
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add label
```

This installs:
- `src/components/ui/input.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/label.tsx`

### Step 3: Create MSAL Configuration
Create `src/config/msalConfig.ts`:
```typescript
import { Configuration, PublicClientApplication } from '@azure/msal-browser'

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin + '/oauth-callback',
  },
  cache: {
    cacheLocation: 'localStorage', // or 'sessionStorage'
    storeAuthStateInCookie: false,
  },
}

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig)

// Initialize MSAL
await msalInstance.initialize()

// Scopes for token requests
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
}
```

### Step 4: Update Environment Variables
Add to `.env.example`:
```env
# Authentication Provider Selection
VITE_AUTH_PROVIDER=custom  # 'custom' or 'msal'

# Azure MSAL Configuration (when VITE_AUTH_PROVIDER=msal)
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_AZURE_REDIRECT_URI=http://localhost:3000/oauth-callback
VITE_AZURE_TENANT_ID=your-tenant-id
```

### Step 5: Create MSAL-Specific Hook
Create `src/hooks/useMsalAuth.ts`:
```typescript
import { useEffect, useState } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser'
import { loginRequest } from '@/config/msalConfig'

export interface MsalAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  error: Error | null
}

export function useMsalAuth(): MsalAuthState & {
  login: () => Promise<void>
  logout: () => Promise<void>
  getAccessToken: () => Promise<string | null>
} {
  const { instance, accounts, inProgress } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      setUser({
        id: accounts[0].localAccountId,
        name: accounts[0].name,
        email: accounts[0].username,
      })
    } else {
      setUser(null)
    }
  }, [isAuthenticated, accounts])

  const login = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await instance.loginPopup(loginRequest)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await instance.logoutPopup()
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    if (!isAuthenticated || accounts.length === 0) {
      return null
    }

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      return response.accessToken
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        // Silent acquisition failed, need interaction
        const response = await instance.acquireTokenPopup(loginRequest)
        return response.accessToken
      }
      throw err
    }
  }

  return {
    isAuthenticated,
    isLoading: isLoading || inProgress !== InteractionStatus.None,
    user,
    error,
    login,
    logout,
    getAccessToken,
  }
}
```

### Step 6: Create LoginPageMSAL Component
Create `src/components/LoginPageMSAL.tsx`:
```typescript
import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMsalAuth } from '@/hooks/useMsalAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPageMSAL() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' })
  const redirectTo = search.redirect || '/'
  const { login, isLoading } = useMsalAuth()
  const [error, setError] = useState<string | null>(null)

  const handleMsalLogin = async () => {
    setError(null)
    try {
      await login()
      await navigate({ to: redirectTo })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in to OpenPortal</CardTitle>
          <CardDescription>
            Sign in with your Microsoft account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleMsalLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 7: Extend Token Manager for MSAL
Update `src/services/tokenManager.js` to support both token formats:
```javascript
// Add MSAL token handling
export const tokenManager = {
  // ... existing methods ...

  /**
   * Get token based on auth provider
   */
  async getToken() {
    const authProvider = import.meta.env.VITE_AUTH_PROVIDER || 'custom'
    
    if (authProvider === 'msal') {
      return this.getMsalToken()
    } else {
      return this.getAccessToken() // existing method
    }
  },

  /**
   * Get MSAL token (requires instance from context)
   */
  async getMsalToken() {
    // This will be called from httpClient with MSAL instance available
    // Token acquisition delegated to useMsalAuth hook
    return null // Placeholder
  },

  /**
   * Store MSAL tokens
   */
  storeMsalTokens(accessToken, idToken, account) {
    // MSAL handles token storage internally
    // Store additional metadata if needed
    localStorage.setItem('auth_provider', 'msal')
    localStorage.setItem('msal_account', JSON.stringify(account))
  },
}
```

### Step 8: Update HTTP Client for Provider Switching
Update `src/services/httpClient.js` to support both auth providers:
```javascript
import { msalInstance } from '@/config/msalConfig'
import { loginRequest } from '@/config/msalConfig'

// Request interceptor
httpClient.interceptors.request.use(
  async (config) => {
    const authProvider = import.meta.env.VITE_AUTH_PROVIDER || 'custom'

    if (authProvider === 'msal') {
      // MSAL token acquisition
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        try {
          const response = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          })
          config.headers.Authorization = `Bearer ${response.accessToken}`
        } catch (err) {
          console.error('MSAL token acquisition failed', err)
        }
      }
    } else {
      // Custom OAuth token (existing)
      const token = tokenManager.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)
```

### Step 9: Create Auth Provider Wrapper
Create `src/components/AuthProvider.tsx`:
```typescript
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from '@/config/msalConfig'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authProvider = import.meta.env.VITE_AUTH_PROVIDER || 'custom'

  if (authProvider === 'msal') {
    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>
  }

  // Custom auth doesn't need provider
  return <>{children}</>
}
```

### Step 10: Update Main Entry Point
Update `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AuthProvider } from '@/components/AuthProvider'
import './index.css'

import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)
```

### Step 11: Update Login Route for Provider Switching
Update `src/routes/login.tsx`:
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/components/LoginPage'
import { LoginPageMSAL } from '@/components/LoginPageMSAL'

export const Route = createFileRoute('/login')({
  component: () => {
    const authProvider = import.meta.env.VITE_AUTH_PROVIDER || 'custom'
    return authProvider === 'msal' ? <LoginPageMSAL /> : <LoginPage />
  },
})
```

## Feature Flag Switching

**Environment Variable:**
```env
VITE_AUTH_PROVIDER=custom  # Default (existing OAuth)
VITE_AUTH_PROVIDER=msal    # Azure MSAL
```

**Runtime Behavior:**
- `custom`: Uses LoginPage.js + authService.js + existing OAuth
- `msal`: Uses LoginPageMSAL.tsx + @azure/msal-react + AAD

**Testing Both Systems:**
```bash
# Test custom auth
VITE_AUTH_PROVIDER=custom npm run dev

# Test MSAL auth
VITE_AUTH_PROVIDER=msal npm run dev
```

## Testing Requirements
- [ ] MSAL login flow works
- [ ] MSAL token acquisition works
- [ ] MSAL logout works
- [ ] HTTP client uses correct tokens
- [ ] Feature flag switching works
- [ ] Custom OAuth still works (VITE_AUTH_PROVIDER=custom)
- [ ] shadcn components render correctly
- [ ] Both auth systems have independent test suites
- [ ] No interference between auth providers

## Testing Strategy
- Keep existing Jest tests for custom OAuth (41 tests)
- Add new Vitest tests for MSAL (separate from Jest)
- Measure coverage separately:
  - Custom auth: Jest + React Testing Library
  - MSAL auth: Vitest + React Testing Library
- Goal: >80% coverage for both

## Security Considerations
- [ ] MSAL tokens stored securely (MSAL handles this)
- [ ] No token leakage between providers
- [ ] Feature flag doesn't expose sensitive config
- [ ] MSAL redirect URI validated
- [ ] CSRF protection for both auth flows

## Documentation
- [ ] Document MSAL setup and configuration
- [ ] Document feature flag usage
- [ ] Update `.env.example` with Azure variables
- [ ] Create `documentation/AZURE-MSAL-SETUP.md`
- [ ] Update `.github/copilot-instructions.md` with MSAL patterns

## shadcn Component Usage Example
```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

// OpenPortal will wrap these in widgets with configuration contracts
// This issue uses them directly in LoginPageMSAL as proof-of-concept
```

## Success Metrics
- Both auth providers work independently
- Feature flag switches seamlessly
- MSAL tokens acquired and refreshed
- shadcn components integrate cleanly
- First TypeScript component (LoginPageMSAL) working
- No regression in existing custom OAuth

## Deliverables
- MSAL configuration
- LoginPageMSAL.tsx component
- useMsalAuth.ts hook
- Extended token manager
- Updated HTTP client
- Feature flag switching
- First shadcn components installed
- Tests for MSAL flow
- Documentation

## Notes
- This is a **parallel implementation**, not a replacement
- Custom OAuth (LoginPage.js) remains fully functional
- Feature flag allows runtime switching for testing
- First real TypeScript component using shadcn/ui
- MSAL tokens managed by @azure/msal-browser (no custom storage)
- ISSUE-014 will build first widget on top of shadcn components
