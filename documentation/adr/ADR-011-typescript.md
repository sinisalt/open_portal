# ADR-011: TypeScript Configuration

**Status:** Accepted  
**Date:** 2026-01-20  
**Deciders:** Development Team  
**Issue:** #004 - Technical Stack Finalization

## Context

OpenPortal is a configuration-driven platform where JSON configurations define page structure, widgets, actions, and data sources. Strong typing is critical for:
- Type safety for configuration contracts
- Catching errors at compile time
- Better developer experience (autocomplete, refactoring)
- Documentation through types
- Consistency across frontend and backend

We need to decide on TypeScript configuration, particularly the strictness level.

## Decision

**We will use TypeScript with strict mode enabled.**

TypeScript configuration:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "outDir": "./build",
    "rootDir": "./src",
    "removeComments": true,
    "noEmit": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    
    // Strict Type-Checking Options
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "build", "dist"]
}
```

## Alternatives Considered

### Option 1: TypeScript Strict Mode - SELECTED ✅

**Pros:**
- ✅ **Maximum type safety**: Catches most type errors at compile time
- ✅ **Better DX**: Excellent autocomplete and refactoring support
- ✅ **Fewer runtime errors**: Many errors caught during development
- ✅ **Self-documenting code**: Types serve as inline documentation
- ✅ **Refactoring confidence**: Changes don't break things silently
- ✅ **Team consistency**: Enforced coding standards

**Cons:**
- ❌ **Steeper learning curve**: Developers need TypeScript knowledge
- ❌ **More boilerplate**: Need to define types and interfaces
- ❌ **Slower initial development**: Type definitions take time
- ❌ **Some type gymnastics**: Complex types can be verbose

**Why Selected:**
- Configuration contracts require strong typing
- Type safety prevents bugs in configuration parsing
- Better developer experience with autocomplete
- Shared types between frontend and backend
- Team already has TypeScript experience

### Option 2: TypeScript Loose Mode

**Pros:**
- ✅ Easier migration from JavaScript
- ✅ Less strict, fewer errors
- ✅ Faster initial development

**Cons:**
- ❌ Less type safety
- ❌ More runtime errors
- ❌ Defeats purpose of TypeScript
- ❌ Configuration contracts not enforced

**Why Not Selected:**
- Loose mode doesn't provide sufficient type safety
- Configuration-driven architecture needs strong typing
- Worth the upfront investment in strict types

### Option 3: JavaScript with JSDoc

**Pros:**
- ✅ No build step needed
- ✅ Familiar to all developers
- ✅ Some type checking with JSDoc

**Cons:**
- ❌ Weaker type checking
- ❌ Verbose JSDoc comments
- ❌ Less tooling support
- ❌ No compile-time guarantees

**Why Not Selected:**
- Configuration contracts need strong typing
- TypeScript provides better DX
- JSDoc too verbose and less reliable

## Consequences

### Positive

1. **Type safety**: Configuration contracts enforced at compile time
2. **Better DX**: Autocomplete, IntelliSense, refactoring tools
3. **Fewer bugs**: Many errors caught during development
4. **Documentation**: Types serve as inline documentation
5. **Shared types**: Same types on frontend and backend
6. **Confidence**: Refactoring doesn't break things silently

### Negative

1. **Learning curve**: Team needs TypeScript knowledge
2. **Initial overhead**: Type definitions take time
3. **Verbosity**: Some types require boilerplate
4. **Build step**: TypeScript needs compilation

### Neutral

1. **Type inference**: TypeScript infers many types automatically
2. **Gradual typing**: Can use `any` when needed (though discouraged)
3. **Tooling**: Excellent editor support (VS Code, WebStorm)

## Implementation Details

### Core Type Definitions

#### Widget Configuration Types

```typescript
// Base widget configuration
interface WidgetConfig {
  id: string;
  type: string;
  props?: Record<string, any>;
  bindings?: WidgetBindings;
  events?: WidgetEvents;
  policy?: WidgetPolicy;
  children?: WidgetConfig[];
}

// Specific widget types
interface TextInputWidgetProps {
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel';
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  helperText?: string;
  maxLength?: number;
  pattern?: string;
}

interface TextInputWidgetConfig extends WidgetConfig {
  type: 'TextInput';
  props: TextInputWidgetProps;
}

// Union type for all widgets
type AnyWidgetConfig =
  | TextInputWidgetConfig
  | SelectWidgetConfig
  | DatePickerWidgetConfig
  | CheckboxWidgetConfig
  | TableWidgetConfig
  | KPIWidgetConfig
  | ModalWidgetConfig
  | ToastWidgetConfig
  | PageWidgetConfig
  | SectionWidgetConfig
  | GridWidgetConfig
  | CardWidgetConfig;
```

#### Page Configuration Types

```typescript
interface PageConfig {
  pageId: string;
  title: string;
  description?: string;
  layout?: LayoutConfig;
  widgets: WidgetConfig[];
  datasources?: DatasourceConfig[];
  actions?: ActionConfig[];
  events?: EventConfig[];
  meta?: PageMeta;
}

interface LayoutConfig {
  type: 'fixed' | 'fluid' | 'auto';
  maxWidth?: number;
  padding?: number;
  background?: string;
}

interface PageMeta {
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: string[];
}
```

#### Action Configuration Types

```typescript
type ActionKind =
  | 'navigate'
  | 'goBack'
  | 'reload'
  | 'apiCall'
  | 'executeAction'
  | 'setState'
  | 'resetState'
  | 'mergeState'
  | 'showToast'
  | 'showDialog'
  | 'closeDialog'
  | 'submitForm'
  | 'validateForm'
  | 'resetForm'
  | 'refreshDatasource'
  | 'invalidateCache'
  | 'openModal'
  | 'closeModal'
  | 'downloadFile'
  | 'uploadFile'
  | 'log'
  | 'delay'
  | 'conditional'
  | 'sequence'
  | 'parallel'
  | 'forEach';

interface ActionConfig {
  id: string;
  kind: ActionKind;
  params?: Record<string, any>;
  condition?: string;
  onSuccess?: ActionConfig[];
  onError?: ActionConfig[];
  loading?: boolean;
  timeout?: number;
  retry?: RetryPolicy;
}

interface RetryPolicy {
  attempts: number;
  delay: number;
  backoff?: 'linear' | 'exponential';
}

// Specific action types
interface NavigateActionParams {
  path: string;
  params?: Record<string, string>;
  replace?: boolean;
}

interface ApiCallActionParams {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  cache?: 'no-cache' | 'reload' | 'force-cache';
}

interface ShowToastActionParams {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}
```

#### Datasource Configuration Types

```typescript
type DatasourceKind = 'http' | 'websocket' | 'static' | 'computed' | 'localStorage';

interface DatasourceConfig {
  id: string;
  kind: DatasourceKind;
  fetchPolicy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
  refetchInterval?: number;
  http?: HttpDatasourceConfig;
  websocket?: WebSocketDatasourceConfig;
  static?: any;
  computed?: ComputedDatasourceConfig;
}

interface HttpDatasourceConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

interface WebSocketDatasourceConfig {
  url: string;
  channel: string;
  reconnect?: boolean;
  heartbeat?: number;
}

interface ComputedDatasourceConfig {
  expression: string;
  dependencies: string[];
}
```

### Type Guards

```typescript
// Type guard for widget types
export function isTextInputWidget(widget: WidgetConfig): widget is TextInputWidgetConfig {
  return widget.type === 'TextInput';
}

export function isTableWidget(widget: WidgetConfig): widget is TableWidgetConfig {
  return widget.type === 'Table';
}

// Type guard for action types
export function isNavigateAction(action: ActionConfig): action is ActionConfig & { params: NavigateActionParams } {
  return action.kind === 'navigate';
}

export function isApiCallAction(action: ActionConfig): action is ActionConfig & { params: ApiCallActionParams } {
  return action.kind === 'apiCall';
}
```

### Utility Types

```typescript
// Make all properties optional recursively
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Extract widget props by type
type WidgetProps<T extends string> = Extract<AnyWidgetConfig, { type: T }>['props'];

// Example usage
type TextInputProps = WidgetProps<'TextInput'>;

// Omit properties from type
type WidgetConfigWithoutId = Omit<WidgetConfig, 'id'>;

// Pick specific properties
type WidgetIdentity = Pick<WidgetConfig, 'id' | 'type'>;

// Make specific properties required
type RequiredWidgetConfig = Required<Pick<WidgetConfig, 'id' | 'type'>> & Partial<WidgetConfig>;
```

### Shared Types Package (Frontend + Backend)

Create a shared types package:

```bash
# Directory structure
/packages/types/
  package.json
  tsconfig.json
  src/
    index.ts
    widget.types.ts
    action.types.ts
    datasource.types.ts
    page.types.ts
    validation.types.ts
```

```typescript
// packages/types/src/index.ts
export * from './widget.types';
export * from './action.types';
export * from './datasource.types';
export * from './page.types';
export * from './validation.types';
```

```json
// packages/types/package.json
{
  "name": "@openportal/types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

Usage in frontend and backend:

```typescript
// Frontend
import { PageConfig, WidgetConfig, ActionConfig } from '@openportal/types';

// Backend
import { PageConfig, WidgetConfig, ActionConfig } from '@openportal/types';
```

### Type-Safe Configuration Parsing

```typescript
import { z } from 'zod';

// Zod schema for runtime validation
const WidgetConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.any()).optional(),
  bindings: z.any().optional(),
  events: z.any().optional(),
  policy: z.any().optional(),
  children: z.array(z.lazy(() => WidgetConfigSchema)).optional(),
});

// Parse and validate configuration
function parsePageConfig(data: unknown): PageConfig {
  const result = PageConfigSchema.parse(data);
  return result;
}

// Safe parsing with error handling
function safeParsePageConfig(data: unknown): { success: true; data: PageConfig } | { success: false; error: Error } {
  const result = PageConfigSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: new Error(result.error.message) };
  }
}
```

## Best Practices

### 1. Avoid `any` Type

```typescript
// ❌ Bad
function processWidget(widget: any) {
  return widget.type;
}

// ✅ Good
function processWidget(widget: WidgetConfig) {
  return widget.type;
}

// ✅ Also good (when type is truly unknown)
function processUnknown(data: unknown) {
  if (isWidgetConfig(data)) {
    return data.type;
  }
  throw new Error('Invalid widget config');
}
```

### 2. Use Explicit Return Types

```typescript
// ❌ Bad (inferred return type)
function getPageConfig(pageId: string) {
  return fetch(`/api/pages/${pageId}`).then(res => res.json());
}

// ✅ Good (explicit return type)
function getPageConfig(pageId: string): Promise<PageConfig> {
  return fetch(`/api/pages/${pageId}`).then(res => res.json());
}
```

### 3. Use Optional Chaining

```typescript
// ✅ Good
const title = pageConfig?.meta?.title ?? 'Untitled';
const firstWidget = pageConfig?.widgets?.[0];
```

### 4. Use Type Assertions Sparingly

```typescript
// ❌ Bad (type assertion without validation)
const widget = data as WidgetConfig;

// ✅ Good (type guard validation)
if (isWidgetConfig(data)) {
  const widget: WidgetConfig = data;
}
```

### 5. Leverage Union Types

```typescript
type ActionResult = 
  | { success: true; data: any }
  | { success: false; error: Error };

function executeAction(action: ActionConfig): ActionResult {
  try {
    const data = performAction(action);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

## ESLint TypeScript Configuration

```json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error"
  }
}
```

## Success Metrics

- Zero `any` types in configuration parsing code
- 100% type coverage in widget registry
- All API responses typed with Zod validation
- Shared types package used by frontend and backend
- No type-related bugs in production
- Positive developer feedback on type safety

## Review and Reevaluation

**Review Trigger**: End of Phase 1

**Reevaluate if:**
- Type complexity becomes unmanageable
- Development velocity significantly impacted
- Team requests loosening strict mode
- Type gymnastics outweigh benefits

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Zod Documentation](https://zod.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Last Updated:** January 20, 2026  
**Next Review:** End of Phase 1
