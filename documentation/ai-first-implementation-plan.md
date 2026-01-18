# AI-First Implementation Plan

## Overview

This document outlines an implementation plan specifically designed for **AI-assisted agentic coding** approach rather than traditional man-day estimates. The plan focuses on task decomposition, clear specifications, and iterative development suitable for AI agents.

---

## Key Principles for AI-First Development

### 1. Task Atomicity
- Break down features into **single-responsibility tasks**
- Each task should be completable in one AI agent session (15-60 minutes)
- Clear input/output contracts for each task

### 2. Specification-Driven
- **Comprehensive specifications** before implementation
- JSON schemas and TypeScript interfaces defined first
- Example data and test cases provided upfront

### 3. Test-Driven Development (TDD)
- Write tests **before** implementation
- Use mock APIs for frontend development
- Parallel backend/frontend development

### 4. Iterative & Incremental
- **Vertical slices** over horizontal layers
- Each iteration produces working, demonstrable features
- Continuous integration and validation

### 5. Clear Dependencies
- Explicit task dependencies
- Tasks can be parallelized when possible
- Shared contracts (APIs, types) defined early

---

## Development Environment Setup

### Prerequisites
```bash
# Node.js 18+ and npm
node --version  # v18.0.0 or higher
npm --version   # v9.0.0 or higher

# Git
git --version

# Redis (for caching)
redis-server --version  # v6.0 or higher
```

### Project Initialization

**Task AI-001: Initialize React Project with TypeScript**
```bash
# Already done - Create React App is set up
# Upgrade to TypeScript
npm install --save typescript @types/node @types/react @types/react-dom
npm install --save-dev @types/jest

# Create tsconfig.json
npx tsc --init --jsx react --target es2020 --module esnext --moduleResolution node --lib es2020,dom
```

**Task AI-002: Install Core Dependencies**
```bash
# Ant Design (UI Component Library)
npm install antd @ant-design/icons

# Routing
npm install react-router-dom
npm install --save-dev @types/react-router-dom

# State Management (Zustand - lightweight)
npm install zustand

# HTTP Client
npm install axios

# Form Management
npm install react-hook-form @hookform/resolvers zod

# WebSocket Client
npm install socket.io-client

# Caching (React Query)
npm install @tanstack/react-query

# Date/Time
npm install dayjs

# Testing
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev msw  # Mock Service Worker for API mocking
```

**Task AI-003: Configure Mock API Server**
```bash
# Install JSON Server for mock API
npm install --save-dev json-server

# Create mock-api directory
mkdir -p mock-api
```

Create `mock-api/db.json`:
```json
{
  "users": [],
  "pages": [],
  "routes": [],
  "apiKeys": []
}
```

Add to `package.json`:
```json
{
  "scripts": {
    "mock-api": "json-server --watch mock-api/db.json --port 3001",
    "dev": "npm-run-all --parallel start mock-api"
  }
}
```

---

## Implementation Phases

## Phase 0: Foundation & Specifications (Week 1)

### Goals
- Define all TypeScript interfaces
- Set up project structure
- Configure testing infrastructure
- Create mock API contracts

### Task Breakdown

#### **Task AI-100: Define TypeScript Types**
**Input:** API Specification document
**Output:** `src/types/` directory with all interfaces
**Estimated Tokens:** 5,000
**Validation:** Type checking passes, no errors

```typescript
// src/types/auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  tenant: Tenant;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
}

// ... (all types from API spec)
```

**Test:**
```typescript
// src/types/__tests__/auth.types.test.ts
import { LoginResponse } from '../auth.types';

describe('Auth Types', () => {
  it('should accept valid login response', () => {
    const response: LoginResponse = {
      success: true,
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: { /* valid user */ },
      tenant: { /* valid tenant */ }
    };
    expect(response).toBeDefined();
  });
});
```

#### **Task AI-101: Define Page Configuration Schema**
**Input:** JSON Schemas document
**Output:** Zod schemas in `src/schemas/`
**Validation:** Schema validation tests pass

```typescript
// src/schemas/page-config.schema.ts
import { z } from 'zod';

export const WidgetSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.any()).optional(),
  children: z.array(z.lazy(() => WidgetSchema)).optional(),
  datasourceId: z.string().optional(),
  bindings: z.record(z.any()).optional(),
  events: z.array(z.any()).optional()
});

export const PageConfigSchema = z.object({
  pageId: z.string(),
  schemaVersion: z.string(),
  configVersion: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  layout: z.any().optional(),
  widgets: z.array(WidgetSchema),
  datasources: z.array(z.any()).optional(),
  actions: z.array(z.any()).optional(),
  events: z.array(z.any()).optional()
});

export type PageConfig = z.infer<typeof PageConfigSchema>;
```

#### **Task AI-102: Project Structure Setup**
**Input:** Architecture document
**Output:** Complete folder structure
**Validation:** All directories exist

```
src/
├── components/           # React components
│   ├── layout/          # Layout components (Header, Sider, etc.)
│   ├── widgets/         # Widget components
│   └── common/          # Shared components
├── pages/               # Route page components
├── services/            # API services
│   ├── auth.service.ts
│   ├── ui.service.ts
│   └── api.client.ts
├── stores/              # Zustand stores
│   ├── auth.store.ts
│   ├── ui.store.ts
│   └── page.store.ts
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── schemas/             # Zod schemas
├── constants/           # Constants and enums
├── router/              # Routing configuration
├── engine/              # Core rendering engine
│   ├── WidgetRegistry.ts
│   ├── ActionEngine.ts
│   ├── DatasourceManager.ts
│   └── PageRenderer.tsx
└── __tests__/           # Test files
```

#### **Task AI-103: Configure Testing Infrastructure**
**Input:** Testing requirements
**Output:** Jest and MSW configuration
**Validation:** Sample test runs successfully

```javascript
// src/setupTests.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        // ...
      })
    );
  }),
  // ... more handlers
];
```

---

## Phase 1: Authentication & Bootstrap (Week 2)

### Goals
- Implement login functionality (username/password + OAuth)
- Token management
- Bootstrap API integration
- Protected routes

### Task Breakdown

#### **Task AI-200: Login Page Component**
**Dependencies:** AI-100, AI-102
**Input:** Authentication Scenarios document, Ant Design docs
**Output:** `src/pages/LoginPage.tsx`
**Validation:** Component renders, form validation works

```typescript
// src/pages/LoginPage.tsx
import React from 'react';
import { Form, Input, Button, Card, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  
  const handleSubmit = async (values: LoginFormValues) => {
    // Will be implemented in next task
  };
  
  return (
    <div className="login-container">
      <Card title="Sign In" className="login-card">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign In
            </Button>
          </Form.Item>
        </Form>
        
        <Divider>Or</Divider>
        
        {/* OAuth buttons - next task */}
      </Card>
    </div>
  );
};
```

**Test:**
```typescript
// src/pages/__tests__/LoginPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from '../LoginPage';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });
  
  it('shows validation errors for empty form', async () => {
    render(<LoginPage />);
    const submitButton = screen.getByText('Sign In');
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Please enter your email')).toBeInTheDocument();
  });
});
```

#### **Task AI-201: Auth Service Implementation**
**Dependencies:** AI-100, AI-103
**Input:** Authentication Scenarios document
**Output:** `src/services/auth.service.ts`
**Validation:** Service methods work with mock API

```typescript
// src/services/auth.service.ts
import axios from 'axios';
import { LoginRequest, LoginResponse, RefreshTokenRequest } from '../types/auth.types';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1';

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials);
    return response.data;
  }
  
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
    return response.data;
  }
  
  async logout(refreshToken: string): Promise<void> {
    await axios.post(`${API_BASE}/auth/logout`, { refreshToken });
  }
  
  async getOAuthProviders(): Promise<OAuthProvider[]> {
    const response = await axios.get(`${API_BASE}/auth/oauth/providers`);
    return response.data.providers;
  }
}

export const authService = new AuthService();
```

**Test:**
```typescript
// src/services/__tests__/auth.service.test.ts
import { authService } from '../auth.service';
import { server } from '../../mocks/server';
import { rest } from 'msw';

describe('AuthService', () => {
  it('should login successfully', async () => {
    const response = await authService.login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(response.success).toBe(true);
    expect(response.accessToken).toBeDefined();
  });
  
  it('should handle login error', async () => {
    server.use(
      rest.post('/api/v1/auth/login', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ error: { code: 'INVALID_CREDENTIALS' } }));
      })
    );
    
    await expect(authService.login({ email: 'bad@email.com', password: 'wrong' }))
      .rejects.toThrow();
  });
});
```

#### **Task AI-202: Auth Store with Zustand**
**Dependencies:** AI-201
**Input:** State management requirements
**Output:** `src/stores/auth.store.ts`
**Validation:** Store state updates correctly

```typescript
// src/stores/auth.store.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import { User, Tenant } from '../types/auth.types';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        const response = await authService.login({ email, password });
        set({
          user: response.user,
          tenant: response.tenant,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true
        });
      },
      
      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          await authService.logout(refreshToken);
        }
        set({
          user: null,
          tenant: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        });
      },
      
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await authService.refreshToken(refreshToken);
        set({ accessToken: response.accessToken });
      },
      
      setUser: (user) => set({ user })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
```

#### **Task AI-203: OAuth Login Implementation**
**Dependencies:** AI-201, AI-202
**Output:** OAuth button components and callback handler
**Validation:** OAuth flow works with mock providers

_(Similar detailed implementation)_

#### **Task AI-204: Bootstrap API Integration**
**Dependencies:** AI-202
**Output:** Bootstrap service and integration
**Validation:** Bootstrap data loads after login

#### **Task AI-205: Protected Route Component**
**Dependencies:** AI-202
**Output:** `src/components/ProtectedRoute.tsx`
**Validation:** Redirects to login when not authenticated

---

## Phase 2: Core Rendering Engine (Week 3-4)

### Goals
- Widget registry system
- Page configuration loader
- Route resolver
- Dynamic page rendering

### Task Breakdown

#### **Task AI-300: Widget Registry**
**Dependencies:** AI-101, AI-102
**Output:** `src/engine/WidgetRegistry.ts`
**Validation:** Widgets can be registered and retrieved

```typescript
// src/engine/WidgetRegistry.ts
import React from 'react';
import { WidgetConfig } from '../types/widget.types';

type WidgetComponent = React.ComponentType<any>;

class WidgetRegistry {
  private widgets: Map<string, WidgetComponent> = new Map();
  
  register(type: string, component: WidgetComponent): void {
    this.widgets.set(type, component);
  }
  
  get(type: string): WidgetComponent | undefined {
    return this.widgets.get(type);
  }
  
  has(type: string): boolean {
    return this.widgets.has(type);
  }
  
  getAll(): Map<string, WidgetComponent> {
    return new Map(this.widgets);
  }
}

export const widgetRegistry = new WidgetRegistry();

// Register core widgets
import { Card, Button, Input, Form } from 'antd';

widgetRegistry.register('Card', Card);
widgetRegistry.register('Button', Button);
widgetRegistry.register('Input', Input);
widgetRegistry.register('Form', Form);
// ... register all Ant Design components
```

#### **Task AI-301: Page Renderer Component**
**Dependencies:** AI-300
**Output:** `src/engine/PageRenderer.tsx`
**Validation:** Renders page from config

```typescript
// src/engine/PageRenderer.tsx
import React from 'react';
import { PageConfig, WidgetConfig } from '../types';
import { widgetRegistry } from './WidgetRegistry';

interface PageRendererProps {
  config: PageConfig;
}

export const PageRenderer: React.FC<PageRendererProps> = ({ config }) => {
  const renderWidget = (widget: WidgetConfig): React.ReactNode => {
    const Component = widgetRegistry.get(widget.type);
    
    if (!Component) {
      console.warn(`Widget type "${widget.type}" not registered`);
      return null;
    }
    
    const children = widget.children?.map(renderWidget);
    
    return (
      <Component key={widget.id} {...widget.props}>
        {children}
      </Component>
    );
  };
  
  return (
    <div className="page-container">
      {config.widgets.map(renderWidget)}
    </div>
  );
};
```

#### **Task AI-302: Route Resolver Service**
**Dependencies:** AI-100
**Output:** `src/services/ui.service.ts`
**Validation:** Resolves routes correctly

#### **Task AI-303: Page Config Loader with Caching**
**Dependencies:** AI-302
**Output:** Enhanced UI service with ETag caching
**Validation:** Caching works, 304 responses handled

#### **Task AI-304: Dynamic Router Integration**
**Dependencies:** AI-303, AI-301
**Output:** `src/router/DynamicRouter.tsx`
**Validation:** Routes resolve and pages render

---

## Phase 3: Core Widgets (Week 5-6)

Each widget is a separate task. Parallelizable.

### Task Template for Each Widget

#### **Task AI-400-XXX: [Widget Name] Widget**
**Dependencies:** AI-300
**Input:** Widget Catalog specification
**Output:** `src/components/widgets/[WidgetName].tsx`
**Validation:** 
- Renders correctly
- Props work as specified
- Events fire correctly
- Tests pass

**Widget List (30 tasks):**
1. AI-401: Card Widget
2. AI-402: Button Widget
3. AI-403: TextInput Widget
4. AI-404: Form Widget
5. AI-405: Table Widget
6. AI-406: Modal Widget
7. AI-407: Dropdown Widget
8. AI-408: Menu Widget
9. AI-409: Layout Widget
10. AI-410: Sider Widget
11. AI-411: Content Widget
12. AI-412: Header Widget
13. AI-413: Select Widget
14. AI-414: DatePicker Widget
15. AI-415: Checkbox Widget
16. AI-416: Radio Widget
17. AI-417: Switch Widget
18. AI-418: Slider Widget
19. AI-419: Upload Widget
20. AI-420: Avatar Widget
21. AI-421: Badge Widget
22. AI-422: Tag Widget
23. AI-423: Tooltip Widget
24. AI-424: Alert Widget
25. AI-425: Descriptions Widget
26. AI-426: KPI Widget (custom)
27. AI-427: Chart Widget (with Chart.js)
28. AI-428: Tabs Widget
29. AI-429: Collapse Widget
30. AI-430: Divider Widget

---

## Phase 4: Action Engine & Data Layer (Week 7-8)

### Task Breakdown

#### **Task AI-500: Action Engine Core**
**Dependencies:** AI-300
**Output:** `src/engine/ActionEngine.ts`
**Validation:** Actions execute correctly

```typescript
// src/engine/ActionEngine.ts
import { ActionConfig } from '../types';

export class ActionEngine {
  async execute(action: ActionConfig, context: any): Promise<any> {
    switch (action.kind) {
      case 'navigate':
        return this.executeNavigate(action.navigate!, context);
      case 'executeAction':
        return this.executeBackendAction(action.executeAction!, context);
      case 'setState':
        return this.executeSetState(action.setState!, context);
      case 'showToast':
        return this.executeShowToast(action.showToast!, context);
      case 'modal':
        return this.executeModal(action.modal!, context);
      default:
        throw new Error(`Unknown action kind: ${action.kind}`);
    }
  }
  
  private async executeNavigate(config: NavigateAction, context: any) {
    // Implementation
  }
  
  // ... other action implementations
}
```

#### **Task AI-501: Datasource Manager**
**Dependencies:** AI-100
**Output:** `src/engine/DatasourceManager.ts`
**Validation:** Data fetching works

#### **Task AI-502: React Query Integration**
**Dependencies:** AI-501
**Output:** Hooks for data fetching with caching
**Validation:** Data caching and refetching work

#### **Task AI-503: WebSocket Integration**
**Dependencies:** AI-501
**Output:** `src/services/websocket.service.ts`
**Validation:** WebSocket connection and subscriptions work

---

## Phase 5: Form & Validation (Week 9-10)

### Task Breakdown

#### **Task AI-600: Form Component with React Hook Form**
**Dependencies:** AI-400 series
**Output:** Enhanced Form widget with validation
**Validation:** Form validation works

#### **Task AI-601: Client-Side Validation**
**Dependencies:** AI-600
**Output:** Validation rule engine
**Validation:** All validation rules work

#### **Task AI-602: Server-Side Validation Integration**
**Dependencies:** AI-601, AI-500
**Output:** Async validation service
**Validation:** Server validation works

---

## Phase 6: Profile & Demo Pages (Week 11-12)

### Task Breakdown

#### **Task AI-700: Dashboard Page Configuration**
**Dependencies:** All widget tasks, AI-500, AI-501
**Output:** Complete dashboard page
**Validation:** Dashboard renders and functions

#### **Task AI-701: Profile Page Implementation**
**Dependencies:** User Profile Scenarios document
**Output:** Complete profile pages
**Validation:** All profile scenarios work

#### **Task AI-702: API Keys Page**
**Dependencies:** AI-701
**Output:** API Keys management page
**Validation:** CRUD operations work

---

## Testing Strategy

### Test-Driven Development Flow

1. **Write Specification**
   - Clear input/output contracts
   - Example data
   - Edge cases

2. **Write Tests First**
   ```typescript
   describe('LoginPage', () => {
     it('should submit form with valid credentials', async () => {
       // Test implementation
     });
   });
   ```

3. **Implement Feature**
   - Write minimal code to pass tests
   - Refactor for quality

4. **Validate**
   - All tests pass
   - Manual testing with mock API
   - Screenshot/recording for UI

### Mock API Testing

```javascript
// mock-api/routes/auth.js
module.exports = (app) => {
  app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (email === 'test@example.com' && password === 'password') {
      return res.json({
        success: true,
        accessToken: 'mock-token',
        // ... full response
      });
    }
    
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
    });
  });
};
```

---

## AI Agent Instructions Template

Each task should have clear instructions for AI agents:

```markdown
### Task AI-XXX: [Task Name]

**Objective:** [Clear, single-purpose objective]

**Dependencies:** [List of prerequisite tasks]

**Input Files:**
- [Path to specification document]
- [Path to related types/interfaces]
- [Path to example data]

**Output Files:**
- [Exact file paths to create/modify]

**Acceptance Criteria:**
1. [ ] [Specific, testable criterion 1]
2. [ ] [Specific, testable criterion 2]
3. [ ] [All tests pass]
4. [ ] [No TypeScript errors]
5. [ ] [Linting passes]

**Example Implementation:**
```typescript
// Minimal code example showing structure
```

**Test Cases:**
```typescript
// Test cases that must pass
```

**Validation Command:**
```bash
npm test -- [test-file]
npm run lint
npm run type-check
```
```

---

## Metrics & Progress Tracking

### Task Completion Tracking

```yaml
Phase 1: Authentication & Bootstrap
  - AI-200: Login Page Component [COMPLETED]
  - AI-201: Auth Service [IN PROGRESS]
  - AI-202: Auth Store [PENDING]
  - AI-203: OAuth Login [PENDING]
  - AI-204: Bootstrap API [PENDING]
  - AI-205: Protected Routes [PENDING]
  
Progress: 1/6 tasks (17%)
Estimated Completion: 3 days
```

### Quality Metrics

- **Test Coverage:** Target 80%+
- **Type Safety:** 100% (no `any` types in production code)
- **Build Success:** 100%
- **Lint Warnings:** 0

---

## Redis Integration

### Setup

```bash
# Install Redis client
npm install redis

# Start Redis
docker run -d -p 6379:6379 redis:latest
```

### Implementation

**Task AI-800: Redis Cache Service**
```typescript
// src/services/cache.service.ts
import { createClient } from 'redis';

class CacheService {
  private client;
  
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.client.connect();
  }
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }
  
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

export const cacheService = new CacheService();
```

---

## Ant Design Integration

### Theme Configuration

**Task AI-900: Configure Ant Design Theme**
```typescript
// src/theme/antd.theme.ts
import { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontSize: 14,
    colorBgContainer: '#ffffff'
  },
  components: {
    Button: {
      controlHeight: 40,
      fontWeight: 500
    },
    Input: {
      controlHeight: 40
    }
  }
};
```

```tsx
// src/App.tsx
import { ConfigProvider } from 'antd';
import { antdTheme } from './theme/antd.theme';

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      {/* App content */}
    </ConfigProvider>
  );
}
```

---

## Estimation Summary

### Traditional Approach (Man-Days)
- Phase 0: 5 days
- Phase 1: 10 days
- Phase 2: 15 days
- Phase 3: 20 days
- Phase 4: 15 days
- Phase 5: 10 days
- Phase 6: 10 days
**Total: 85 man-days (~4 months with 1 developer)**

### AI-First Approach (Agent Tasks)
- Phase 0: 10 tasks (1-2 days)
- Phase 1: 20 tasks (2-3 days)
- Phase 2: 25 tasks (3-4 days)
- Phase 3: 30 tasks (4-5 days, parallelizable)
- Phase 4: 15 tasks (2-3 days)
- Phase 5: 10 tasks (1-2 days)
- Phase 6: 15 tasks (2-3 days)
**Total: 125 atomic tasks (15-22 days with AI agents)**

### Speed Multiplier
**3-4x faster** than traditional development with:
- Clear specifications
- Atomic task decomposition
- Parallel execution where possible
- Automated testing

---

## Success Criteria

### MVP Launch Readiness

✅ **Functional Completeness**
- [ ] User can log in (username/password + OAuth)
- [ ] User can view dashboard
- [ ] User can view and edit profile
- [ ] User can navigate between pages
- [ ] Browser back/forward works
- [ ] All core widgets functional

✅ **Quality**
- [ ] 80%+ test coverage
- [ ] No critical bugs
- [ ] Performance: <2s page load
- [ ] Accessibility: WCAG 2.1 AA

✅ **Documentation**
- [ ] API documentation complete
- [ ] Component storybook
- [ ] Developer guide
- [ ] Deployment guide

---

**Version:** 1.0
**Last Updated:** January 18, 2026
**Related Documents:**
- [Architecture](./architecture.md)
- [Roadmap](./roadmap.md)
- [Authentication Scenarios](./authentication-scenarios.md)
- [User Profile Scenarios](./user-profile-scenarios.md)
