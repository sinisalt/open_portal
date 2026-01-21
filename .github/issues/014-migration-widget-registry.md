# Issue #014: Migration - Widget Registry + TextInputWidget POC

**Phase:** Phase 0.5 - Technology Stack Migration  
**Component:** Frontend Widget System  
**Estimated Effort:** 4 days  
**Priority:** High  
**Labels:** phase-0.5, frontend, migration, widgets, widget-registry

## Description
Implement the widget registry system and create TextInputWidget as a proof-of-concept, demonstrating the 3-layer architecture (Radix → shadcn → OpenPortal Widget → Registry). This validates the widget pattern before Phase 1.3 widget implementation.

## Context
OpenPortal's core principle is configuration-driven UI. The widget registry maps widget type strings to React components, enabling dynamic rendering from JSON configurations. TextInputWidget wraps shadcn's Input component with OpenPortal's configuration contract (config, bindings, events), proving the architecture works.

## Acceptance Criteria
- [ ] Widget registry implemented (`WidgetRegistry.ts`)
- [ ] Widget type definitions created (`WidgetTypes.ts`)
- [ ] TextInputWidget implemented using shadcn Input
- [ ] Widget rendered from JSON configuration
- [ ] Bindings system working (data connections)
- [ ] Events system working (onChange, onBlur, etc.)
- [ ] Policy support (visibility, permissions)
- [ ] Widget configuration validated
- [ ] Example page using TextInputWidget
- [ ] Tests for widget registry
- [ ] Tests for TextInputWidget
- [ ] Documentation updated

## Dependencies
- Depends on: ISSUE-010 (Vite + TypeScript)
- Depends on: ISSUE-011 (shadcn/ui setup)
- Depends on: ISSUE-012 (TanStack Router)
- Depends on: ISSUE-013 (shadcn components installed)
- Blocks: Phase 1.3 (Form Widgets)

## Architecture Overview

### 3-Layer Widget Architecture
```
1. Radix UI Primitive (headless, accessible)
   ↓
2. shadcn/ui Component (styled, opinionated)
   ↓
3. OpenPortal Widget (configuration contract)
   ↓
4. Widget Registry (dynamic rendering)
```

**Example:**
```
@radix-ui/react-label (primitive)
  → shadcn Input + Label (styled)
    → TextInputWidget (config contract)
      → WidgetRegistry['TextInput'] (dynamic render)
```

## Implementation Steps

### Step 1: Create Widget Type Definitions
Create `src/types/widget.ts`:
```typescript
/**
 * Base configuration for all widgets
 */
export interface WidgetConfig {
  id: string
  type: string
  visible?: boolean | string // boolean or expression
  permissions?: {
    view?: string[]
    edit?: string[]
  }
}

/**
 * Data bindings for widget
 */
export interface WidgetBindings {
  value?: any
  [key: string]: any
}

/**
 * Event handlers for widget
 */
export interface WidgetEvents {
  onChange?: (value: any) => void
  onBlur?: () => void
  onFocus?: () => void
  onClick?: () => void
  [key: string]: any
}

/**
 * Base props for all widgets
 */
export interface WidgetProps<TConfig extends WidgetConfig = WidgetConfig> {
  config: TConfig
  bindings?: WidgetBindings
  events?: WidgetEvents
}

/**
 * Widget component type
 */
export type WidgetComponent<TConfig extends WidgetConfig = WidgetConfig> = 
  React.ComponentType<WidgetProps<TConfig>>
```

### Step 2: Create Widget Registry
Create `src/core/registry/WidgetRegistry.ts`:
```typescript
import { WidgetComponent, WidgetConfig } from '@/types/widget'

/**
 * Registry of all available widgets
 */
class WidgetRegistry {
  private widgets: Map<string, WidgetComponent> = new Map()

  /**
   * Register a widget type
   */
  register(type: string, component: WidgetComponent): void {
    if (this.widgets.has(type)) {
      console.warn(`Widget type "${type}" is already registered. Overwriting.`)
    }
    this.widgets.set(type, component)
  }

  /**
   * Get a widget component by type
   */
  get(type: string): WidgetComponent | undefined {
    return this.widgets.get(type)
  }

  /**
   * Check if a widget type is registered
   */
  has(type: string): boolean {
    return this.widgets.has(type)
  }

  /**
   * Get all registered widget types
   */
  getTypes(): string[] {
    return Array.from(this.widgets.keys())
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.widgets.clear()
  }
}

// Singleton instance
export const widgetRegistry = new WidgetRegistry()

// Export for testing
export { WidgetRegistry }
```

### Step 3: Create Widget Renderer
Create `src/core/renderer/WidgetRenderer.tsx`:
```typescript
import { widgetRegistry } from '@/core/registry/WidgetRegistry'
import { WidgetConfig, WidgetBindings, WidgetEvents } from '@/types/widget'

interface WidgetRendererProps {
  config: WidgetConfig
  bindings?: WidgetBindings
  events?: WidgetEvents
}

export function WidgetRenderer({ config, bindings, events }: WidgetRendererProps) {
  // Check visibility
  if (config.visible === false) {
    return null
  }

  // Get widget component
  const WidgetComponent = widgetRegistry.get(config.type)

  if (!WidgetComponent) {
    console.error(`Widget type "${config.type}" not found in registry`)
    return (
      <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
        <p className="text-sm text-destructive-foreground">
          Unknown widget type: <strong>{config.type}</strong>
        </p>
      </div>
    )
  }

  // Render widget
  return <WidgetComponent config={config} bindings={bindings} events={events} />
}
```

### Step 4: Create TextInputWidget Configuration Type
Create `src/widgets/TextInputWidget/types.ts`:
```typescript
import { WidgetConfig } from '@/types/widget'

export interface TextInputWidgetConfig extends WidgetConfig {
  type: 'TextInput'
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  maxLength?: number
  pattern?: string
  helperText?: string
  inputType?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number'
}
```

### Step 5: Implement TextInputWidget
Create `src/widgets/TextInputWidget/TextInputWidget.tsx`:
```typescript
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WidgetProps } from '@/types/widget'
import { TextInputWidgetConfig } from './types'

export function TextInputWidget({ config, bindings, events }: WidgetProps<TextInputWidgetConfig>) {
  const {
    id,
    label,
    placeholder,
    required = false,
    disabled = false,
    readOnly = false,
    maxLength,
    pattern,
    helperText,
    inputType = 'text',
  } = config

  const value = bindings?.value ?? ''
  const error = bindings?.error

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Input
        id={id}
        type={inputType}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        pattern={pattern}
        onChange={(e) => events?.onChange?.(e.target.value)}
        onBlur={() => events?.onBlur?.()}
        onFocus={() => events?.onFocus?.()}
        className={error ? 'border-destructive' : ''}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
      />
      
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  )
}
```

Create `src/widgets/TextInputWidget/index.ts`:
```typescript
export { TextInputWidget } from './TextInputWidget'
export type { TextInputWidgetConfig } from './types'
```

### Step 6: Register TextInputWidget
Create `src/widgets/index.ts`:
```typescript
import { widgetRegistry } from '@/core/registry/WidgetRegistry'
import { TextInputWidget } from './TextInputWidget'

/**
 * Register all widgets
 * Call this once at application startup
 */
export function registerWidgets(): void {
  widgetRegistry.register('TextInput', TextInputWidget)
  
  // Future widgets will be registered here:
  // widgetRegistry.register('Select', SelectWidget)
  // widgetRegistry.register('DatePicker', DatePickerWidget)
  // etc.
}
```

### Step 7: Initialize Registry in Main
Update `src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AuthProvider } from '@/components/AuthProvider'
import { registerWidgets } from '@/widgets'
import './index.css'

import { routeTree } from './routeTree.gen'

// Register all widgets
registerWidgets()

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

### Step 8: Create Example Page Using Widget
Create `src/routes/widget-demo.tsx`:
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { WidgetRenderer } from '@/core/renderer/WidgetRenderer'
import { TextInputWidgetConfig } from '@/widgets/TextInputWidget'

export const Route = createFileRoute('/widget-demo')({
  component: WidgetDemoPage,
})

function WidgetDemoPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const emailConfig: TextInputWidgetConfig = {
    id: 'email',
    type: 'TextInput',
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: true,
    inputType: 'email',
    helperText: 'We\'ll never share your email',
  }

  const nameConfig: TextInputWidgetConfig = {
    id: 'name',
    type: 'TextInput',
    label: 'Full Name',
    placeholder: 'John Doe',
    required: true,
    maxLength: 100,
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Widget Demo</h1>
      
      <div className="space-y-6">
        <WidgetRenderer
          config={nameConfig}
          bindings={{ value: name }}
          events={{ onChange: setName }}
        />
        
        <WidgetRenderer
          config={emailConfig}
          bindings={{ value: email }}
          events={{ onChange: setEmail }}
        />
        
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">State:</h3>
          <pre className="text-sm">
            {JSON.stringify({ name, email }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
```

### Step 9: Create Widget Tests
Create `src/widgets/TextInputWidget/TextInputWidget.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextInputWidget } from './TextInputWidget'
import { TextInputWidgetConfig } from './types'

describe('TextInputWidget', () => {
  const baseConfig: TextInputWidgetConfig = {
    id: 'test-input',
    type: 'TextInput',
    label: 'Test Input',
  }

  it('renders label and input', () => {
    render(<TextInputWidget config={baseConfig} />)
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument()
  })

  it('displays value from bindings', () => {
    render(
      <TextInputWidget
        config={baseConfig}
        bindings={{ value: 'test value' }}
      />
    )
    expect(screen.getByLabelText('Test Input')).toHaveValue('test value')
  })

  it('calls onChange event', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    
    render(
      <TextInputWidget
        config={baseConfig}
        events={{ onChange }}
      />
    )
    
    const input = screen.getByLabelText('Test Input')
    await user.type(input, 'hello')
    
    expect(onChange).toHaveBeenCalledWith('hello')
  })

  it('shows required indicator', () => {
    render(
      <TextInputWidget
        config={{ ...baseConfig, required: true }}
      />
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(
      <TextInputWidget
        config={baseConfig}
        bindings={{ error: 'This field is required' }}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
  })

  it('displays helper text', () => {
    render(
      <TextInputWidget
        config={{ ...baseConfig, helperText: 'Enter your email' }}
      />
    )
    expect(screen.getByText('Enter your email')).toBeInTheDocument()
  })
})
```

Create `src/core/registry/WidgetRegistry.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { WidgetRegistry } from './WidgetRegistry'

describe('WidgetRegistry', () => {
  let registry: WidgetRegistry

  beforeEach(() => {
    registry = new WidgetRegistry()
  })

  it('registers a widget', () => {
    const MockWidget = () => null
    registry.register('Mock', MockWidget)
    expect(registry.has('Mock')).toBe(true)
  })

  it('retrieves a registered widget', () => {
    const MockWidget = () => null
    registry.register('Mock', MockWidget)
    expect(registry.get('Mock')).toBe(MockWidget)
  })

  it('returns undefined for unregistered widget', () => {
    expect(registry.get('Unknown')).toBeUndefined()
  })

  it('lists all registered types', () => {
    const MockWidget1 = () => null
    const MockWidget2 = () => null
    registry.register('Mock1', MockWidget1)
    registry.register('Mock2', MockWidget2)
    expect(registry.getTypes()).toEqual(['Mock1', 'Mock2'])
  })

  it('clears all registrations', () => {
    const MockWidget = () => null
    registry.register('Mock', MockWidget)
    registry.clear()
    expect(registry.has('Mock')).toBe(false)
  })
})
```

## File Structure After Implementation
```
src/
├── core/
│   ├── registry/
│   │   ├── WidgetRegistry.ts
│   │   └── WidgetRegistry.test.ts
│   └── renderer/
│       └── WidgetRenderer.tsx
├── types/
│   └── widget.ts
├── widgets/
│   ├── index.ts                    # Widget registration
│   └── TextInputWidget/
│       ├── TextInputWidget.tsx
│       ├── TextInputWidget.test.tsx
│       ├── types.ts
│       └── index.ts
└── routes/
    └── widget-demo.tsx             # Demo page
```

## Testing Requirements
- [ ] Widget registry tests pass
- [ ] TextInputWidget tests pass
- [ ] Widget renders from configuration
- [ ] Bindings update widget state
- [ ] Events trigger callbacks
- [ ] Unknown widget shows error message
- [ ] Accessibility tests pass (ARIA attributes)
- [ ] Test coverage >80%

## Configuration Example
```typescript
// JSON configuration (from backend API)
const config = {
  id: 'user-email',
  type: 'TextInput',
  label: 'Email Address',
  placeholder: 'you@example.com',
  required: true,
  inputType: 'email',
  visible: true,
  permissions: {
    view: ['all'],
    edit: ['user', 'admin'],
  },
}

// Runtime rendering
<WidgetRenderer config={config} bindings={{ value: email }} events={{ onChange: setEmail }} />
```

## Widget Contract Validation
This POC validates:
- ✅ Configuration-driven rendering
- ✅ Stable widget interface (config, bindings, events)
- ✅ Dynamic widget lookup (registry pattern)
- ✅ shadcn component wrapping
- ✅ Type safety (TypeScript)
- ✅ Accessibility (ARIA attributes)
- ✅ Testability (unit tests)

## Documentation
- [ ] Create `documentation/WIDGET-ARCHITECTURE.md`
- [ ] Create `documentation/WIDGET-COMPONENT-MAPPING.md`
- [ ] Update `.github/copilot-instructions.md` with widget patterns
- [ ] Document widget development guide

## Success Metrics
- Widget registry working
- TextInputWidget renders from config
- Bindings and events functional
- Tests passing with >80% coverage
- Demo page demonstrates widget usage
- Architecture validated for Phase 1.3

## Deliverables
- Widget registry implementation
- TextInputWidget POC
- Widget renderer
- Type definitions
- Tests
- Demo page
- Documentation

## Next Steps (Phase 1.3)
After this POC, Phase 1.3 will implement:
- SelectWidget
- CheckboxWidget
- DatePickerWidget
- Other form widgets from MVP list

## Notes
- This issue proves the architecture works
- TextInputWidget is the simplest widget (good starting point)
- Registry pattern enables dynamic rendering from backend configs
- 3-layer architecture (Radix → shadcn → OpenPortal → Registry) validated
- Future widgets follow this same pattern
