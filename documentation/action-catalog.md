# OpenPortal Action Catalog

**Version:** 1.0  
**Status:** Foundation Documentation  
**Last Updated:** January 2026

## Overview

Actions are the fundamental building blocks of interactivity in OpenPortal. They define what happens when users interact with the UI through clicks, form submissions, and other events. All actions are **configuration-driven**, meaning business logic is defined in backend configurations rather than hardcoded in frontend components.

This document defines the **standard action catalog** that forms the core interaction model for the OpenPortal platform.

---

## Table of Contents

1. [Action Execution Model](#action-execution-model)
2. [Action Structure](#action-structure)
3. [Action Catalog](#action-catalog)
4. [Action Chaining](#action-chaining)
5. [Error Handling](#error-handling)
6. [Security Considerations](#security-considerations)
7. [Testing Strategy](#testing-strategy)

---

## Action Execution Model

### Execution Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                   Action Execution Flow                      │
└─────────────────────────────────────────────────────────────┘

1. User Trigger
   └─> Event fired (onClick, onSubmit, onChange, etc.)

2. Action Resolution
   └─> Action executor locates action configuration by ID
   └─> Validates action permissions
   └─> Resolves action parameters from context

3. Pre-execution
   └─> Evaluates condition (if present)
   └─> Sets loading state (if configured)
   └─> Logs action start (dev mode)

4. Execution
   └─> Invokes action handler
   └─> Handles async operations
   └─> Manages cancellation
   └─> Tracks execution time

5. Result Handling
   ├─> Success Path
   │   ├─> Apply state updates
   │   ├─> Trigger onSuccess actions
   │   ├─> Clear loading state
   │   └─> Log result (dev mode)
   │
   └─> Error Path
       ├─> Capture error details
       ├─> Trigger onError actions
       ├─> Display error feedback
       ├─> Clear loading state
       └─> Log error (dev mode)

6. Post-execution
   └─> Update UI reactively
   └─> Execute chained actions
   └─> Cleanup resources
```

### Action Context

Every action has access to an execution context containing:

```typescript
interface ActionContext {
  // State
  pageState: Record<string, any>;        // Current page state
  formData: Record<string, any>;         // Form field values
  widgetStates: Record<string, any>;     // Widget-specific states
  
  // User & Tenant
  user: {
    id: string;
    email: string;
    name: string;
    permissions: string[];
  };
  tenant: {
    id: string;
    name: string;
    settings: Record<string, any>;
  };
  
  // Navigation
  routeParams: Record<string, string>;   // URL path parameters
  queryParams: Record<string, string>;   // URL query parameters
  currentPath: string;                    // Current route path
  
  // Services
  api: ApiService;                        // HTTP client
  toast: ToastService;                    // Notification service
  navigation: NavigationService;          // Router
  modal: ModalService;                    // Modal manager
  datasource: DatasourceService;          // Data fetching
  cache: CacheService;                    // Cache manager
  
  // Event
  trigger: {
    widgetId: string;                     // Widget that triggered action
    eventType: string;                    // Event type (onClick, etc.)
    eventData?: any;                      // Event-specific data
  };
}
```

---

## Action Structure

Every action follows this base structure:

```typescript
interface ActionConfig {
  id: string;                              // Unique action identifier
  kind: ActionKind;                        // Action type
  params?: Record<string, any>;            // Action-specific parameters
  condition?: string;                      // Conditional execution (template)
  onSuccess?: ActionConfig[];              // Success handler actions
  onError?: ActionConfig[];                // Error handler actions
  loading?: boolean;                       // Show loading indicator
  timeout?: number;                        // Execution timeout (ms)
  retry?: {
    attempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
}
```

### Parameter Resolution

Parameters support **template interpolation** using `{{context.path}}` syntax:

```json
{
  "id": "save-user",
  "kind": "apiCall",
  "params": {
    "url": "/api/users/{{routeParams.userId}}",
    "method": "PUT",
    "body": {
      "name": "{{formData.name}}",
      "email": "{{formData.email}}",
      "isActive": "{{pageState.userActive}}"
    }
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
- `{{widgetStates.*}}` - Widget state
- `{{trigger.*}}` - Event trigger data

---

## Action Catalog

### 1. Navigation Actions

#### 1.1. navigate

Navigate to a different page or route.

**Parameters:**
```typescript
{
  to: string;                              // Target path (supports templates)
  params?: Record<string, string>;         // Path parameters
  query?: Record<string, string>;          // Query parameters
  replace?: boolean;                       // Replace history (default: false)
  external?: boolean;                      // External URL (default: false)
  openInNewTab?: boolean;                  // Open in new tab (default: false)
}
```

**Returns:** `void`

**Side Effects:**
- Changes browser URL
- Updates route state
- May trigger page config reload

**Error Handling:**
- Invalid route: Log warning, do not navigate
- Missing params: Throw validation error

**Permissions:** None required

**Example:**
```json
{
  "id": "go-to-profile",
  "kind": "navigate",
  "params": {
    "to": "/users/{{routeParams.userId}}/profile",
    "query": {
      "tab": "settings"
    }
  }
}
```

**Security Considerations:**
- Validate all URLs server-side if external
- Prevent navigation to unauthorized routes
- Sanitize query parameters

---

#### 1.2. goBack

Navigate to the previous page in history.

**Parameters:**
```typescript
{
  fallback?: string;                       // Fallback route if no history
}
```

**Returns:** `void`

**Side Effects:** Updates browser history

**Error Handling:** If no history, navigate to fallback or do nothing

**Permissions:** None required

**Example:**
```json
{
  "id": "go-back",
  "kind": "goBack",
  "params": {
    "fallback": "/dashboard"
  }
}
```

---

#### 1.3. reload

Reload the current page configuration.

**Parameters:**
```typescript
{
  hard?: boolean;                          // Force cache invalidation
}
```

**Returns:** `void`

**Side Effects:**
- Invalidates page config cache
- Refetches page configuration
- Resets page state

**Error Handling:** If reload fails, show error toast

**Permissions:** None required

**Example:**
```json
{
  "id": "reload-page",
  "kind": "reload",
  "params": {
    "hard": true
  }
}
```

---

### 2. API Actions

#### 2.1. apiCall

Execute an HTTP API call.

**Parameters:**
```typescript
{
  url: string;                             // API endpoint (supports templates)
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;        // Custom headers
  body?: any;                              // Request body
  queryParams?: Record<string, any>;       // Query parameters
  timeout?: number;                        // Request timeout (ms)
  cache?: boolean;                         // Cache GET requests
  retryOn5xx?: boolean;                    // Retry on 5xx errors
}
```

**Returns:** `{ status: number; data: any; headers: Record<string, string> }`

**Side Effects:**
- Makes HTTP request to backend
- May update server state
- Updates local cache (if enabled)

**Error Handling:**
- Network errors: Trigger onError with error details
- 4xx errors: Validation error, display field errors
- 5xx errors: Server error, retry if configured
- Timeout: Cancel request, trigger onError

**Permissions:** Checked via backend endpoint

**Example:**
```json
{
  "id": "fetch-users",
  "kind": "apiCall",
  "params": {
    "url": "/api/users",
    "method": "GET",
    "queryParams": {
      "page": "{{pageState.currentPage}}",
      "pageSize": 20
    }
  },
  "onSuccess": [
    {
      "id": "update-users",
      "kind": "setState",
      "params": {
        "path": "users",
        "value": "{{result.data}}"
      }
    }
  ]
}
```

---

#### 2.2. executeAction

Execute a backend-defined action via the action gateway.

**Parameters:**
```typescript
{
  actionId: string;                        // Backend action identifier
  context?: Record<string, any>;           // Action context data
}
```

**Returns:** `ActionResult` (backend-defined)

**Side Effects:**
- Calls `/ui/actions/execute` endpoint
- Backend performs business logic
- May return state patches, navigation, modals

**Error Handling:**
- Validation errors: Display field errors
- Business logic errors: Display error message
- Permission errors: Show unauthorized message

**Permissions:** Checked by backend

**Example:**
```json
{
  "id": "save-profile",
  "kind": "executeAction",
  "params": {
    "actionId": "update-user-profile",
    "context": {
      "formValues": "{{formData}}",
      "routeParams": "{{routeParams}}"
    }
  },
  "onSuccess": [
    {
      "id": "show-success",
      "kind": "showToast",
      "params": {
        "message": "Profile updated successfully",
        "variant": "success"
      }
    }
  ]
}
```

---

### 3. State Management Actions

#### 3.1. setState

Update page state.

**Parameters:**
```typescript
{
  path?: string;                           // State path (e.g., "user.name")
  value: any;                              // New value
  merge?: boolean;                         // Merge with existing (default: true)
}
```

**Returns:** `void`

**Side Effects:**
- Updates page state
- Triggers reactive UI updates
- May affect widget visibility/behavior

**Error Handling:** If path invalid, log warning

**Permissions:** None required

**Example:**
```json
{
  "id": "set-filter",
  "kind": "setState",
  "params": {
    "path": "filters.status",
    "value": "active"
  }
}
```

---

#### 3.2. resetState

Reset page state to initial values.

**Parameters:**
```typescript
{
  paths?: string[];                        // Specific paths to reset (optional)
}
```

**Returns:** `void`

**Side Effects:**
- Resets state to page initialization values
- Triggers UI re-render

**Error Handling:** None

**Permissions:** None required

**Example:**
```json
{
  "id": "reset-filters",
  "kind": "resetState",
  "params": {
    "paths": ["filters", "pagination"]
  }
}
```

---

#### 3.3. mergeState

Merge new values into existing state.

**Parameters:**
```typescript
{
  updates: Record<string, any>;            // State updates
}
```

**Returns:** `void`

**Side Effects:** Updates multiple state paths at once

**Error Handling:** None

**Permissions:** None required

**Example:**
```json
{
  "id": "apply-filters",
  "kind": "mergeState",
  "params": {
    "updates": {
      "filters.status": "{{formData.status}}",
      "filters.dateRange": "{{formData.dateRange}}",
      "pagination.page": 1
    }
  }
}
```

---

### 4. UI Feedback Actions

#### 4.1. showToast

Display a toast notification.

**Parameters:**
```typescript
{
  message: string;                         // Notification message
  variant: 'success' | 'error' | 'warning' | 'info';
  duration?: number;                       // Auto-dismiss time (ms, default: 5000)
  action?: {
    label: string;
    actionId: string;                      // Action to execute on click
  };
}
```

**Returns:** `void`

**Side Effects:** Displays toast notification

**Error Handling:** None

**Permissions:** None required

**Example:**
```json
{
  "id": "success-notification",
  "kind": "showToast",
  "params": {
    "message": "Changes saved successfully",
    "variant": "success",
    "duration": 3000
  }
}
```

---

#### 4.2. showDialog

Display a confirmation or alert dialog.

**Parameters:**
```typescript
{
  title: string;
  message: string;
  variant: 'info' | 'warning' | 'error' | 'confirm';
  confirmLabel?: string;                   // Confirm button label
  cancelLabel?: string;                    // Cancel button label
  onConfirm?: ActionConfig[];              // Actions on confirm
  onCancel?: ActionConfig[];               // Actions on cancel
}
```

**Returns:** `{ confirmed: boolean }`

**Side Effects:** Displays modal dialog, blocks interaction

**Error Handling:** None

**Permissions:** None required

**Example:**
```json
{
  "id": "confirm-delete",
  "kind": "showDialog",
  "params": {
    "title": "Confirm Deletion",
    "message": "Are you sure you want to delete this item?",
    "variant": "confirm",
    "confirmLabel": "Delete",
    "cancelLabel": "Cancel",
    "onConfirm": [
      {
        "id": "delete-item",
        "kind": "executeAction",
        "params": {
          "actionId": "delete-listing",
          "context": {
            "itemId": "{{routeParams.id}}"
          }
        }
      }
    ]
  }
}
```

---

#### 4.3. closeDialog

Close the current dialog.

**Parameters:** None

**Returns:** `void`

**Side Effects:** Closes active dialog

**Error Handling:** None if no dialog open

**Permissions:** None required

**Example:**
```json
{
  "id": "close-modal",
  "kind": "closeDialog"
}
```

---

### 5. Form Actions

#### 5.1. submitForm

Submit a form with validation.

**Parameters:**
```typescript
{
  formId: string;                          // Form widget ID
  validateFirst?: boolean;                 // Validate before submit (default: true)
  actionId?: string;                       // Backend action to execute
}
```

**Returns:** `{ success: boolean; errors?: FieldError[] }`

**Side Effects:**
- Validates form fields
- Calls backend action with form data
- Updates form state

**Error Handling:**
- Validation errors: Display field errors
- Submit errors: Trigger onError actions

**Permissions:** Via backend action

**Example:**
```json
{
  "id": "submit-profile-form",
  "kind": "submitForm",
  "params": {
    "formId": "profile-form",
    "actionId": "save-profile"
  },
  "onSuccess": [
    {
      "id": "navigate-to-dashboard",
      "kind": "navigate",
      "params": {
        "to": "/dashboard"
      }
    }
  ]
}
```

---

#### 5.2. validateForm

Validate a form without submitting.

**Parameters:**
```typescript
{
  formId: string;                          // Form widget ID
  fields?: string[];                       // Specific fields (optional)
}
```

**Returns:** `{ valid: boolean; errors: FieldError[] }`

**Side Effects:** Updates field error states

**Error Handling:** None

**Permissions:** None required

**Example:**
```json
{
  "id": "validate-email",
  "kind": "validateForm",
  "params": {
    "formId": "signup-form",
    "fields": ["email"]
  }
}
```

---

#### 5.3. resetForm

Reset form to initial values.

**Parameters:**
```typescript
{
  formId: string;                          // Form widget ID
}
```

**Returns:** `void`

**Side Effects:**
- Clears form values
- Clears validation errors
- Resets to initial state

**Error Handling:** None

**Permissions:** None required

**Example:**
```json
{
  "id": "reset-search-form",
  "kind": "resetForm",
  "params": {
    "formId": "search-form"
  }
}
```

---

### 6. Data Actions

#### 6.1. refreshDatasource

Refresh a datasource and invalidate cache.

**Parameters:**
```typescript
{
  datasourceId: string;                    // Datasource to refresh
  force?: boolean;                         // Force refresh (default: false)
}
```

**Returns:** `void`

**Side Effects:**
- Invalidates datasource cache
- Refetches data
- Updates dependent widgets

**Error Handling:** If fetch fails, log error and keep stale data

**Permissions:** None required

**Example:**
```json
{
  "id": "refresh-users",
  "kind": "refreshDatasource",
  "params": {
    "datasourceId": "users-list",
    "force": true
  }
}
```

---

#### 6.2. invalidateCache

Invalidate cache entries.

**Parameters:**
```typescript
{
  pattern?: string;                        // Cache key pattern (* for all)
  datasourceIds?: string[];                // Specific datasources
}
```

**Returns:** `void`

**Side Effects:** Clears cache entries

**Error Handling:** None

**Permissions:** None required

**Example:**
```json
{
  "id": "clear-user-cache",
  "kind": "invalidateCache",
  "params": {
    "pattern": "users/*"
  }
}
```

---

### 7. Modal Management Actions

#### 7.1. openModal

Open a modal dialog with custom content.

**Parameters:**
```typescript
{
  modalId: string;                         // Modal configuration ID
  props?: Record<string, any>;             // Props to pass to modal
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
}
```

**Returns:** `{ result?: any }`

**Side Effects:**
- Opens modal overlay
- Blocks background interaction
- May suspend page state

**Error Handling:** If modal config not found, log error

**Permissions:** Via modal content

**Example:**
```json
{
  "id": "open-edit-modal",
  "kind": "openModal",
  "params": {
    "modalId": "edit-user-modal",
    "props": {
      "userId": "{{routeParams.userId}}",
      "userData": "{{pageState.selectedUser}}"
    },
    "size": "lg"
  }
}
```

---

#### 7.2. closeModal

Close the current modal.

**Parameters:**
```typescript
{
  result?: any;                            // Result to pass to parent
}
```

**Returns:** `void`

**Side Effects:** Closes modal, returns result to opener

**Error Handling:** None

**Permissions:** None required

**Example:**
```json
{
  "id": "save-and-close",
  "kind": "closeModal",
  "params": {
    "result": {
      "saved": true,
      "userId": "{{formData.id}}"
    }
  }
}
```

---

### 8. File Operations

#### 8.1. downloadFile

Trigger a file download.

**Parameters:**
```typescript
{
  url: string;                             // File URL or API endpoint
  filename?: string;                       // Download filename
  contentType?: string;                    // Content type
}
```

**Returns:** `void`

**Side Effects:** Downloads file to user's device

**Error Handling:** If download fails, show error toast

**Permissions:** Via API endpoint

**Example:**
```json
{
  "id": "download-report",
  "kind": "downloadFile",
  "params": {
    "url": "/api/reports/{{reportId}}/download",
    "filename": "report-{{routeParams.reportId}}.pdf"
  }
}
```

---

#### 8.2. uploadFile

Upload a file to the server.

**Parameters:**
```typescript
{
  url: string;                             // Upload endpoint
  fileInputId: string;                     // File input widget ID
  method?: 'POST' | 'PUT';                 // HTTP method (default: POST)
  additionalData?: Record<string, any>;    // Extra form data
}
```

**Returns:** `{ fileId: string; url: string }`

**Side Effects:**
- Uploads file via multipart/form-data
- May update server state

**Error Handling:**
- File too large: Show error
- Invalid file type: Show error
- Upload failed: Retry with exponential backoff

**Permissions:** Via upload endpoint

**Example:**
```json
{
  "id": "upload-avatar",
  "kind": "uploadFile",
  "params": {
    "url": "/api/users/{{user.id}}/avatar",
    "fileInputId": "avatar-input",
    "additionalData": {
      "crop": "{{pageState.cropSettings}}"
    }
  },
  "onSuccess": [
    {
      "id": "update-avatar-url",
      "kind": "setState",
      "params": {
        "path": "user.avatarUrl",
        "value": "{{result.url}}"
      }
    }
  ]
}
```

---

### 9. Utility Actions

#### 9.1. log

Log a message to the console (dev mode only).

**Parameters:**
```typescript
{
  message: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
  data?: any;                              // Additional data to log
}
```

**Returns:** `void`

**Side Effects:** Logs to browser console in dev mode

**Error Handling:** None

**Permissions:** None required

**Example:**
```json
{
  "id": "debug-state",
  "kind": "log",
  "params": {
    "message": "Current page state",
    "level": "debug",
    "data": "{{pageState}}"
  }
}
```

---

#### 9.2. delay

Pause execution for a specified duration.

**Parameters:**
```typescript
{
  duration: number;                        // Delay in milliseconds
}
```

**Returns:** `void`

**Side Effects:** Delays subsequent action execution

**Error Handling:** None

**Permissions:** None required

**Example:**
```json
{
  "id": "delayed-redirect",
  "kind": "sequence",
  "params": {
    "actions": [
      {
        "id": "show-success",
        "kind": "showToast",
        "params": {
          "message": "Redirecting...",
          "variant": "info"
        }
      },
      {
        "id": "wait",
        "kind": "delay",
        "params": {
          "duration": 2000
        }
      },
      {
        "id": "redirect",
        "kind": "navigate",
        "params": {
          "to": "/dashboard"
        }
      }
    ]
  }
}
```

---

#### 9.3. conditional

Execute actions conditionally based on a condition.

**Parameters:**
```typescript
{
  condition: string;                       // Condition template
  then: ActionConfig[];                    // Actions if true
  else?: ActionConfig[];                   // Actions if false
}
```

**Returns:** `void`

**Side Effects:** Executes conditional branch

**Error Handling:** If condition evaluation fails, log error

**Permissions:** None required

**Example:**
```json
{
  "id": "conditional-save",
  "kind": "conditional",
  "params": {
    "condition": "{{user.permissions.includes('user:write')}}",
    "then": [
      {
        "id": "save-user",
        "kind": "executeAction",
        "params": {
          "actionId": "update-user"
        }
      }
    ],
    "else": [
      {
        "id": "show-error",
        "kind": "showToast",
        "params": {
          "message": "You don't have permission to save",
          "variant": "error"
        }
      }
    ]
  }
}
```

---

### 10. Bulk Operations

#### 10.1. sequence

Execute multiple actions sequentially.

**Parameters:**
```typescript
{
  actions: ActionConfig[];                 // Actions to execute in order
  stopOnError?: boolean;                   // Stop if action fails (default: true)
}
```

**Returns:** `{ results: any[] }`

**Side Effects:** Executes actions one at a time

**Error Handling:** If stopOnError=true, halts on first error

**Permissions:** Per individual action

**Example:**
```json
{
  "id": "save-sequence",
  "kind": "sequence",
  "params": {
    "actions": [
      {
        "id": "validate",
        "kind": "validateForm",
        "params": {
          "formId": "user-form"
        }
      },
      {
        "id": "save",
        "kind": "executeAction",
        "params": {
          "actionId": "save-user"
        }
      },
      {
        "id": "notify",
        "kind": "showToast",
        "params": {
          "message": "User saved",
          "variant": "success"
        }
      },
      {
        "id": "navigate",
        "kind": "navigate",
        "params": {
          "to": "/users"
        }
      }
    ]
  }
}
```

---

#### 10.2. parallel

Execute multiple actions in parallel.

**Parameters:**
```typescript
{
  actions: ActionConfig[];                 // Actions to execute concurrently
  waitForAll?: boolean;                    // Wait for all to complete (default: true)
}
```

**Returns:** `{ results: any[] }`

**Side Effects:** Executes actions concurrently

**Error Handling:** Collects all errors, doesn't stop execution

**Permissions:** Per individual action

**Example:**
```json
{
  "id": "load-dashboard-data",
  "kind": "parallel",
  "params": {
    "actions": [
      {
        "id": "fetch-users",
        "kind": "apiCall",
        "params": {
          "url": "/api/users",
          "method": "GET"
        }
      },
      {
        "id": "fetch-stats",
        "kind": "apiCall",
        "params": {
          "url": "/api/stats",
          "method": "GET"
        }
      },
      {
        "id": "fetch-notifications",
        "kind": "apiCall",
        "params": {
          "url": "/api/notifications",
          "method": "GET"
        }
      }
    ]
  }
}
```

---

#### 10.3. forEach

Execute an action for each item in a collection.

**Parameters:**
```typescript
{
  collection: string;                      // State path to array
  action: ActionConfig;                    // Action template to execute
  parallel?: boolean;                      // Execute in parallel (default: false)
}
```

**Returns:** `{ results: any[] }`

**Side Effects:** Executes action multiple times

**Error Handling:** Collects errors for each iteration

**Permissions:** Per individual action execution

**Example:**
```json
{
  "id": "delete-selected",
  "kind": "forEach",
  "params": {
    "collection": "{{pageState.selectedIds}}",
    "parallel": true,
    "action": {
      "id": "delete-item",
      "kind": "apiCall",
      "params": {
        "url": "/api/items/{{item}}",
        "method": "DELETE"
      }
    }
  },
  "onSuccess": [
    {
      "id": "refresh-list",
      "kind": "refreshDatasource",
      "params": {
        "datasourceId": "items-list"
      }
    }
  ]
}
```

---

## Action Chaining

Actions can be chained together to create complex workflows. Chaining is accomplished through:

### 1. Success/Error Handlers

Every action can define `onSuccess` and `onError` handlers:

```json
{
  "id": "save-user",
  "kind": "executeAction",
  "params": {
    "actionId": "update-user"
  },
  "onSuccess": [
    {
      "id": "show-success",
      "kind": "showToast",
      "params": {
        "message": "User saved successfully",
        "variant": "success"
      }
    },
    {
      "id": "navigate-to-list",
      "kind": "navigate",
      "params": {
        "to": "/users"
      }
    }
  ],
  "onError": [
    {
      "id": "show-error",
      "kind": "showToast",
      "params": {
        "message": "Failed to save user: {{error.message}}",
        "variant": "error"
      }
    }
  ]
}
```

### 2. Sequential Execution

Use `sequence` for ordered execution:

```json
{
  "id": "multi-step-workflow",
  "kind": "sequence",
  "params": {
    "actions": [
      { "id": "step1", "kind": "validateForm", "params": {...} },
      { "id": "step2", "kind": "apiCall", "params": {...} },
      { "id": "step3", "kind": "setState", "params": {...} },
      { "id": "step4", "kind": "showToast", "params": {...} }
    ]
  }
}
```

### 3. Parallel Execution

Use `parallel` for concurrent execution:

```json
{
  "id": "load-multiple-resources",
  "kind": "parallel",
  "params": {
    "actions": [
      { "id": "fetch-users", "kind": "apiCall", "params": {...} },
      { "id": "fetch-products", "kind": "apiCall", "params": {...} },
      { "id": "fetch-orders", "kind": "apiCall", "params": {...} }
    ]
  }
}
```

### 4. Conditional Execution

Use `conditional` for branching logic:

```json
{
  "id": "conditional-workflow",
  "kind": "conditional",
  "params": {
    "condition": "{{pageState.isDraft}}",
    "then": [
      { "id": "save-draft", "kind": "executeAction", "params": {...} }
    ],
    "else": [
      { "id": "publish", "kind": "executeAction", "params": {...} }
    ]
  }
}
```

### 5. Result Passing

Actions can access results from previous actions in the chain:

```json
{
  "id": "fetch-and-display",
  "kind": "sequence",
  "params": {
    "actions": [
      {
        "id": "fetch-data",
        "kind": "apiCall",
        "params": {
          "url": "/api/users/{{routeParams.id}}",
          "method": "GET"
        }
      },
      {
        "id": "update-state",
        "kind": "setState",
        "params": {
          "path": "user",
          "value": "{{result.data}}"
        }
      },
      {
        "id": "show-notification",
        "kind": "showToast",
        "params": {
          "message": "Loaded user {{result.data.name}}",
          "variant": "success"
        }
      }
    ]
  }
}
```

---

## Error Handling

### Error Types

1. **Validation Errors** - User input validation failures
2. **Network Errors** - Connection issues, timeouts
3. **Authorization Errors** - Permission denied
4. **Business Logic Errors** - Backend rules violated
5. **System Errors** - Unexpected failures

### Error Handling Strategy

#### 1. Global Error Handler

All actions have a default error handler that:
- Logs error to console (dev mode)
- Displays error toast (configurable)
- Prevents error propagation to UI framework

#### 2. Action-Specific Error Handlers

Use `onError` to handle errors for specific actions:

```json
{
  "id": "risky-operation",
  "kind": "apiCall",
  "params": {...},
  "onError": [
    {
      "id": "log-error",
      "kind": "log",
      "params": {
        "message": "Operation failed",
        "level": "error",
        "data": "{{error}}"
      }
    },
    {
      "id": "show-retry-dialog",
      "kind": "showDialog",
      "params": {
        "title": "Operation Failed",
        "message": "Would you like to retry?",
        "variant": "error",
        "onConfirm": [
          { "id": "retry", "kind": "apiCall", "params": {...} }
        ]
      }
    }
  ]
}
```

#### 3. Retry Logic

Actions support automatic retry with exponential backoff:

```json
{
  "id": "flaky-api-call",
  "kind": "apiCall",
  "params": {...},
  "retry": {
    "attempts": 3,
    "delay": 1000,
    "backoff": "exponential"
  }
}
```

#### 4. Error Recovery Patterns

**Pattern 1: Fallback Values**
```json
{
  "id": "fetch-with-fallback",
  "kind": "apiCall",
  "params": {...},
  "onError": [
    {
      "id": "use-fallback",
      "kind": "setState",
      "params": {
        "path": "data",
        "value": []
      }
    }
  ]
}
```

**Pattern 2: Rollback**
```json
{
  "id": "safe-update",
  "kind": "sequence",
  "params": {
    "actions": [
      { "id": "backup", "kind": "setState", "params": { "path": "backup", "value": "{{pageState.data}}" } },
      { "id": "update", "kind": "apiCall", "params": {...} }
    ]
  },
  "onError": [
    {
      "id": "rollback",
      "kind": "setState",
      "params": {
        "path": "data",
        "value": "{{pageState.backup}}"
      }
    }
  ]
}
```

**Pattern 3: User Notification**
```json
{
  "id": "operation-with-feedback",
  "kind": "executeAction",
  "params": {...},
  "onError": [
    {
      "id": "show-error-details",
      "kind": "showToast",
      "params": {
        "message": "Error: {{error.message}}",
        "variant": "error",
        "duration": 10000,
        "action": {
          "label": "Contact Support",
          "actionId": "open-support-modal"
        }
      }
    }
  ]
}
```

---

## Security Considerations

### 1. Authentication

- **All API actions** include authentication tokens automatically
- **executeAction** validates user session before execution
- **Token expiration** triggers automatic re-authentication

### 2. Authorization

- **Backend is authoritative** - frontend checks are UX only
- **Permission checks** occur server-side for all actions
- **UI gating** hides unauthorized actions but doesn't prevent them

### 3. Input Validation

- **Client-side validation** provides immediate feedback
- **Server-side validation** is always performed and authoritative
- **Template injection** - all parameters are sanitized before execution

### 4. CSRF Protection

- **API calls** include CSRF tokens automatically
- **executeAction** validates request origin
- **State-changing operations** require valid session

### 5. XSS Prevention

- **User input** is sanitized before display
- **Template interpolation** escapes HTML by default
- **URL navigation** validates and sanitizes external URLs

### 6. Rate Limiting

- **Action execution** may be rate-limited per user/tenant
- **Backend enforces** rate limits on sensitive operations
- **Client respects** retry-after headers

### 7. Audit Trail

- **All actions** can be logged for audit purposes
- **executeAction** creates audit records by default
- **Sensitive operations** require additional logging

### Action-Specific Security

| Action | Security Consideration |
|--------|------------------------|
| `apiCall` | Validate URL, sanitize headers, check CORS |
| `executeAction` | Backend authorizes, audit log required |
| `navigate` | Validate URLs, prevent phishing redirects |
| `openModal` | Validate modal config, prevent injection |
| `uploadFile` | File type validation, size limits, virus scanning |
| `downloadFile` | Authorize file access, prevent path traversal |
| `setState` | Validate state paths, prevent prototype pollution |
| `showDialog` | Sanitize message content, escape HTML |

---

## Testing Strategy

### Unit Testing

Test each action handler independently:

```typescript
describe('navigate action', () => {
  it('should navigate to the specified route', () => {
    const action = {
      id: 'nav-test',
      kind: 'navigate',
      params: { to: '/users' }
    };
    executeAction(action, context);
    expect(mockRouter.navigate).toHaveBeenCalledWith('/users');
  });

  it('should interpolate route parameters', () => {
    const action = {
      id: 'nav-test',
      kind: 'navigate',
      params: { to: '/users/{{routeParams.id}}' }
    };
    const context = { routeParams: { id: '123' } };
    executeAction(action, context);
    expect(mockRouter.navigate).toHaveBeenCalledWith('/users/123');
  });

  it('should handle navigation errors', () => {
    mockRouter.navigate.mockRejectedValue(new Error('Invalid route'));
    const action = { id: 'nav-test', kind: 'navigate', params: { to: '/invalid' } };
    executeAction(action, context);
    expect(mockToast.error).toHaveBeenCalled();
  });
});
```

### Integration Testing

Test action chaining and composition:

```typescript
describe('action chaining', () => {
  it('should execute sequential actions', async () => {
    const action = {
      id: 'chain-test',
      kind: 'sequence',
      params: {
        actions: [
          { id: 'a1', kind: 'setState', params: { path: 'step', value: 1 } },
          { id: 'a2', kind: 'setState', params: { path: 'step', value: 2 } }
        ]
      }
    };
    await executeAction(action, context);
    expect(context.pageState.step).toBe(2);
  });

  it('should handle errors in chains', async () => {
    const action = {
      id: 'chain-test',
      kind: 'sequence',
      params: {
        actions: [
          { id: 'a1', kind: 'apiCall', params: { url: '/fail' } },
          { id: 'a2', kind: 'setState', params: { path: 'step', value: 2 } }
        ]
      }
    };
    mockApi.get.mockRejectedValue(new Error('API Error'));
    await executeAction(action, context);
    expect(context.pageState.step).toBeUndefined();
  });
});
```

### End-to-End Testing

Test complete user workflows:

```typescript
describe('user profile update workflow', () => {
  it('should update profile and show success message', async () => {
    // 1. Load page
    await page.goto('/profile');
    
    // 2. Fill form
    await page.fill('#name-input', 'John Doe');
    await page.fill('#email-input', 'john@example.com');
    
    // 3. Submit form (triggers actions)
    await page.click('#save-button');
    
    // 4. Wait for API call
    await page.waitForResponse(resp => resp.url().includes('/api/users'));
    
    // 5. Verify success toast
    await expect(page.locator('.toast-success')).toContainText('Profile updated');
    
    // 6. Verify navigation
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Test Coverage Requirements

- **Unit Tests:** 100% coverage of action handlers
- **Integration Tests:** All chaining patterns tested
- **Error Cases:** All error paths tested
- **Security Tests:** Authorization and validation tested
- **Performance Tests:** Action execution time benchmarks

---

## Summary

This action catalog defines **15 standard actions** organized into 10 categories:

1. **Navigation** (3): navigate, goBack, reload
2. **API** (2): apiCall, executeAction
3. **State Management** (3): setState, resetState, mergeState
4. **UI Feedback** (3): showToast, showDialog, closeDialog
5. **Form** (3): submitForm, validateForm, resetForm
6. **Data** (2): refreshDatasource, invalidateCache
7. **Modal Management** (2): openModal, closeModal
8. **File Operations** (2): downloadFile, uploadFile
9. **Utilities** (3): log, delay, conditional
10. **Bulk Operations** (3): sequence, parallel, forEach

All actions follow a consistent structure with:
- ✅ Parameter schemas defined
- ✅ Return values specified
- ✅ Side effects documented
- ✅ Error handling defined
- ✅ Security considerations addressed
- ✅ Usage examples provided
- ✅ Testing strategy outlined

**Next Steps:**
1. Validate schema compatibility with Issue #002 (Configuration Schema)
2. Begin implementation in Issue #020 (Action Engine Framework)
3. Implement core actions in Issue #021 (Core Actions Implementation)
4. Create reference implementation and tests

---

**Document Status:** ✅ Complete  
**Version:** 1.0  
**Dependencies:** Issue #002 (Configuration Schema) ✅  
**Ready for:** Issue #020 (Action Engine Implementation)
