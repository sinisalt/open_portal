# Widget Registry System

**Version:** 1.0  
**Last Updated:** January 23, 2026  
**Status:** Complete

## Overview

The Widget Registry System is the foundation of OpenPortal's configuration-driven UI platform. It provides dynamic widget lookup, type-safe registration, error handling, and rendering capabilities that enable the entire platform to work from JSON configurations.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Widget Registry System                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Registry   │  │    Error     │  │   Renderer   │      │
│  │              │  │  Boundaries  │  │              │      │
│  │ - Register   │  │ - Catch      │  │ - Lookup     │      │
│  │ - Lookup     │  │ - Display    │  │ - Render     │      │
│  │ - Validate   │  │ - Debug      │  │ - Policy     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Widget Types & Interfaces                │   │
│  │  - WidgetProps, WidgetConfig, WidgetBindings, etc.   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Widget Registry (`src/core/registry/WidgetRegistry.ts`)

The central registry that maps widget type strings to React components.

**Features:**
- Type-safe registration and retrieval
- Widget metadata (category, schema, version)
- Development mode warnings
- Widget categorization
- Lazy loading support
- JSON schema validation
- Registry statistics

**API:**

```typescript
import { widgetRegistry } from '@/core/registry/WidgetRegistry';

// Register a widget
widgetRegistry.register('TextInput', TextInputWidget, {
  displayName: 'Text Input',
  category: 'form',
  description: 'Single-line text input',
  version: '1.0.0',
  lazy: false,
});

// Get a widget
const Widget = widgetRegistry.get('TextInput');

// Check if widget exists
if (widgetRegistry.has('TextInput')) {
  // ...
}

// Get all widget types
const types = widgetRegistry.getTypes();
// ['TextInput', 'Button', 'Card', ...]

// Get widgets by category
const formWidgets = widgetRegistry.getByCategory('form');

// Get registry statistics
const stats = widgetRegistry.getStats();
// { totalWidgets: 12, categories: { form: 4, layout: 4, ... }, lazyWidgets: 1 }

// Validate widget configuration
const errors = widgetRegistry.validate('TextInput', config);
if (errors.length > 0) {
  console.error('Invalid configuration:', errors);
}
```

### 2. Error Boundaries (`src/core/widgets/WidgetErrorBoundary.tsx`)

React error boundaries that catch and display widget rendering errors.

**Features:**
- Isolated error handling per widget
- User-friendly error messages
- Development mode debugging
- Unknown widget handling
- Custom fallback components
- Error reporting callbacks

**Components:**

```typescript
import {
  WidgetErrorBoundary,
  UnknownWidgetError,
} from '@/core/widgets/WidgetErrorBoundary';

// Wrap widgets in error boundaries
<WidgetErrorBoundary
  widgetType="TextInput"
  widgetId="email-field"
  onError={(error, errorInfo) => logError(error)}
>
  <TextInputWidget config={config} />
</WidgetErrorBoundary>

// Unknown widget display
<UnknownWidgetError
  type="CustomWidget"
  id="custom-1"
  availableTypes={widgetRegistry.getTypes()}
/>
```

### 3. Widget Renderer (`src/core/renderer/WidgetRenderer.tsx`)

Dynamic widget renderer that looks up and renders widgets from configuration.

**Features:**
- Configuration-driven rendering
- Visibility policy enforcement
- Loading states with Suspense
- Error boundary wrapping
- Nested widget support
- List rendering with wrappers

**Components:**

```typescript
import {
  WidgetRenderer,
  WidgetListRenderer,
  NestedWidgetRenderer,
} from '@/core/renderer/WidgetRenderer';

// Render single widget
<WidgetRenderer
  config={{
    id: 'email',
    type: 'TextInput',
    props: { label: 'Email', required: true },
  }}
  bindings={{ value: email, error: emailError }}
  events={{ onChange: setEmail }}
/>

// Render list of widgets
<WidgetListRenderer
  configs={[
    { id: 'firstName', type: 'TextInput' },
    { id: 'lastName', type: 'TextInput' },
  ]}
  bindings={{
    firstName: { value: firstName },
    lastName: { value: lastName },
  }}
  events={{
    firstName: { onChange: setFirstName },
    lastName: { onChange: setLastName },
  }}
/>

// Render nested widgets (for container widgets)
<NestedWidgetRenderer
  configs={config.children}
  bindings={childBindings}
  events={childEvents}
/>
```

### 4. Widget Types (`src/types/widget.types.ts`)

Comprehensive TypeScript type definitions for the widget system.

**Key Types:**

```typescript
// Widget component props
interface WidgetProps<TConfig extends BaseWidgetConfig> {
  config: TConfig;
  bindings?: WidgetBindings;
  events?: WidgetEvents;
  children?: ReactNode;
}

// Widget bindings (data connections)
interface WidgetBindings {
  value?: unknown;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  [key: string]: unknown;
}

// Widget events
interface WidgetEvents {
  onChange?: (value: unknown) => void;
  onClick?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
  [key: string]: ((value?: unknown) => void) | undefined;
}

// Widget component type
type WidgetComponent<TConfig extends BaseWidgetConfig> =
  ComponentType<WidgetProps<TConfig>>;

// Widget definition (in registry)
interface WidgetDefinition {
  type: string;
  component: WidgetComponent;
  metadata?: WidgetMetadata;
}
```

## Usage Guide

### Step 1: Register Widgets

Create a widget registration file (`src/widgets/index.ts`):

```typescript
import { widgetRegistry } from '@/core/registry/WidgetRegistry';
import { TextInputWidget } from './TextInputWidget';
import { SelectWidget } from './SelectWidget';
import { CheckboxWidget } from './CheckboxWidget';

export function registerWidgets(): void {
  // Layout widgets
  widgetRegistry.register('Page', PageWidget, {
    category: 'layout',
    displayName: 'Page',
  });

  // Form widgets
  widgetRegistry.register('TextInput', TextInputWidget, {
    category: 'form',
    displayName: 'Text Input',
  });

  widgetRegistry.register('Select', SelectWidget, {
    category: 'form',
    displayName: 'Select',
  });

  // Lazy-loaded widgets
  widgetRegistry.register(
    'Chart',
    lazy(() => import('./ChartWidget')),
    { category: 'data', lazy: true }
  );
}
```

Call `registerWidgets()` during app initialization:

```typescript
import { registerWidgets } from '@/widgets';

// In main.tsx or App.tsx
registerWidgets();
```

### Step 2: Create Widget Components

Widgets follow a standard contract:

```typescript
import type { WidgetProps } from '@/types/widget.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TextInputConfig extends BaseWidgetConfig {
  type: 'TextInput';
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function TextInputWidget({
  config,
  bindings,
  events,
}: WidgetProps<TextInputConfig>) {
  const { id, label, placeholder, required, disabled } = config;
  const value = bindings?.value ?? '';
  const error = bindings?.error;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Input
        id={id}
        value={value as string}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={(e) => events?.onChange?.(e.target.value)}
        onBlur={() => events?.onBlur?.()}
        className={error ? 'border-destructive' : ''}
      />
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
```

### Step 3: Use Dynamic Rendering

Render widgets from backend configurations:

```typescript
import { WidgetRenderer } from '@/core/renderer/WidgetRenderer';
import { usePageConfig } from '@/hooks/usePageConfig';

function DynamicPage({ pageId }: { pageId: string }) {
  const { config, loading, error } = usePageConfig(pageId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="page">
      {config.widgets.map((widgetConfig) => (
        <WidgetRenderer
          key={widgetConfig.id}
          config={widgetConfig}
          bindings={getWidgetBindings(widgetConfig.id)}
          events={getWidgetEvents(widgetConfig.id)}
        />
      ))}
    </div>
  );
}
```

## Error Handling

### Widget Rendering Errors

Errors in widget rendering are caught by error boundaries:

```typescript
<WidgetErrorBoundary
  widgetType="TextInput"
  widgetId="email"
  onError={(error, errorInfo) => {
    // Log to monitoring service
    logError(error, { widgetType: 'TextInput', widgetId: 'email' });
  }}
>
  <TextInputWidget config={config} />
</WidgetErrorBoundary>
```

**Development Mode:**
- Shows full error messages
- Displays stack traces
- Shows component stack
- Lists available widget types

**Production Mode:**
- Shows user-friendly messages
- Hides technical details
- Suggests contacting support

### Unknown Widget Types

When a widget type is not found in the registry:

```typescript
<UnknownWidgetError
  type="CustomWidget"
  id="widget-1"
  availableTypes={widgetRegistry.getTypes()}
/>
```

**Development Mode:**
- Shows all available widget types
- Suggests similar widget types
- Provides registration instructions

**Production Mode:**
- Shows simple error message
- Logs error for monitoring

## Visibility Policies

Widgets support visibility policies from configuration:

```typescript
// Hidden by policy
{
  id: 'admin-panel',
  type: 'Panel',
  policy: {
    hide: true,
    // or
    show: false,
  }
}

// Conditional visibility
{
  id: 'premium-feature',
  type: 'FeaturePanel',
  policy: {
    show: 'user.isPremium === true',
    permissions: ['premium.view'],
  }
}
```

The renderer automatically handles visibility:

```typescript
<WidgetRenderer config={config} />
// Widget won't render if policy.hide === true or policy.show === false
```

## Lazy Loading

Heavy widgets can be lazy-loaded to reduce bundle size:

```typescript
import { lazy } from 'react';

// Register with lazy flag
const ChartWidget = lazy(() => import('./ChartWidget'));
widgetRegistry.register('Chart', ChartWidget, {
  lazy: true,
});

// Renderer automatically handles Suspense
<WidgetRenderer
  config={{ id: 'chart-1', type: 'Chart' }}
/>
// Shows loading spinner while widget loads
```

## Development Tools

### Registry Introspection

```typescript
// Get all widgets
const all = widgetRegistry.getAll();

// Get widgets by category
const formWidgets = widgetRegistry.getByCategory('form');

// Get categories
const categories = widgetRegistry.getCategories();
// ['form', 'layout', 'data', 'feedback']

// Get statistics
const stats = widgetRegistry.getStats();
// {
//   totalWidgets: 12,
//   categories: { form: 4, layout: 4, data: 2, feedback: 2 },
//   lazyWidgets: 1
// }
```

### Widget Validation

```typescript
// Validate against schema
const errors = widgetRegistry.validate('TextInput', {
  id: 'email',
  type: 'TextInput',
  // Missing required 'label' field
});

if (errors.length > 0) {
  console.error('Configuration errors:', errors);
  // ['Required field "label" is missing']
}
```

### Debug Logging

In development mode, the registry logs all operations:

```
[WidgetRegistry] Registered widget: TextInput (category: form)
[WidgetRegistry] Registered widget: Button (category: form)
[WidgetRegistry] Registered widget: Card (category: layout)

[WidgetRenderer] Rendering widget "TextInput" (id: email)
[WidgetRenderer] Widget "admin-panel" (id: admin-1) is hidden by policy
```

## Best Practices

### 1. Widget Registration

**Do:**
- Register all widgets at app initialization
- Use descriptive display names
- Assign appropriate categories
- Provide JSON schemas for validation
- Mark heavy widgets as lazy

**Don't:**
- Register widgets multiple times (causes warnings)
- Use generic category names
- Skip metadata for production widgets

### 2. Widget Implementation

**Do:**
- Follow the WidgetProps interface
- Handle undefined bindings gracefully
- Check for optional event handlers before calling
- Use shadcn/ui components as base
- Implement proper accessibility

**Don't:**
- Make direct API calls in widgets
- Store internal state (use bindings instead)
- Hardcode business logic
- Break backward compatibility

### 3. Error Handling

**Do:**
- Wrap widgets in error boundaries
- Provide fallback components
- Log errors to monitoring
- Show user-friendly messages

**Don't:**
- Let widget errors crash the page
- Show technical details to end users
- Ignore unknown widget types

### 4. Performance

**Do:**
- Use lazy loading for heavy widgets
- Memoize expensive computations
- Optimize re-renders with React.memo
- Profile widget rendering performance

**Don't:**
- Load all widgets upfront
- Create unnecessary re-renders
- Perform heavy computations in render

## Testing

### Registry Tests

```typescript
import { widgetRegistry } from '@/core/registry/WidgetRegistry';

describe('WidgetRegistry', () => {
  beforeEach(() => {
    widgetRegistry.clear();
  });

  it('should register and retrieve widget', () => {
    widgetRegistry.register('TestWidget', TestWidget);
    
    expect(widgetRegistry.has('TestWidget')).toBe(true);
    expect(widgetRegistry.get('TestWidget')).toBe(TestWidget);
  });
});
```

### Widget Tests

```typescript
import { render, screen } from '@testing-library/react';
import { TextInputWidget } from './TextInputWidget';

describe('TextInputWidget', () => {
  it('should render with label', () => {
    render(
      <TextInputWidget
        config={{ id: 'email', type: 'TextInput', label: 'Email' }}
      />
    );
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should call onChange event', () => {
    const onChange = jest.fn();
    
    render(
      <TextInputWidget
        config={{ id: 'email', type: 'TextInput', label: 'Email' }}
        events={{ onChange }}
      />
    );
    
    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(onChange).toHaveBeenCalledWith('test@example.com');
  });
});
```

### Renderer Tests

```typescript
import { render, screen } from '@testing-library/react';
import { WidgetRenderer } from '@/core/renderer/WidgetRenderer';
import { widgetRegistry } from '@/core/registry/WidgetRegistry';

describe('WidgetRenderer', () => {
  beforeEach(() => {
    widgetRegistry.clear();
    widgetRegistry.register('TestWidget', TestWidget);
  });

  it('should render widget from config', () => {
    render(
      <WidgetRenderer
        config={{ id: 'test-1', type: 'TestWidget' }}
      />
    );
    
    expect(screen.getByTestId('test-1')).toBeInTheDocument();
  });

  it('should show error for unknown widget', () => {
    render(
      <WidgetRenderer
        config={{ id: 'test-1', type: 'UnknownWidget' }}
      />
    );
    
    expect(screen.getByText('Unknown Widget Type')).toBeInTheDocument();
  });
});
```

## Migration Guide

### From Custom Components to Widgets

**Before:**
```typescript
function MyPage() {
  return (
    <div>
      <TextInput label="Name" value={name} onChange={setName} />
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
```

**After:**
```typescript
function MyPage() {
  const { config } = usePageConfig('my-page');
  
  return (
    <div>
      {config.widgets.map((widgetConfig) => (
        <WidgetRenderer
          key={widgetConfig.id}
          config={widgetConfig}
          bindings={getBindings(widgetConfig.id)}
          events={getEvents(widgetConfig.id)}
        />
      ))}
    </div>
  );
}
```

## Performance Considerations

### Bundle Size

- Registry: ~6KB
- Error Boundary: ~7KB
- Renderer: ~6KB
- Types: 0KB (type definitions only)
- **Total:** ~19KB

### Runtime Performance

- Widget lookup: O(1) (Map lookup)
- Registration: O(1)
- Validation: O(n) where n = number of required fields
- Rendering: Comparable to direct component usage

### Memory Usage

- Registry stores widget definitions in memory
- Minimal overhead per widget (~200 bytes)
- Lazy-loaded widgets not counted until loaded

## Troubleshooting

### Widget Not Found

**Problem:** `[WidgetRegistry] Widget type "CustomWidget" not found`

**Solution:**
1. Check widget is registered: `widgetRegistry.has('CustomWidget')`
2. Verify registration happens before rendering
3. Check for typos in widget type string
4. View available types: `widgetRegistry.getTypes()`

### Widget Rendering Error

**Problem:** Error boundary shows widget error

**Solution:**
1. Check browser console for stack trace (dev mode)
2. Verify widget props match interface
3. Check for missing required bindings
4. Test widget in isolation

### Lazy Loading Not Working

**Problem:** Lazy widget loads immediately

**Solution:**
1. Verify `lazy: true` in registration metadata
2. Check widget is wrapped in `React.lazy()`
3. Ensure Suspense boundary exists
4. Verify import() is used

## Future Enhancements

### Planned Features

1. **Widget Marketplace**
   - Community-contributed widgets
   - Widget versioning and updates
   - Dependency management

2. **Visual Editor**
   - Drag-and-drop widget builder
   - Live configuration preview
   - Widget property editor

3. **Advanced Validation**
   - Full JSON schema support
   - Custom validation rules
   - Cross-field validation

4. **Performance Monitoring**
   - Widget render time tracking
   - Bundle size analysis
   - Memory profiling

5. **DevTools Integration**
   - Widget inspector panel
   - Configuration debugger
   - Performance profiler

## References

- [Widget Architecture](./WIDGET-ARCHITECTURE.md)
- [Widget Component Mapping](./WIDGET-COMPONENT-MAPPING.md)
- [Widget Catalog](./widget-catalog.md)
- [API Specification](./api-specification.md)
- [ADR-012: Technology Stack Revision](./adr/ADR-012-technology-stack-revision.md)

## Support

For questions or issues:
- Review documentation in `/documentation/`
- Check widget examples in `/src/widgets/`
- Consult test files for usage patterns
- Contact project maintainers

---

**Version:** 1.0  
**Last Updated:** January 23, 2026  
**Status:** Production Ready ✅
