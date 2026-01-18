# TDD & Mock API Development Guide

## Overview

This guide provides a comprehensive approach to Test-Driven Development (TDD) with mock APIs for the OpenPortal platform, enabling parallel frontend and backend development.

---

## Test-Driven Development Principles

### TDD Cycle (Red-Green-Refactor)

```
1. RED: Write a failing test
   ↓
2. GREEN: Write minimal code to pass the test
   ↓
3. REFACTOR: Improve code quality without changing behavior
   ↓
Repeat
```

### Benefits for AI-First Development

- **Clear specifications** - Tests serve as executable specifications
- **Immediate validation** - AI agents know when task is complete
- **Regression prevention** - Changes don't break existing functionality
- **Documentation** - Tests document expected behavior
- **Confidence** - Safe refactoring with test coverage

---

## Mock API Setup

### Option 1: JSON Server (Simple, Quick)

**Installation:**
```bash
npm install --save-dev json-server
```

**Configuration:**
```json
// package.json
{
  "scripts": {
    "mock-api": "json-server --watch mock-api/db.json --port 3001 --routes mock-api/routes.json",
    "dev": "npm-run-all --parallel start mock-api"
  }
}
```

**Database File:**
```json
// mock-api/db.json
{
  "users": [
    {
      "id": "user123",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://i.pravatar.cc/150?u=user123",
      "department": "Engineering",
      "jobTitle": "Senior Software Engineer",
      "phone": "+1 (555) 123-4567",
      "createdAt": "2023-01-15T10:00:00Z",
      "lastLogin": "2024-01-17T11:30:00Z"
    }
  ],
  "apiKeys": [
    {
      "id": "key_abc123",
      "userId": "user123",
      "name": "Production API Key",
      "key": "sk_live_abc123xyz789",
      "createdAt": "2023-06-15T10:00:00Z",
      "lastUsed": "2024-01-17T10:30:00Z",
      "status": "active"
    }
  ],
  "pages": [],
  "routes": []
}
```

**Custom Routes:**
```json
// mock-api/routes.json
{
  "/api/v1/*": "/$1",
  "/api/users/:id": "/users/:id",
  "/api/users/:userId/api-keys": "/apiKeys?userId=:userId"
}
```

### Option 2: MSW (Mock Service Worker) - Recommended

**Installation:**
```bash
npm install --save-dev msw
```

**Setup:**
```bash
# Generate service worker
npx msw init public/ --save
```

**Handler Configuration:**
```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Authentication
  rest.post('/api/v1/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json();
    
    // Simulate validation
    if (email === 'john.doe@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: {
            id: 'user123',
            email: 'john.doe@example.com',
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://i.pravatar.cc/150?u=user123',
            emailVerified: true,
            createdAt: '2023-01-15T10:00:00Z'
          },
          tenant: {
            id: 'tenant456',
            name: 'Acme Corporation',
            domain: 'acme.example.com'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString()
        }
      })
    );
  }),
  
  // Bootstrap
  rest.get('/api/v1/ui/bootstrap', (req, res, ctx) => {
    const token = req.headers.get('Authorization');
    
    if (!token) {
      return res(ctx.status(401));
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: 'user123',
          email: 'john.doe@example.com',
          name: 'John Doe',
          role: 'admin'
        },
        tenant: {
          id: 'tenant456',
          name: 'Acme Corporation'
        },
        permissions: [
          'dashboard.view',
          'profile.view',
          'profile.edit',
          'users.view'
        ],
        menu: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'DashboardOutlined',
            route: '/dashboard',
            order: 1
          },
          {
            id: 'profile',
            label: 'Profile',
            icon: 'UserOutlined',
            route: '/profile',
            order: 2
          }
        ],
        defaultRoute: '/dashboard',
        featureFlags: {
          newDashboard: true
        }
      })
    );
  }),
  
  // Page Configuration
  rest.get('/api/v1/ui/pages/:pageId', (req, res, ctx) => {
    const { pageId } = req.params;
    const ifNoneMatch = req.headers.get('If-None-Match');
    const etag = `"${pageId}-v1.2.3"`;
    
    // Simulate 304 Not Modified
    if (ifNoneMatch === etag) {
      return res(ctx.status(304));
    }
    
    // Return page config based on pageId
    const configs = {
      'dashboard-page': {
        pageId: 'dashboard-page',
        title: 'Dashboard',
        widgets: [
          {
            id: 'welcome-card',
            type: 'Card',
            props: {
              title: 'Welcome!'
            }
          }
        ],
        datasources: [],
        actions: []
      },
      'user-profile-page': {
        pageId: 'user-profile-page',
        title: 'Profile',
        widgets: [
          {
            id: 'profile-card',
            type: 'Card',
            props: {
              title: 'Profile Information'
            }
          }
        ],
        datasources: [
          {
            id: 'profile-data',
            kind: 'http',
            http: {
              method: 'GET',
              url: '/api/users/user123'
            }
          }
        ],
        actions: []
      }
    };
    
    const config = configs[pageId as keyof typeof configs];
    
    if (!config) {
      return res(ctx.status(404));
    }
    
    return res(
      ctx.status(200),
      ctx.set('ETag', etag),
      ctx.set('Cache-Control', 'private, max-age=3600'),
      ctx.json(config)
    );
  }),
  
  // User Profile
  rest.get('/api/users/:userId', (req, res, ctx) => {
    const { userId } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        id: userId,
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        avatar: 'https://i.pravatar.cc/150?u=' + userId,
        department: 'Engineering',
        jobTitle: 'Senior Software Engineer',
        location: 'New York, NY',
        bio: 'Passionate software engineer with 10+ years of experience.',
        createdAt: '2023-01-15T10:00:00Z',
        lastLogin: '2024-01-17T11:30:00Z',
        emailVerified: true
      })
    );
  }),
  
  // Update Profile
  rest.post('/api/v1/ui/actions/execute', async (req, res, ctx) => {
    const { actionId, context } = await req.json();
    
    if (actionId === 'update-user-profile') {
      // Simulate validation
      const { formValues } = context;
      
      if (!formValues.firstName || !formValues.lastName) {
        return res(
          ctx.status(400),
          ctx.json({
            success: false,
            errors: [
              {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                fieldErrors: [
                  {
                    path: 'values.firstName',
                    message: 'First name is required',
                    severity: 'error'
                  }
                ]
              }
            ]
          })
        );
      }
      
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          result: {
            id: 'user123',
            ...formValues,
            updatedAt: new Date().toISOString()
          },
          messages: [
            {
              type: 'success',
              text: 'Profile updated successfully'
            }
          ]
        })
      );
    }
    
    return res(ctx.status(404));
  }),
  
  // API Keys
  rest.get('/api/users/:userId/api-keys', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            id: 'key_abc123',
            name: 'Production API Key',
            key: 'sk_live_abc123xyz789********',
            createdAt: '2023-06-15T10:00:00Z',
            lastUsed: '2024-01-17T10:30:00Z',
            status: 'active',
            permissions: ['read', 'write']
          }
        ],
        meta: {
          total: 1,
          active: 1
        }
      })
    );
  })
];
```

**Browser Setup:**
```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

**Enable in Development:**
```typescript
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Start MSW in development
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'warn'
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

**Test Setup:**
```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
```

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

---

## TDD Examples

### Example 1: Login Component

#### Step 1: Write Test (RED)

```typescript
// src/pages/__tests__/LoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../LoginPage';
import { BrowserRouter } from 'react-router-dom';

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  it('should render login form', () => {
    renderLogin();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  
  it('should show validation errors for empty form', async () => {
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });
  
  it('should submit form with valid credentials', async () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
  
  it('should show error for invalid credentials', async () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'bad@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
```

#### Step 2: Implement Component (GREEN)

```typescript
// src/pages/LoginPage.tsx
import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  
  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <Card title="Sign In" className="login-card">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
              autoComplete="email"
            />
          </Form.Item>
          
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
```

#### Step 3: Refactor (if needed)

- Extract form validation logic
- Add proper TypeScript types
- Improve error handling
- Add loading states

### Example 2: Page Renderer

#### Step 1: Write Test (RED)

```typescript
// src/engine/__tests__/PageRenderer.test.tsx
import { render, screen } from '@testing-library/react';
import { PageRenderer } from '../PageRenderer';
import { PageConfig } from '../../types';

describe('PageRenderer', () => {
  it('should render a simple page with one widget', () => {
    const config: PageConfig = {
      pageId: 'test-page',
      schemaVersion: '1.0',
      title: 'Test Page',
      widgets: [
        {
          id: 'test-card',
          type: 'Card',
          props: {
            title: 'Test Card'
          },
          children: [
            {
              id: 'test-text',
              type: 'Text',
              props: {
                children: 'Hello World'
              }
            }
          ]
        }
      ]
    };
    
    render(<PageRenderer config={config} />);
    
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
  
  it('should handle widget with datasource binding', async () => {
    const config: PageConfig = {
      pageId: 'data-page',
      schemaVersion: '1.0',
      widgets: [
        {
          id: 'user-name',
          type: 'Text',
          datasourceId: 'user-data',
          bindings: {
            children: {
              dataPath: 'datasources.user-data.name'
            }
          }
        }
      ],
      datasources: [
        {
          id: 'user-data',
          kind: 'http',
          http: {
            method: 'GET',
            url: '/api/users/user123'
          }
        }
      ]
    };
    
    render(<PageRenderer config={config} />);
    
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });
  
  it('should show warning for unknown widget type', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const config: PageConfig = {
      pageId: 'test-page',
      schemaVersion: '1.0',
      widgets: [
        {
          id: 'unknown',
          type: 'UnknownWidget',
          props: {}
        }
      ]
    };
    
    render(<PageRenderer config={config} />);
    
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('UnknownWidget')
    );
    
    consoleWarnSpy.mockRestore();
  });
});
```

#### Step 2: Implement (GREEN)

```typescript
// src/engine/PageRenderer.tsx
import React from 'react';
import { PageConfig, WidgetConfig } from '../types';
import { widgetRegistry } from './WidgetRegistry';
import { useDatasources } from '../hooks/useDatasources';

interface PageRendererProps {
  config: PageConfig;
}

export const PageRenderer: React.FC<PageRendererProps> = ({ config }) => {
  const datasources = useDatasources(config.datasources || []);
  
  const renderWidget = (widget: WidgetConfig): React.ReactNode => {
    const Component = widgetRegistry.get(widget.type);
    
    if (!Component) {
      console.warn(`Widget type "${widget.type}" not registered`);
      return null;
    }
    
    // Apply bindings
    const props = { ...widget.props };
    if (widget.bindings) {
      Object.entries(widget.bindings).forEach(([key, binding]) => {
        const value = getValueFromPath(binding.dataPath, { datasources });
        props[key] = value;
      });
    }
    
    const children = widget.children?.map(renderWidget);
    
    return (
      <Component key={widget.id} {...props}>
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

function getValueFromPath(path: string, context: any): any {
  return path.split('.').reduce((obj, key) => obj?.[key], context);
}
```

---

## Advanced Mock Patterns

### Pattern 1: Stateful Mocks

```typescript
// src/mocks/handlers/users.ts
import { rest } from 'msw';

// In-memory database
let users = [
  { id: 'user123', name: 'John Doe', email: 'john.doe@example.com' }
];

export const userHandlers = [
  // Get user
  rest.get('/api/users/:userId', (req, res, ctx) => {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res(ctx.status(404));
    }
    
    return res(ctx.status(200), ctx.json(user));
  }),
  
  // Update user
  rest.put('/api/users/:userId', async (req, res, ctx) => {
    const { userId } = req.params;
    const updates = await req.json();
    
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return res(ctx.status(404));
    }
    
    users[index] = { ...users[index], ...updates };
    
    return res(ctx.status(200), ctx.json(users[index]));
  }),
  
  // Reset (for tests)
  rest.post('/api/__test__/reset', (req, res, ctx) => {
    users = [
      { id: 'user123', name: 'John Doe', email: 'john.doe@example.com' }
    ];
    return res(ctx.status(200));
  })
];
```

### Pattern 2: Delayed Responses

```typescript
// Simulate network delay
rest.get('/api/users/:userId', (req, res, ctx) => {
  return res(
    ctx.delay(500), // 500ms delay
    ctx.status(200),
    ctx.json({ id: 'user123', name: 'John Doe' })
  );
});
```

### Pattern 3: Error Scenarios

```typescript
// src/mocks/scenarios.ts
import { rest } from 'msw';
import { server } from './server';

export const simulateNetworkError = () => {
  server.use(
    rest.get('/api/users/:userId', (req, res) => {
      return res.networkError('Failed to connect');
    })
  );
};

export const simulateServerError = () => {
  server.use(
    rest.get('/api/users/:userId', (req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
          }
        })
      );
    })
  );
};

// Use in tests
it('should handle network error', async () => {
  simulateNetworkError();
  
  render(<ProfilePage />);
  
  expect(await screen.findByText(/network error/i)).toBeInTheDocument();
});
```

---

## Integration Testing

### Test Full User Flows

```typescript
// src/__tests__/integration/login-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../../App';

describe('Login Flow', () => {
  it('should complete full login to dashboard flow', async () => {
    render(<App />);
    
    // Should start on login page
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    
    // Fill in credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john.doe@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' }
    });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Should navigate to dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    // Should show user info
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    
    // Should show menu
    expect(screen.getByText(/listings/i)).toBeInTheDocument();
  });
});
```

---

## Performance Testing

```typescript
// src/__tests__/performance/page-render.test.tsx
import { render } from '@testing-library/react';
import { PageRenderer } from '../../engine/PageRenderer';

describe('Page Render Performance', () => {
  it('should render complex page in under 100ms', () => {
    const config = generateComplexPageConfig(); // 50 widgets
    
    const startTime = performance.now();
    render(<PageRenderer config={config} />);
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(100);
  });
});
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage --watchAll=false
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Build
        run: npm run build
```

---

## Best Practices

### 1. Test Organization

```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── pages/
│   ├── LoginPage.tsx
│   └── __tests__/
│       └── LoginPage.test.tsx
└── __tests__/
    └── integration/
        └── login-flow.test.tsx
```

### 2. Test Naming

```typescript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should expected behavior', () => {
      // Test
    });
  });
});

// Example
describe('LoginPage', () => {
  describe('when form is submitted with valid credentials', () => {
    it('should navigate to dashboard', async () => {
      // Test
    });
  });
  
  describe('when form is submitted with invalid credentials', () => {
    it('should show error message', async () => {
      // Test
    });
  });
});
```

### 3. Test Data Factories

```typescript
// src/__tests__/factories/user.factory.ts
export const createMockUser = (overrides = {}) => ({
  id: 'user123',
  email: 'john.doe@example.com',
  name: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  ...overrides
});

export const createMockPageConfig = (overrides = {}) => ({
  pageId: 'test-page',
  schemaVersion: '1.0',
  widgets: [],
  ...overrides
});

// Use in tests
it('should render user name', () => {
  const user = createMockUser({ name: 'Jane Smith' });
  render(<UserProfile user={user} />);
  expect(screen.getByText('Jane Smith')).toBeInTheDocument();
});
```

---

## Summary

### Development Workflow

1. **Write API specification** in documentation
2. **Create mock API handlers** matching spec
3. **Write failing tests** for component/feature
4. **Implement component** to pass tests
5. **Refactor** for quality
6. **Validate** all tests pass
7. **Commit** with confidence

### Benefits

✅ **Parallel Development** - Frontend and backend teams work simultaneously
✅ **Clear Contracts** - API specifications enforced by mocks
✅ **Fast Feedback** - No backend dependency for frontend testing
✅ **Confidence** - Comprehensive test coverage
✅ **Documentation** - Tests serve as living documentation

---

**Version:** 1.0
**Last Updated:** January 18, 2026
**Related Documents:**
- [AI-First Implementation Plan](./ai-first-implementation-plan.md)
- [Authentication Scenarios](./authentication-scenarios.md)
- [Architecture](./architecture.md)
