# Issue #021: Core Actions Implementation

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 7-8  
**Component:** Frontend  
**Estimated Effort:** 5 days  
**Priority:** High  
**Labels:** phase-1, frontend, actions

## Description
Implement the core action types (apiCall, navigate, setState, showToast, executeAction) that provide basic interactivity for the MVP.

## Acceptance Criteria

### apiCall Action
- [ ] HTTP request execution
- [ ] Method support (GET, POST, PUT, DELETE, PATCH)
- [ ] URL parameter interpolation
- [ ] Request body support
- [ ] Headers configuration
- [ ] Query parameters
- [ ] Response handling
- [ ] Error handling
- [ ] Loading state integration

### navigate Action
- [ ] Route navigation
- [ ] Parameter passing
- [ ] Query string support
- [ ] Replace vs push history
- [ ] External URL handling
- [ ] Back navigation

### setState Action
- [ ] Page state updates
- [ ] Merge strategy
- [ ] Replace strategy
- [ ] Nested state updates
- [ ] State validation

### showToast Action
- [ ] Success toast
- [ ] Error toast
- [ ] Warning toast
- [ ] Info toast
- [ ] Custom message
- [ ] Duration configuration
- [ ] Action button support

### executeAction Action (Backend Gateway)
- [ ] Call backend action endpoint
- [ ] Action ID passing
- [ ] Parameters passing
- [ ] Response handling
- [ ] Server-side validation
- [ ] Permission checking
- [ ] Error handling

## Action Implementations

### apiCall
```typescript
{
  type: "apiCall",
  params: {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: any;
    headers?: Record<string, string>;
    queryParams?: Record<string, any>;
  },
  onSuccess?: ActionConfig;
  onError?: ActionConfig;
}
```

### navigate
```typescript
{
  type: "navigate",
  params: {
    path: string;
    params?: Record<string, any>;
    query?: Record<string, any>;
    replace?: boolean;
    external?: boolean;
  }
}
```

### setState
```typescript
{
  type: "setState",
  params: {
    path?: string; // State path (e.g., "user.name")
    value: any;
    merge?: boolean; // Default: true
  }
}
```

### showToast
```typescript
{
  type: "showToast",
  params: {
    message: string;
    variant: "success" | "error" | "warning" | "info";
    duration?: number;
    action?: {
      label: string;
      actionId: string;
    };
  }
}
```

### executeAction
```typescript
{
  type: "executeAction",
  params: {
    actionId: string;
    params?: Record<string, any>;
  },
  onSuccess?: ActionConfig;
  onError?: ActionConfig;
}
```

## Dependencies
- Depends on: #020 (Action engine framework)
- Depends on: #019 (Toast widget)
- Depends on: #013 (Route resolver)

## Technical Notes
- Use axios or fetch for API calls
- Implement request cancellation
- Support parameter interpolation from context
- Cache GET requests where appropriate
- Handle CORS issues
- Support file uploads (multipart/form-data)

## Parameter Interpolation
Support dynamic parameters using template syntax:
```typescript
{
  url: "/api/users/{{routeParams.id}}",
  body: {
    name: "{{formData.name}}",
    email: "{{formData.email}}"
  }
}
```

## Error Handling
- [ ] Network errors
- [ ] Timeout errors
- [ ] Validation errors (4xx)
- [ ] Server errors (5xx)
- [ ] Custom error messages
- [ ] Error toast display

## Testing Requirements
- [ ] Unit tests for each action
- [ ] Test parameter interpolation
- [ ] Test error scenarios
- [ ] Test success scenarios
- [ ] Integration tests with action engine
- [ ] Test chaining with other actions

## Documentation
- [ ] Action reference documentation
- [ ] Usage examples for each action
- [ ] Parameter interpolation guide
- [ ] Error handling patterns
- [ ] Common action combinations

## Deliverables
- apiCall action handler
- navigate action handler
- setState action handler
- showToast action handler
- executeAction action handler
- Tests
- Documentation
