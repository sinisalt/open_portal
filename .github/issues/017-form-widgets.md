# Issue #017: Form Input Widgets (TextInput, Select, DatePicker, Checkbox)

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 5-7  
**Component:** Frontend  
**Estimated Effort:** 3-4 days  
**Priority:** High  
**Labels:** phase-1, frontend, widgets, forms

**Updated:** January 23, 2026 - Aligned with shadcn/ui approach (ADR-012)

## Description
Implement core form input widgets (TextInput, Select, DatePicker, Checkbox) with validation, accessibility, and proper state management for the MVP.

**Implementation Approach:**
- **TextInput:** Already implemented in ISSUE-014, may need enhancements
- **Select:** Uses shadcn `select` (simple) or `command` + `popover` (searchable)
- **DatePicker:** Uses shadcn `calendar` + `popover` + `button` + date-fns
- **Checkbox:** Uses shadcn `checkbox`

All widgets wrap shadcn/ui components built on Radix UI primitives. Accessibility (ARIA, keyboard navigation, screen reader support) is handled automatically by Radix.

See `WIDGET-COMPONENT-MAPPING.md` for detailed component mapping and installation commands.

## Acceptance Criteria

### TextInput Widget
- [ ] Single-line text input
- [ ] Label and placeholder support
- [ ] Help text display
- [ ] Multiple types (text, email, url, tel, search)
- [ ] Max length enforcement
- [ ] Disabled and readonly states
- [ ] Required field indicator
- [ ] Auto focus support
- [ ] Icon support (start/end)
- [ ] Error state and message display
- [ ] onChange, onBlur, onFocus, onEnter events

### Select Widget
- [ ] Dropdown selection
- [ ] Label and placeholder
- [ ] Options array with value/label
- [ ] Disabled options support
- [ ] Required field support
- [ ] Searchable variant
- [ ] Clearable option
- [ ] Option icons
- [ ] Error state display
- [ ] onChange, onSearch events

### DatePicker Widget
- [ ] Calendar date selection
- [ ] Date format configuration
- [ ] Min/max date constraints
- [ ] Disabled state
- [ ] Required field support
- [ ] Show time option (datetime picker)
- [ ] Keyboard navigation
- [ ] Error state display
- [ ] onChange event

### Checkbox Widget
- [ ] Single checkbox input
- [ ] Label support
- [ ] Help text
- [ ] Disabled state
- [ ] Required field support
- [ ] Indeterminate state
- [ ] Error state display
- [ ] onChange event

## Widget Props Schemas

### TextInput
```typescript
{
  label?: string;
  placeholder?: string;
  helpText?: string;
  type?: "text" | "email" | "url" | "tel" | "search";
  maxLength?: number;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  icon?: string;
  iconPosition?: "start" | "end";
  error?: string;
  value: string;
  onChange: (value: string) => void;
}
```

### Select
```typescript
{
  label?: string;
  placeholder?: string;
  helpText?: string;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
    icon?: string;
  }>;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  error?: string;
  value: string | number;
  onChange: (value: string | number) => void;
}
```

### DatePicker
```typescript
{
  label?: string;
  placeholder?: string;
  helpText?: string;
  format?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  required?: boolean;
  showTime?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}
```

### Checkbox
```typescript
{
  label?: string;
  helpText?: string;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
  error?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}
```

## Dependencies
- Depends on: #015 (Widget registry)
- Depends on: #012 (Branding/theming)
- Depends on: #014 (TextInputWidget POC - starting point)
- References: WIDGET-COMPONENT-MAPPING.md (component mapping)

## shadcn Component Installation

```bash
# TextInput - already installed in ISSUE-014
# npx shadcn@latest add input
# npx shadcn@latest add label

# Select widget
npx shadcn@latest add select
npx shadcn@latest add command  # For searchable variant
npx shadcn@latest add popover  # For searchable variant
npx shadcn@latest add label

# DatePicker widget
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add button
npm install date-fns

# Checkbox widget
npx shadcn@latest add checkbox
npx shadcn@latest add label
```

## Technical Notes
- **TextInput:** Extend ISSUE-014 implementation with additional types (email, tel, url, number)
- **Select (Simple):** Wrap shadcn `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- **Select (Searchable):** Use shadcn `Command`, `CommandInput`, `CommandList`, `CommandItem` in `Popover`
- **DatePicker:** Wrap shadcn `Calendar` component with `Popover` and `Button` trigger, use date-fns for formatting
- **Checkbox:** Wrap shadcn `Checkbox` component with `Label`
- All components use controlled component pattern (value + onChange)
- Validation integrated with form state (see ISSUE-022)
- Accessibility (ARIA, keyboard nav, focus) handled by Radix UI primitives
- Error states styled with Tailwind (`border-destructive`, `text-destructive`)

## Validation Support
- [ ] Client-side validation rules
- [ ] Real-time validation
- [ ] Validation on blur
- [ ] Custom validation messages
- [ ] Required field validation
- [ ] Format validation (email, url, etc.)

## Accessibility Requirements
- [ ] Proper label association (handled by shadcn Label)
- [ ] ARIA attributes (handled by Radix primitives)
- [ ] Keyboard navigation (handled by Radix primitives)
- [ ] Focus indicators (Tailwind focus-visible styles)
- [ ] Error announcements (aria-invalid, role="alert")
- [ ] Required field indicators (visual asterisk + aria-required)
- [ ] Help text association (aria-describedby)

**Note:** Radix UI (Layer 1) handles complex accessibility patterns automatically:
- `@radix-ui/react-select` - Keyboard navigation, ARIA select pattern
- `@radix-ui/react-popover` - Focus trap, keyboard dismiss
- `@radix-ui/react-checkbox` - ARIA checkbox pattern, keyboard toggle
- `@radix-ui/react-label` - Proper label-input association

## Testing Requirements
- [ ] Unit tests for each widget
- [ ] Test all prop combinations
- [ ] Test validation behavior
- [ ] Test keyboard interaction
- [ ] Test accessibility
- [ ] Snapshot tests
- [ ] Integration with forms

## Documentation
- [ ] Widget API documentation
- [ ] Usage examples
- [ ] Validation patterns
- [ ] Accessibility guide
- [ ] Styling customization

## Deliverables
- TextInput widget (extend ISSUE-014 implementation)
- Select widget (simple + searchable variants)
- DatePicker widget
- Checkbox widget
- Tests (following ISSUE-014 test patterns)
- Documentation (usage examples, configuration)

## Implementation Example

**SelectWidget using shadcn:**
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { WidgetProps } from '@/types/widget'

interface SelectWidgetConfig extends WidgetConfig {
  type: 'Select'
  label: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function SelectWidget({ config, bindings, events }: WidgetProps<SelectWidgetConfig>) {
  const { id, label, options, placeholder, required, disabled } = config
  const value = bindings?.value ?? ''
  const error = bindings?.error

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
        <SelectTrigger id={id} className={error ? 'border-destructive' : ''}>
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
      
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

## References
- **ISSUE-014:** TextInputWidget POC implementation (starting point)
- **WIDGET-COMPONENT-MAPPING.md:** Component mappings, complexity estimates, installation commands
- **WIDGET-ARCHITECTURE.md:** 3-layer architecture patterns
- **shadcn/ui Components:** [Select](https://ui.shadcn.com/docs/components/select), [Calendar](https://ui.shadcn.com/docs/components/calendar), [Checkbox](https://ui.shadcn.com/docs/components/checkbox)
