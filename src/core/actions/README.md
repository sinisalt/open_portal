# Action Engine Framework

The Action Engine is the core interactivity system for OpenPortal. It provides a configuration-driven approach to handling user interactions, API calls, state management, and UI feedback.

## Overview

All user interactions in OpenPortal are handled through **Actions**. Actions are defined in JSON configurations from the backend and executed by the Action Executor on the frontend. This architecture ensures:

- ✅ Zero frontend code changes for new features
- ✅ Backend-controlled business logic
- ✅ Consistent error handling
- ✅ Automatic loading states
- ✅ Action chaining and composition
- ✅ Retry logic and cancellation support

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Action Execution Flow                      │
└─────────────────────────────────────────────────────────────┘

User Event → Action Executor → Action Registry → Action Handler
                ↓                                       ↓
        Parameter Resolution                    Execute Logic
                ↓                                       ↓
        Condition Check                          Return Result
                ↓                                       ↓
        Execute Action ←────────────────────────────────
                ↓
        Handle Result (Success/Error)
                ↓
        Execute Chained Actions (onSuccess/onError)
```

### Core Components

1. **ActionRegistry** - Maps action types to handler functions
2. **ActionExecutor** - Executes actions with lifecycle management
3. **Action Handlers** - Individual action implementations
4. **Template Utils** - Parameter interpolation and resolution

## Action Types

### Navigation Actions
- `navigate` - Navigate to a different page
- `goBack` - Navigate to previous page
- `reload` - Reload current page

### State Management Actions
- `setState` - Update page state
- `resetState` - Reset page state
- `mergeState` - Merge values into state

### API Actions
- `apiCall` - Execute HTTP API calls
- `executeAction` - Execute backend-defined actions

### UI Feedback Actions
- `showToast` - Display toast notifications
- `showDialog` - Show confirmation dialogs

### Chaining Actions
- `sequence` - Execute actions sequentially
- `parallel` - Execute actions in parallel
- `conditional` - Conditional execution

## Usage Examples

### Basic Action Configuration

```json
{
  "id": "save-profile",
  "type": "apiCall",
  "params": {
    "url": "/api/users/{{routeParams.userId}}",
    "method": "PUT",
    "body": {
      "name": "{{formData.name}}",
      "email": "{{formData.email}}"
    }
  },
  "onSuccess": [
    {
      "id": "show-success",
      "type": "showToast",
      "params": {
        "message": "Profile saved successfully",
        "variant": "success"
      }
    },
    {
      "id": "navigate-back",
      "type": "goBack"
    }
  ],
  "onError": [
    {
      "id": "show-error",
      "type": "showToast",
      "params": {
        "message": "Failed to save profile",
        "variant": "error"
      }
    }
  ]
}
```

### Template Interpolation

Actions support template expressions using `{{context.path}}` syntax:

```json
{
  "id": "fetch-user",
  "type": "apiCall",
  "params": {
    "url": "/api/users/{{routeParams.userId}}",
    "method": "GET"
  }
}
```

**Supported Context Paths:**
- `{{pageState.*}}` - Page state variables
- `{{formData.*}}` - Form field values
- `{{routeParams.*}}` - URL path parameters
- `{{queryParams.*}}` - URL query parameters
- `{{user.*}}` - User information
- `{{tenant.*}}` - Tenant information
- `{{permissions}}` - User permissions array
- `{{currentPath}}` - Current route path

### Conditional Execution

```json
{
  "id": "admin-action",
  "type": "apiCall",
  "when": "{{pageState.isAdmin}}",
  "params": {
    "url": "/api/admin/dashboard",
    "method": "GET"
  }
}
```

### Action Chaining

**Sequential Execution:**
```json
{
  "id": "multi-step",
  "type": "sequence",
  "params": {
    "actions": [
      { "id": "step1", "type": "apiCall", "params": {...} },
      { "id": "step2", "type": "setState", "params": {...} },
      { "id": "step3", "type": "navigate", "params": {...} }
    ]
  }
}
```

**Parallel Execution:**
```json
{
  "id": "load-dashboard",
  "type": "parallel",
  "params": {
    "actions": [
      { "id": "fetch-users", "type": "apiCall", "params": {...} },
      { "id": "fetch-stats", "type": "apiCall", "params": {...} },
      { "id": "fetch-notifications", "type": "apiCall", "params": {...} }
    ]
  }
}
```

**Conditional Execution:**
```json
{
  "id": "role-based-action",
  "type": "conditional",
  "params": {
    "condition": "{{pageState.isAdmin}}",
    "then": [
      { "id": "admin-view", "type": "navigate", "params": { "to": "/admin" } }
    ],
    "else": [
      { "id": "user-view", "type": "navigate", "params": { "to": "/dashboard" } }
    ]
  }
}
```

### Retry Logic

```json
{
  "id": "fetch-with-retry",
  "type": "apiCall",
  "params": {
    "url": "/api/data",
    "method": "GET"
  },
  "retry": {
    "attempts": 3,
    "delay": 1000,
    "backoff": "exponential"
  }
}
```

### Timeout and Cancellation

```json
{
  "id": "slow-api",
  "type": "apiCall",
  "params": {
    "url": "/api/slow-endpoint",
    "method": "GET"
  },
  "timeout": 5000
}
```

## Programmatic Usage

### Register Custom Action

```typescript
import { actionRegistry } from '@/core/actions';
import type { ActionHandler, ActionContext, ActionResult } from '@/types/action.types';

const myCustomHandler: ActionHandler = async (params, context) => {
  try {
    // Your custom logic here
    return {
      success: true,
      data: { result: 'success' },
      metadata: { duration: 0 },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        code: 'CUSTOM_ERROR',
      },
      metadata: { duration: 0 },
    };
  }
};

actionRegistry.register('myCustomAction', myCustomHandler, {
  displayName: 'My Custom Action',
  description: 'Does something custom',
  cancellable: true,
  retriable: true,
});
```

### Execute Action

```typescript
import { actionExecutor } from '@/core/actions';
import type { ActionConfig, ActionContext } from '@/types/action.types';

const action: ActionConfig = {
  id: 'my-action',
  type: 'apiCall',
  params: {
    url: '/api/data',
    method: 'GET',
  },
};

const context: ActionContext = {
  // ... your action context
};

const result = await actionExecutor.execute(action, context);

if (result.success) {
  console.log('Action succeeded:', result.data);
} else {
  console.error('Action failed:', result.error);
}
```

## Action Context

Every action has access to a rich execution context:

```typescript
interface ActionContext {
  // State
  pageState: Record<string, unknown>;
  formData: Record<string, unknown>;
  widgetStates: Record<string, unknown>;

  // User & Tenant
  user: BootstrapUser | null;
  permissions: string[];
  tenant: BootstrapTenant | null;

  // Navigation
  routeParams: Record<string, string>;
  queryParams: Record<string, string>;
  currentPath: string;

  // Services
  navigate: (to: string, options?: NavigateOptions) => void;
  showToast: (message: string, variant: ToastVariant, duration?: number) => void;
  fetch: (url: string, options?: RequestInit) => Promise<Response>;
  setState: (path: string, value: unknown, merge?: boolean) => void;
  getState: (path?: string) => unknown;

  // Event trigger information
  trigger?: ActionTrigger;
}
```

## Error Handling

Actions have comprehensive error handling:

1. **Handler Errors** - Caught and returned as `ActionResult.error`
2. **Timeout Errors** - Automatically triggered after `action.timeout`
3. **Cancellation** - Via AbortSignal
4. **Retry Logic** - Automatic retries with configurable backoff

```typescript
interface ActionError {
  message: string;
  code?: string;
  status?: number;
  fieldErrors?: Record<string, string[]>;
  cause?: unknown;
}
```

## Testing

The action engine has comprehensive test coverage:

```bash
npm test -- src/core/actions
```

**Test Coverage:**
- ✅ ActionRegistry (18 tests)
- ✅ Template Utilities (28 tests)
- ✅ ActionExecutor (18 tests)
- ✅ Total: 64 tests

## Best Practices

1. **Use Template Expressions** - Avoid hardcoding values
2. **Handle Errors** - Always provide `onError` handlers
3. **Keep Actions Focused** - One action = one responsibility
4. **Use Chaining** - Compose complex flows from simple actions
5. **Test Actions** - Write tests for custom action handlers
6. **Add Metadata** - Document your actions with metadata

## Built-in Actions Reference

### navigate
**Purpose:** Navigate to a different page  
**Parameters:**
- `to` (string, required) - Target path
- `query` (object) - Query parameters
- `replace` (boolean) - Replace history entry
- `external` (boolean) - External URL
- `openInNewTab` (boolean) - Open in new tab

### goBack
**Purpose:** Navigate to previous page  
**Parameters:**
- `fallback` (string) - Fallback route if no history

### reload
**Purpose:** Reload current page  
**Parameters:**
- `hard` (boolean) - Force cache invalidation

### setState
**Purpose:** Update page state  
**Parameters:**
- `path` (string) - State path (e.g., "user.name")
- `value` (any, required) - New value
- `merge` (boolean) - Merge with existing (default: true)

### resetState
**Purpose:** Reset page state  
**Parameters:**
- `paths` (string[]) - Specific paths to reset

### mergeState
**Purpose:** Merge values into state  
**Parameters:**
- `updates` (object, required) - State updates

### apiCall
**Purpose:** Execute HTTP API call  
**Parameters:**
- `url` (string, required) - API endpoint
- `method` (string, required) - HTTP method
- `headers` (object) - Custom headers
- `body` (any) - Request body
- `queryParams` (object) - Query parameters
- `timeout` (number) - Request timeout (ms)

### executeAction
**Purpose:** Execute backend-defined action  
**Parameters:**
- `actionId` (string, required) - Backend action ID
- `context` (object) - Action context data

### showToast
**Purpose:** Display toast notification  
**Parameters:**
- `message` (string, required) - Notification message
- `variant` (string, required) - Toast variant (success/error/warning/info)
- `duration` (number) - Auto-dismiss time (ms)

### showDialog
**Purpose:** Display confirmation dialog  
**Parameters:**
- `title` (string, required) - Dialog title
- `message` (string, required) - Dialog message
- `variant` (string, required) - Dialog variant (info/warning/error/confirm)
- `confirmLabel` (string) - Confirm button label
- `cancelLabel` (string) - Cancel button label

## Files

- `ActionRegistry.ts` - Action handler registry
- `ActionExecutor.ts` - Action execution engine
- `templateUtils.ts` - Template interpolation utilities
- `handlers/` - Built-in action handlers
  - `navigationHandlers.ts` - Navigation actions
  - `stateHandlers.ts` - State management actions
  - `apiHandlers.ts` - API actions
  - `uiFeedbackHandlers.ts` - UI feedback actions
  - `chainingHandlers.ts` - Chaining actions
- `index.ts` - Public API exports

## Related Documentation

- [Action Catalog](/documentation/action-catalog.md) - Complete action reference
- [Widget Architecture](/documentation/WIDGET-ARCHITECTURE.md) - Widget system
- [API Specification](/documentation/api-specification.md) - Backend API contracts

## License

Part of the OpenPortal platform.
