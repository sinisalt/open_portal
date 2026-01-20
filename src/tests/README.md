# Tests Directory

This directory contains **test utilities, mocks, and shared test fixtures** for the application.

## Purpose

The tests directory provides:

- **Test Utilities**: Helper functions for testing
- **Mocks**: Mock data, services, and API responses
- **Fixtures**: Reusable test data and configurations
- **Test Helpers**: Custom matchers and setup utilities

## Directory Structure

```
tests/
├── utils/               # Test utility functions
│   ├── renderWithProviders.js
│   ├── mockData.js
│   └── testHelpers.js
├── mocks/              # Mock implementations
│   ├── handlers.js     # MSW request handlers
│   ├── services.js     # Mock service implementations
│   └── data.js         # Mock data generators
├── fixtures/           # Test fixtures
│   ├── widgetConfigs.js
│   ├── pageConfigs.js
│   └── userData.js
└── README.md
```

## Test Utilities

### `renderWithProviders.js`

Render component with necessary providers:

```javascript
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export function renderWithProviders(ui, { initialState = {}, ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        {/* Add other providers here (Context, State, etc.) */}
        {children}
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
```

### `mockData.js`

Generate mock data for tests:

```javascript
export function createMockWidget(overrides = {}) {
  return {
    id: 'test-widget-1',
    type: 'TextInput',
    props: {
      label: 'Test Input',
      placeholder: 'Enter text',
    },
    ...overrides,
  };
}

export function createMockPageConfig(overrides = {}) {
  return {
    id: 'test-page',
    title: 'Test Page',
    widgets: [createMockWidget()],
    ...overrides,
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  };
}
```

### `testHelpers.js`

Common test helper functions:

```javascript
import { waitFor } from '@testing-library/react';

/**
 * Wait for element to be removed from the DOM
 */
export async function waitForRemoval(element) {
  await waitFor(() => {
    expect(element).not.toBeInTheDocument();
  });
}

/**
 * Simulate async API call delay
 */
export function delay(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create mock function with spy
 */
export function createMockFunction() {
  const fn = jest.fn();
  fn.mockClear = jest.fn(() => fn.mockClear());
  return fn;
}
```

## Mocks

### MSW (Mock Service Worker) Handlers

```javascript
// mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // Mock page config endpoint
  rest.get('/api/pages/:pageId', (req, res, ctx) => {
    const { pageId } = req.params;
    return res(
      ctx.json({
        id: pageId,
        title: 'Test Page',
        widgets: [],
      })
    );
  }),

  // Mock user endpoint
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.json({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      })
    );
  }),

  // Mock authentication
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'mock-token',
        user: { id: '1', name: 'Test User' },
      })
    );
  }),
];
```

### Mock Service Implementations

```javascript
// mocks/services.js

export const mockConfigService = {
  getPageConfig: jest.fn(() =>
    Promise.resolve({
      id: 'test-page',
      title: 'Test Page',
      widgets: [],
    })
  ),
  clearCache: jest.fn(),
};

export const mockAuthService = {
  login: jest.fn(() =>
    Promise.resolve({
      token: 'mock-token',
      user: { id: '1', name: 'Test User' },
    })
  ),
  logout: jest.fn(),
  getCurrentUser: jest.fn(() => Promise.resolve({ id: '1', name: 'Test User' })),
};
```

## Test Fixtures

### Widget Configuration Fixtures

```javascript
// fixtures/widgetConfigs.js

export const textInputConfig = {
  id: 'text-input-1',
  type: 'TextInput',
  props: {
    label: 'Username',
    placeholder: 'Enter username',
    validation: {
      required: true,
      minLength: 3,
    },
  },
};

export const buttonConfig = {
  id: 'submit-btn',
  type: 'Button',
  props: {
    label: 'Submit',
    variant: 'primary',
  },
  events: {
    onClick: {
      type: 'api',
      params: {
        endpoint: '/api/submit',
        method: 'POST',
      },
    },
  },
};

export const cardConfig = {
  id: 'card-1',
  type: 'Card',
  props: {
    title: 'Test Card',
  },
  children: [textInputConfig, buttonConfig],
};
```

### Page Configuration Fixtures

```javascript
// fixtures/pageConfigs.js

export const loginPageConfig = {
  id: 'login',
  title: 'Login Page',
  route: '/login',
  widgets: [
    {
      id: 'login-form',
      type: 'Card',
      props: { title: 'Login' },
      children: [
        {
          id: 'email-input',
          type: 'TextInput',
          props: { label: 'Email', type: 'email' },
        },
        {
          id: 'password-input',
          type: 'TextInput',
          props: { label: 'Password', type: 'password' },
        },
        {
          id: 'submit-btn',
          type: 'Button',
          props: { label: 'Login' },
        },
      ],
    },
  ],
};
```

## Test Setup

### Global Test Setup

```javascript
// setupTests.js (in src root)
import '@testing-library/jest-dom';
import { server } from './tests/mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Testing Patterns

### Component Testing

```javascript
import { screen } from '@testing-library/react';
import { renderWithProviders } from './tests/utils/renderWithProviders';
import { textInputConfig } from './tests/fixtures/widgetConfigs';
import TextInput from './widgets/TextInput';

test('renders text input with label', () => {
  renderWithProviders(<TextInput config={textInputConfig} />);

  expect(screen.getByLabelText('Username')).toBeInTheDocument();
});
```

### Hook Testing

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import usePageConfig from './hooks/usePageConfig';
import { mockConfigService } from './tests/mocks/services';

test('loads page configuration', async () => {
  const { result } = renderHook(() => usePageConfig('home'));

  expect(result.current.loading).toBe(true);

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.config).toBeDefined();
  expect(mockConfigService.getPageConfig).toHaveBeenCalledWith('home');
});
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Use Fixtures**: Reuse test data via fixtures
3. **Mock External Dependencies**: Mock services, APIs, browser APIs
4. **Descriptive Names**: Use clear test names that describe behavior
5. **Arrange-Act-Assert**: Follow AAA pattern
6. **Test Behavior, Not Implementation**: Focus on user-facing behavior
7. **Clean Up**: Reset mocks and state after each test

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test TextInput.test.js
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Focus on testing:

- User interactions
- Edge cases and error handling
- Accessibility features
- Integration between components
