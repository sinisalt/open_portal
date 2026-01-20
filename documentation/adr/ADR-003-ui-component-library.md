# ADR-003: UI Component Library

**Status:** Superseded by ADR-012  
**Date:** 2026-01-20 (Original), 2026-01-20 (Revised)  
**Deciders:** Development Team  
**Issue:** #004 - Technical Stack Finalization  
**Superseded By:** ADR-012 - Technology Stack Revision

## ⚠️ REVISION NOTICE

**This ADR has been superseded by ADR-012 (Technology Stack Revision).**

**Original Decision (January 20, 2026):** Build custom widgets from scratch  
**Revised Decision (January 20, 2026):** Use shadcn/ui + Radix UI primitives

**Reason for Change:** After completing Phase 0, we recognized that building custom widgets from scratch would:
- Take 2-3 days per widget (vs 2-3 hours with shadcn)
- Require extensive accessibility work (Radix solves this)
- Create maintenance burden (we own all widget code)
- Delay Phase 1 completion significantly

**New Architecture (3 Layers):**
1. **Radix UI Primitives** - Headless, accessible components
2. **shadcn/ui Components** - Styled, Tailwind-based components (we own the code)
3. **OpenPortal Widgets** - Configuration-driven wrappers with stable contracts

**Why shadcn/ui:**
- ✅ Not a library (copy-paste, we own code after installation)
- ✅ No breaking changes (no npm dependency)
- ✅ Accessible by default (Radix UI handles WCAG 2.1 AA)
- ✅ Fast development (2-3 hours vs 2-3 days per widget)
- ✅ Fully customizable (Tailwind-based)
- ✅ Small bundle (~1-5KB per component)

**Migration:** See Phase 0.5 issues:
- ISSUE-011: Tailwind CSS + shadcn/ui setup
- ISSUE-013: First shadcn components (Input, Button, Card, Label)
- ISSUE-014: TextInputWidget POC using shadcn Input

**Full Rationale:** See ADR-012 for complete decision analysis.

**Documentation:**
- [Widget Architecture](../WIDGET-ARCHITECTURE.md) - 3-layer architecture details
- [Widget Component Mapping](../WIDGET-COMPONENT-MAPPING.md) - MVP widgets → shadcn components

---

## Original Context (Preserved for History)

**Note:** The following represents the original decision to build custom widgets. This decision was valid at the time but was revised after Phase 0 completion based on new insights about development velocity and accessibility requirements.

---

OpenPortal is a configuration-driven UI platform where all widgets are defined by JSON configurations from the backend. The frontend renders these widgets based on their type and configuration. We need to decide whether to use an existing UI component library or build a custom widget library from scratch.

### Key Requirements

1. **Stable contracts**: Widget props must remain stable over time
2. **Configuration-driven**: All widget behavior must be configurable via props
3. **Accessibility**: WCAG 2.1 Level AA compliance
4. **Customization**: Full control over widget appearance and behavior
5. **Bundle size**: Keep bundle size minimal
6. **Composition**: Widgets must be composable and nestable
7. **Type safety**: Strong TypeScript support

### Widgets Needed (MVP: 12 Core Widgets)

**Layout & Structure (4):** Page, Section, Grid, Card  
**Form Inputs (4):** TextInput, Select, DatePicker, Checkbox  
**Data Display (2):** Table, KPI  
**Dialogs & Feedback (2):** Modal, Toast

## Decision

**We will build a custom widget library from scratch.**

All widgets will be built as React components with:
- Stable, well-defined TypeScript interfaces
- Configuration-driven behavior
- Built-in accessibility features
- Comprehensive tests
- Documentation in widget-catalog.md

## Alternatives Considered

### Option 1: Custom Widget Library - SELECTED ✅

**Pros:**
- ✅ **Full control**: Complete control over widget contracts and behavior
- ✅ **Stable contracts**: We define the contracts, no breaking changes from external library
- ✅ **Minimal bundle**: Only includes widgets we need (~50-100KB for 12 widgets)
- ✅ **Configuration-driven**: Designed specifically for configuration-driven architecture
- ✅ **No external constraints**: Not limited by library design decisions
- ✅ **Learning**: Team learns component architecture deeply
- ✅ **Customization**: Full flexibility in styling and behavior
- ✅ **Documentation**: Widget catalog documents exact contracts

**Cons:**
- ❌ **Higher initial effort**: Need to build widgets from scratch
- ❌ **Maintenance burden**: We maintain all widget code
- ❌ **Slower initial development**: Takes time to build 12 widgets
- ❌ **Less battle-tested**: Our widgets not as mature as established libraries

**Why Selected:**
- Configuration-driven requirements need stable contracts
- External libraries have breaking changes that break our configurations
- Bundle size control is critical
- Need complete control over widget behavior
- Widget catalog already defines exact contracts
- Can use headless UI libraries for complex widgets (e.g., Radix UI)

### Option 2: Material-UI (MUI)

**Pros:**
- ✅ Popular and mature (>90k GitHub stars)
- ✅ Comprehensive component set
- ✅ Good accessibility support
- ✅ Excellent documentation
- ✅ Large ecosystem

**Cons:**
- ❌ **Heavy bundle**: ~300KB+ (before tree-shaking)
- ❌ **Opinionated design**: Material Design not configurable enough
- ❌ **Breaking changes**: Major version upgrades break APIs
- ❌ **Unnecessary features**: Many features we don't need
- ❌ **Configuration constraints**: Hard to map to our configuration model
- ❌ **Theming complexity**: CSS-in-JS approach adds runtime overhead

**Why Not Selected:**
- Bundle size too large
- Material Design doesn't fit all use cases
- Breaking changes would break stored configurations
- Too much functionality we don't need

### Option 3: Ant Design

**Pros:**
- ✅ Comprehensive component library
- ✅ Enterprise-focused design
- ✅ Good documentation
- ✅ TypeScript support

**Cons:**
- ❌ **Heavy bundle**: ~500KB+
- ❌ **Chinese design language**: May not fit all brands
- ❌ **Opinionated styling**: Less flexible than needed
- ❌ **Configuration mismatch**: Not designed for configuration-driven UIs
- ❌ **Breaking changes**: Version upgrades affect API

**Why Not Selected:**
- Bundle size too large
- Design language not flexible enough
- Breaking changes risk

### Option 4: Chakra UI

**Pros:**
- ✅ Good developer experience
- ✅ Accessibility built-in
- ✅ Themeable
- ✅ Composable components
- ✅ Smaller than MUI (~150KB)

**Cons:**
- ❌ **Still heavy**: 150KB+ for features we may not need
- ❌ **Abstraction layer**: Adds layer over our configuration model
- ❌ **Breaking changes**: Version upgrades affect stored configs
- ❌ **Styling approach**: CSS-in-JS adds runtime overhead

**Why Not Selected:**
- Still adds unnecessary bundle weight
- Abstraction doesn't fit configuration-driven model
- Breaking changes risk

### Option 5: Headless UI (Radix UI, Headless UI)

**Pros:**
- ✅ Unstyled, accessible components
- ✅ Small bundle (~20-30KB)
- ✅ Full styling control
- ✅ Accessibility built-in
- ✅ Stable APIs

**Cons:**
- ❌ **Still need to build on top**: Need to add styling and config layer
- ❌ **Limited components**: Only provides complex interactive widgets

**Why Not Selected as Primary:**
- Still need to build most widgets ourselves
- **But**: We can use headless UI for complex widgets (Select, DatePicker, Modal)

## Consequences

### Positive

1. **Full control**: Complete control over widget contracts and behavior
2. **Stable contracts**: No breaking changes from external libraries
3. **Minimal bundle**: Only includes widgets we need (~50-100KB for 12 widgets)
4. **Configuration-optimized**: Widgets designed for configuration-driven architecture
5. **Customization**: Full flexibility in styling and behavior
6. **Team learning**: Team gains deep understanding of component architecture
7. **Documentation**: Widget catalog provides exact contracts

### Negative

1. **Higher initial effort**: Need to build 12 widgets from scratch
2. **Maintenance burden**: Team responsible for maintaining all widget code
3. **Slower initial progress**: Takes time to build and test widgets
4. **Less mature**: Our widgets less battle-tested than established libraries
5. **Accessibility effort**: Need to ensure WCAG 2.1 Level AA compliance

### Neutral

1. **Hybrid approach possible**: Can use headless UI libraries for complex widgets
2. **Incremental development**: Build widgets incrementally (MVP first, extended later)
3. **Future flexibility**: Can adopt external library later if needed (major refactor though)

## Implementation Strategy

### Phase 1: MVP Widgets (12 Core Widgets)

Build in priority order:

#### Week 1-2: Layout & Structure (4 widgets)
1. **Page** - Root container with header, content, footer
2. **Section** - Content grouping with title, padding
3. **Grid** - Responsive 12-column layout
4. **Card** - Content card with title, actions, padding

#### Week 3-4: Form Inputs (4 widgets)
5. **TextInput** - Single-line text input (text, email, password, number, tel)
6. **Select** - Dropdown selection (single, searchable)
7. **DatePicker** - Date/time selection (can use Radix UI or react-day-picker)
8. **Checkbox** - Boolean input with label

#### Week 5: Data Display (2 widgets)
9. **Table** - Data table with sorting, pagination (can use TanStack Table headless)
10. **KPI** - Key performance indicator display

#### Week 6: Dialogs & Feedback (2 widgets)
11. **Modal** - Dialog overlay (can use Radix UI Dialog)
12. **Toast** - Notification message (can use react-hot-toast)

### Widget Development Checklist

For each widget:
- [ ] TypeScript interface defined
- [ ] Component implementation
- [ ] CSS Modules styling
- [ ] Accessibility features (ARIA, keyboard, focus)
- [ ] Unit tests (React Testing Library)
- [ ] Integration tests (with configuration)
- [ ] Documentation in widget-catalog.md
- [ ] Storybook story (optional, Phase 2)

### Using Headless Libraries for Complex Widgets

We can use headless UI libraries for complex interactive widgets:

```typescript
// Select widget using Radix UI
import * as Select from '@radix-ui/react-select';

interface SelectWidgetProps {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function SelectWidget({ id, label, options, value, onChange, ...props }: SelectWidgetProps) {
  return (
    <Select.Root value={value} onValueChange={onChange} disabled={props.disabled}>
      <Select.Trigger className={styles.trigger}>
        <Select.Value placeholder={label} />
        <Select.Icon />
      </Select.Trigger>
      
      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.Viewport>
            {options.map(option => (
              <Select.Item key={option.value} value={option.value} className={styles.item}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
```

**Headless libraries to consider:**
- **Radix UI**: Select, Dialog, Dropdown, Tooltip, Popover
- **Headless UI**: Combobox, Listbox, Dialog, Menu
- **TanStack Table**: Table sorting, filtering, pagination
- **react-day-picker**: DatePicker functionality
- **react-hot-toast**: Toast notifications

### Widget Contract Example

```typescript
// TextInputWidget.tsx
interface TextInputWidgetProps {
  id: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel';
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  helperText?: string;
  maxLength?: number;
  pattern?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function TextInputWidget(props: TextInputWidgetProps) {
  const {
    id,
    type = 'text',
    label,
    value = '',
    placeholder,
    required = false,
    disabled = false,
    readOnly = false,
    error,
    helperText,
    maxLength,
    pattern,
    onChange,
    onBlur,
    onFocus,
    ariaLabel,
    ariaDescribedBy,
  } = props;

  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        pattern={pattern}
        onChange={e => onChange?.(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        className={cn(styles.input, error && styles.inputError)}
      />
      
      {error && <p className={styles.error} role="alert">{error}</p>}
      {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );
}
```

### Testing Strategy

```typescript
// TextInputWidget.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInputWidget } from './TextInputWidget';

describe('TextInputWidget', () => {
  test('renders label and input', () => {
    render(<TextInputWidget id="email" type="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  test('calls onChange when typing', async () => {
    const onChange = jest.fn();
    render(<TextInputWidget id="email" type="email" label="Email" onChange={onChange} />);
    
    const input = screen.getByLabelText('Email');
    await userEvent.type(input, 'test@example.com');
    
    expect(onChange).toHaveBeenCalledWith('test@example.com');
  });

  test('displays error message', () => {
    render(
      <TextInputWidget
        id="email"
        type="email"
        label="Email"
        error="Invalid email address"
      />
    );
    
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('supports keyboard navigation', () => {
    render(<TextInputWidget id="email" type="email" label="Email" />);
    const input = screen.getByLabelText('Email');
    
    input.focus();
    expect(input).toHaveFocus();
  });
});
```

## Dependencies to Install

```bash
# Headless UI libraries (optional, for complex widgets)
npm install @radix-ui/react-select @radix-ui/react-dialog
npm install @tanstack/react-table
npm install react-day-picker
npm install react-hot-toast

# Utility for className merging
npm install clsx
```

## Success Metrics

- All 12 MVP widgets implemented and tested by end of Phase 1
- WCAG 2.1 Level AA compliance for all widgets
- Bundle size < 100KB for all 12 widgets
- 90%+ test coverage for widget library
- Zero accessibility violations in automated tests
- Positive developer feedback on widget API ergonomics

## Review and Reevaluation

**Review Trigger**: End of Phase 1

**Reevaluate if:**
- Widget development taking significantly longer than estimated
- Accessibility compliance becomes too challenging
- Bundle size exceeds targets significantly
- Team requests external library for complexity reasons

## References

- [Widget Taxonomy v1](../widget-taxonomy.md)
- [Widget Catalog](../widget-catalog.md)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Headless UI Documentation](https://headlessui.com/)
- [TanStack Table](https://tanstack.com/table/v8)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated:** January 20, 2026  
**Next Review:** End of Phase 1
