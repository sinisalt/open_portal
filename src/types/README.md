# Types Directory

This directory contains **TypeScript type definitions and interfaces** used throughout the application.

## Purpose

The types directory provides:

- **Type Safety**: Centralized type definitions for TypeScript
- **Documentation**: Self-documenting code through types
- **Autocomplete**: Better IDE support and IntelliSense
- **Contract Definition**: Clear interfaces for components and services

## Type Categories

### Widget Types

- `widget.types.ts` - Widget configuration interfaces
- `widgetProps.types.ts` - Widget component prop interfaces

### Configuration Types

- `config.types.ts` - Page and widget configuration schemas
- `datasource.types.ts` - Datasource configuration types
- `action.types.ts` - Action and event types
- `policy.types.ts` - Policy and validation types

### API Types

- `api.types.ts` - API request/response types
- `user.types.ts` - User and authentication types
- `content.types.ts` - Content and CMS types

### Component Types

- `component.types.ts` - Generic component prop types
- `form.types.ts` - Form and input types

### Utility Types

- `common.types.ts` - Common utility types
- `helpers.types.ts` - Type helper utilities

## Type Definition Pattern

```typescript
// widget.types.ts

/**
 * Base widget configuration interface
 */
export interface WidgetConfig {
  /** Unique widget identifier */
  id: string;

  /** Widget type (e.g., 'TextInput', 'Button') */
  type: string;

  /** Widget-specific properties */
  props: Record<string, any>;

  /** Data bindings */
  bindings?: WidgetBindings;

  /** Event handlers */
  events?: WidgetEvents;

  /** Visibility and permission policies */
  policies?: WidgetPolicies;

  /** Child widgets (for containers) */
  children?: WidgetConfig[];
}

/**
 * Data binding configuration
 */
export interface WidgetBindings {
  /** Datasource ID */
  datasource: string;

  /** Field to bind to */
  field?: string;

  /** Transform function */
  transform?: string;
}

/**
 * Event handler configuration
 */
export interface WidgetEvents {
  /** Event name (e.g., 'onClick', 'onChange') */
  [eventName: string]: ActionConfig;
}

/**
 * Action configuration
 */
export interface ActionConfig {
  /** Action type */
  type: 'api' | 'navigate' | 'validate' | 'custom';

  /** Action-specific parameters */
  params: Record<string, any>;
}
```

## Type Guidelines

1. **Documentation**: Add JSDoc comments for all types
2. **Naming**: Use descriptive names (PascalCase for types)
3. **Specificity**: Prefer specific types over `any`
4. **Reusability**: Create generic types for common patterns
5. **Exports**: Export all public types
6. **Imports**: Import types from other files as needed

## Common Type Patterns

### Generic Types

```typescript
// common.types.ts

/** Generic API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

/** Generic pagination metadata */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Generic loading state */
export interface LoadingState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
```

### Discriminated Unions

```typescript
// action.types.ts

export type Action =
  | { type: 'api'; endpoint: string; method: string }
  | { type: 'navigate'; path: string }
  | { type: 'validate'; rules: ValidationRule[] }
  | { type: 'custom'; handler: string };
```

### Utility Types

```typescript
// helpers.types.ts

/** Make all properties optional recursively */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Pick properties of type */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};
```

## File Structure

```
types/
├── widget.types.ts
├── widgetProps.types.ts
├── config.types.ts
├── datasource.types.ts
├── action.types.ts
├── policy.types.ts
├── api.types.ts
├── user.types.ts
├── content.types.ts
├── component.types.ts
├── form.types.ts
├── common.types.ts
├── helpers.types.ts
├── index.ts
└── README.md
```

## Index File

Use an `index.ts` file to re-export all types:

```typescript
// index.ts
export * from './widget.types';
export * from './config.types';
export * from './api.types';
// ... other exports
```

This allows importing from a single location:

```typescript
import { WidgetConfig, ApiResponse } from '@/types';
```

## TypeScript Configuration

The types directory works with `jsconfig.json` (for JavaScript projects) or `tsconfig.json` (for TypeScript projects) to provide type checking and IntelliSense.

## JSDoc for JavaScript

For JavaScript projects, use JSDoc comments to leverage TypeScript types:

```javascript
/**
 * @typedef {import('./types').WidgetConfig} WidgetConfig
 */

/**
 * Render a widget
 * @param {WidgetConfig} config - Widget configuration
 * @returns {React.ReactElement}
 */
function renderWidget(config) {
  // Implementation
}
```

## Best Practices

1. **Single Source of Truth**: Define types once, import everywhere
2. **Avoid `any`**: Use `unknown` or specific types instead
3. **Readonly**: Use `readonly` for immutable properties
4. **Optional vs Required**: Be explicit about optional properties
5. **Type Guards**: Create type guard functions for runtime checks
6. **Documentation**: Document complex types with examples

## Type Guards

```typescript
// Type guard example
export function isWidgetConfig(value: unknown): value is WidgetConfig {
  return typeof value === 'object' && value !== null && 'id' in value && 'type' in value;
}
```

## Dependencies

- `typescript` - Type checking (dev dependency)
- May reference types from `@types/*` packages
