# OpenPortal Widget Architecture

**Version:** 1.0  
**Last Updated:** January 20, 2026  
**Status:** Active

## Overview

OpenPortal's widget system is built on a **3-layer architecture** that combines industry-standard accessible components (Radix UI), styled UI components (shadcn/ui), and configuration-driven widget wrappers. This architecture enables dynamic rendering from JSON configurations while maintaining accessibility, type safety, and developer experience.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Widget Registry (Dynamic Rendering)              │
│  - Maps widget type strings to React components            │
│  - Enables rendering from JSON configurations               │
│  - Handles unknown widget types gracefully                  │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: OpenPortal Widgets (Configuration Contracts)     │
│  - Wraps shadcn components with config, bindings, events   │
│  - Implements stable widget contracts                       │
│  - Handles visibility, permissions, validation              │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: shadcn/ui Components (Styled Components)         │
│  - Tailwind-styled components                               │
│  - Customizable (we own the code after installation)        │
│  - Consistent design system                                 │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Radix UI Primitives (Headless Components)        │
│  - Accessible by default (WCAG 2.1 AA)                      │
│  - Keyboard navigation, ARIA attributes                     │
│  - Focus management, screen reader support                  │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: Radix UI Primitives

**Purpose:** Headless, accessible UI primitives

**Responsibility:**
- Provide accessible components without styling
- Handle complex interactions (keyboard nav, focus, ARIA)
- Ensure WCAG 2.1 Level AA compliance
- Manage state for complex components (Select, DatePicker, Dialog)

**Examples:**
- `@radix-ui/react-label` - Accessible labels
- `@radix-ui/react-select` - Dropdown with keyboard navigation
- `@radix-ui/react-dialog` - Modal with focus trapping
- `@radix-ui/react-checkbox` - Accessible checkbox
- `@radix-ui/react-popover` - Popover positioning

**Why Radix:**
- ✅ Accessibility built-in (saves weeks of work)
- ✅ Battle-tested (used by GitHub, Vercel, Linear)
- ✅ Unstyled (full design control)
- ✅ Composable (build complex widgets)

**Installation:**
Radix primitives are installed automatically when shadcn components are added:
```bash
npx shadcn@latest add input
# Automatically installs @radix-ui/react-label
```

## Layer 2: shadcn/ui Components

**Purpose:** Styled, opinionated UI components built on Radix

**Responsibility:**
- Provide Tailwind-styled components
- Implement consistent design system
- Offer reasonable defaults
- Copy-paste into codebase (we own the code)

**Examples:**
```typescript
// Input component (wraps Radix Label)
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

```typescript
// Button component (standalone)
import { Button } from '@/components/ui/button'

<Button variant="default" size="lg">Click me</Button>
```

```typescript
// Card component (layout)
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**Why shadcn:**
- ✅ **Not a library**: Copy-paste, we own the code
- ✅ **No npm dependency**: No version lock-in
- ✅ **Fully customizable**: Edit components as needed
- ✅ **Tailwind-first**: Integrates with our styling system
- ✅ **CLI-based**: Easy installation and updates

**Installation:**
```bash
# Install specific components as needed
npx shadcn@latest add input
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add select
```

**Installed Components** (as of Phase 0.5):
- `input` - Text input with label
- `button` - Button with variants
- `card` - Card layout
- `label` - Form label

**Future Components** (installed as widgets are built):
- `select` - Dropdown selection
- `checkbox` - Checkbox with label
- `calendar` - Date picker calendar
- `dialog` - Modal dialog
- `table` - Data table
- `toast` - Notifications

## Layer 3: OpenPortal Widgets

**Purpose:** Configuration-driven wrappers around shadcn components

**Responsibility:**
- Implement stable widget contracts (config, bindings, events)
- Handle visibility and permissions
- Integrate with OpenPortal configuration system
- Provide consistent API across all widgets

**Widget Contract:**
```typescript
interface WidgetProps<TConfig extends WidgetConfig = WidgetConfig> {
  config: TConfig      // Widget configuration from backend
  bindings?: WidgetBindings  // Data bindings (e.g., value)
  events?: WidgetEvents      // Event handlers (e.g., onChange)
}
```

**Example: TextInputWidget**
```typescript
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WidgetProps } from '@/types/widget'

interface TextInputWidgetConfig extends WidgetConfig {
  type: 'TextInput'
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  inputType?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number'
}

export function TextInputWidget({ config, bindings, events }: WidgetProps<TextInputWidgetConfig>) {
  const { id, label, placeholder, required, disabled, inputType = 'text' } = config
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
        onChange={(e) => events?.onChange?.(e.target.value)}
        onBlur={() => events?.onBlur?.()}
        className={error ? 'border-destructive' : ''}
        aria-invalid={!!error}
      />
      
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

**Widget Configuration Example:**
```json
{
  "id": "user-email",
  "type": "TextInput",
  "label": "Email Address",
  "placeholder": "you@example.com",
  "required": true,
  "inputType": "email",
  "visible": true,
  "permissions": {
    "view": ["all"],
    "edit": ["user", "admin"]
  }
}
```

## Layer 4: Widget Registry

**Purpose:** Dynamic widget lookup and rendering

**Responsibility:**
- Map widget type strings to React components
- Enable configuration-driven rendering
- Handle unknown widget types gracefully
- Provide widget discovery

**Implementation:**
```typescript
// Widget Registry (Singleton)
class WidgetRegistry {
  private widgets: Map<string, WidgetComponent> = new Map()

  register(type: string, component: WidgetComponent): void {
    this.widgets.set(type, component)
  }

  get(type: string): WidgetComponent | undefined {
    return this.widgets.get(type)
  }

  has(type: string): boolean {
    return this.widgets.has(type)
  }

  getTypes(): string[] {
    return Array.from(this.widgets.keys())
  }
}

export const widgetRegistry = new WidgetRegistry()
```

**Widget Registration:**
```typescript
// src/widgets/index.ts
import { widgetRegistry } from '@/core/registry/WidgetRegistry'
import { TextInputWidget } from './TextInputWidget'
import { SelectWidget } from './SelectWidget'
import { CheckboxWidget } from './CheckboxWidget'

export function registerWidgets(): void {
  widgetRegistry.register('TextInput', TextInputWidget)
  widgetRegistry.register('Select', SelectWidget)
  widgetRegistry.register('Checkbox', CheckboxWidget)
  // ... more widgets
}
```

**Widget Renderer:**
```typescript
// Dynamic rendering from configuration
interface WidgetRendererProps {
  config: WidgetConfig
  bindings?: WidgetBindings
  events?: WidgetEvents
}

export function WidgetRenderer({ config, bindings, events }: WidgetRendererProps) {
  // Handle visibility
  if (config.visible === false) {
    return null
  }

  // Get widget component
  const WidgetComponent = widgetRegistry.get(config.type)

  if (!WidgetComponent) {
    return <UnknownWidgetError type={config.type} />
  }

  // Render widget
  return <WidgetComponent config={config} bindings={bindings} events={events} />
}
```

**Usage:**
```typescript
// Backend provides configuration
const config = {
  id: 'user-email',
  type: 'TextInput',
  label: 'Email Address',
  required: true,
}

// Frontend renders dynamically
<WidgetRenderer 
  config={config} 
  bindings={{ value: email }} 
  events={{ onChange: setEmail }} 
/>
```

## Data Flow

### Configuration → Rendering

```
1. Backend API returns page configuration
   ↓
2. Frontend fetches configuration
   ↓
3. Configuration parser validates JSON
   ↓
4. WidgetRenderer receives config
   ↓
5. Registry looks up widget component
   ↓
6. Widget component renders with shadcn components
   ↓
7. Radix UI handles accessibility and interactions
   ↓
8. User interacts (events triggered)
   ↓
9. Events bubble up to application logic
   ↓
10. Bindings update (re-render)
```

### Event Flow

```
User types in input
  ↓
Radix Input component fires onChange
  ↓
shadcn Input passes event to widget
  ↓
TextInputWidget calls events.onChange(value)
  ↓
Parent component updates state
  ↓
New bindings.value passed to widget
  ↓
Widget re-renders with new value
```

## Benefits of This Architecture

### 1. Accessibility by Default
- Radix UI ensures WCAG 2.1 AA compliance
- No need to manually implement ARIA attributes
- Keyboard navigation and screen reader support built-in

### 2. Fast Development
- shadcn provides pre-built styled components
- Widgets wrap shadcn with minimal additional code
- 2-3 hours per widget vs 2-3 days building from scratch

### 3. Full Customization
- shadcn components are copied into codebase (we own them)
- Can modify any component as needed
- No npm version lock-in or breaking changes

### 4. Type Safety
- TypeScript interfaces for all widget configs
- Compile-time error checking
- IntelliSense and autocomplete

### 5. Configuration-Driven
- Widgets render from JSON configurations
- Backend controls all UI structure
- Frontend never hardcodes business logic

### 6. Testability
- Each layer can be tested independently
- Widgets have stable contracts (easy to mock)
- Registry pattern enables widget swapping

### 7. Maintainability
- Clear separation of concerns
- Radix handles hard accessibility problems
- shadcn provides design consistency
- Widgets focus on configuration contracts only

## Widget Development Workflow

### Step 1: Identify shadcn Components Needed
Check `documentation/WIDGET-COMPONENT-MAPPING.md` for component mapping.

Example: SelectWidget needs `select`, `popover`, `command` components.

### Step 2: Install shadcn Components
```bash
npx shadcn@latest add select
npx shadcn@latest add popover
npx shadcn@latest add command
```

This installs:
- `src/components/ui/select.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/command.tsx`

### Step 3: Create Widget Configuration Type
```typescript
// src/widgets/SelectWidget/types.ts
import { WidgetConfig } from '@/types/widget'

export interface SelectWidgetConfig extends WidgetConfig {
  type: 'Select'
  label: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  searchable?: boolean
  required?: boolean
  disabled?: boolean
}
```

### Step 4: Implement Widget Component
```typescript
// src/widgets/SelectWidget/SelectWidget.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { WidgetProps } from '@/types/widget'
import { SelectWidgetConfig } from './types'

export function SelectWidget({ config, bindings, events }: WidgetProps<SelectWidgetConfig>) {
  const { id, label, options, placeholder, required, disabled } = config
  const value = bindings?.value ?? ''

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Select
        value={value}
        onValueChange={(value) => events?.onChange?.(value)}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

### Step 5: Create Widget Tests
```typescript
// src/widgets/SelectWidget/SelectWidget.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectWidget } from './SelectWidget'

describe('SelectWidget', () => {
  const config = {
    id: 'country',
    type: 'Select' as const,
    label: 'Country',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
    ],
  }

  it('renders label and select', () => {
    render(<SelectWidget config={config} />)
    expect(screen.getByText('Country')).toBeInTheDocument()
  })

  it('displays selected value', () => {
    render(<SelectWidget config={config} bindings={{ value: 'us' }} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('United States')
  })

  it('calls onChange when selection changes', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    
    render(<SelectWidget config={config} events={{ onChange }} />)
    
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('United Kingdom'))
    
    expect(onChange).toHaveBeenCalledWith('uk')
  })
})
```

### Step 6: Register Widget
```typescript
// src/widgets/index.ts
import { SelectWidget } from './SelectWidget'

export function registerWidgets(): void {
  // ... existing registrations
  widgetRegistry.register('Select', SelectWidget)
}
```

### Step 7: Document Widget
Add to `documentation/widget-catalog.md` with configuration examples, props, and usage.

## File Structure

```
src/
├── components/
│   └── ui/                           # shadcn components (Layer 2)
│       ├── input.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── select.tsx
│       └── ...
├── widgets/                          # OpenPortal widgets (Layer 3)
│   ├── index.ts                      # Widget registration
│   ├── TextInputWidget/
│   │   ├── TextInputWidget.tsx
│   │   ├── TextInputWidget.test.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   ├── SelectWidget/
│   │   ├── SelectWidget.tsx
│   │   ├── SelectWidget.test.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   └── ...
├── core/
│   ├── registry/
│   │   ├── WidgetRegistry.ts        # Widget registry (Layer 4)
│   │   └── WidgetRegistry.test.ts
│   └── renderer/
│       └── WidgetRenderer.tsx       # Dynamic rendering
└── types/
    └── widget.ts                     # Widget type definitions
```

## Performance Considerations

### Code Splitting
Widgets can be lazy-loaded:
```typescript
const TextInputWidget = lazy(() => import('./widgets/TextInputWidget'))
```

### Bundle Size
- Only shadcn components you install are included
- Radix primitives are tree-shakeable
- Widgets add minimal overhead (~1-2KB each)

### Rendering Performance
- React memo for expensive widgets
- Widget registry lookup is O(1)
- Configuration parsing cached

## Security Considerations

### Configuration Validation
- Validate all configurations against JSON schemas
- Sanitize user inputs
- Don't eval() configuration strings

### Permission Checking
- Widget visibility based on permissions
- Backend enforces actual permissions
- Frontend hides UI only (not security boundary)

### XSS Prevention
- React escapes strings automatically
- Use dangerouslySetInnerHTML only when necessary
- Sanitize HTML content from backend

## Future Enhancements

### Phase 2: Advanced Features
- Conditional visibility expressions
- Computed/derived fields
- Cross-field validation
- Dynamic widget generation

### Phase 3: Custom Widgets
- Allow tenants to define custom widgets
- Widget marketplace
- Widget versioning

### Phase 4: Visual Editor
- Drag-and-drop widget builder
- Live preview
- Configuration validation UI

## References

- [Radix UI Documentation](https://www.radix-ui.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Widget Catalog](./widget-catalog.md)
- [Widget Component Mapping](./WIDGET-COMPONENT-MAPPING.md)
- [ADR-012: Technology Stack Revision](./adr/ADR-012-technology-stack-revision.md)

---

**Version:** 1.0  
**Last Updated:** January 20, 2026  
**Status:** Active
