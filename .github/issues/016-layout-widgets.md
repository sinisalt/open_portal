# Issue #016: Layout Widgets Implementation (Page, Section, Grid, Card)

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 5-7  
**Component:** Frontend  
**Estimated Effort:** 2-3 days  
**Priority:** High  
**Labels:** phase-1, frontend, widgets, layout

**Updated:** January 23, 2026 - Aligned with shadcn/ui approach (ADR-012)

## Description
Implement the core layout widgets (Page, Section, Grid, Card) that provide the structural foundation for all pages in the OpenPortal platform.

**Implementation Approach:**
- **CardWidget:** Uses shadcn `card` component (already installed)
- **PageWidget:** Custom Tailwind layout (no shadcn component needed)
- **SectionWidget:** Uses shadcn `card` optionally for bordered sections
- **GridWidget:** Custom Tailwind grid (no shadcn component needed)

See `WIDGET-COMPONENT-MAPPING.md` for detailed component mapping and installation commands.

## Acceptance Criteria

### Page Widget
- [ ] Top-level page container component
- [ ] Support title and description props
- [ ] Padding configuration (none, sm, md, lg)
- [ ] Theme prop support
- [ ] onLoad event handler
- [ ] Responsive behavior
- [ ] Accessibility (page landmarks)

### Section Widget
- [ ] Content grouping component
- [ ] Title and subtitle support
- [ ] Collapsible functionality
- [ ] defaultCollapsed prop
- [ ] Border styling option
- [ ] Padding configuration
- [ ] onExpand/onCollapse events
- [ ] Accessibility (section landmarks)

### Grid Widget
- [ ] Responsive grid layout
- [ ] 12-column system (default)
- [ ] Configurable column count
- [ ] Gap spacing (none, xs, sm, md, lg, xl)
- [ ] Responsive breakpoints (xs, sm, md, lg, xl)
- [ ] Child layout props (span, offset, order)
- [ ] Auto-placement and explicit placement
- [ ] Accessibility (proper nesting)

### Card Widget
- [ ] Content container component
- [ ] Title and subtitle support
- [ ] Optional image
- [ ] Elevation levels (none, sm, md, lg)
- [ ] Border option
- [ ] Padding configuration
- [ ] Actions array in footer
- [ ] onActionClick event
- [ ] Hover effects
- [ ] Accessibility

## Widget Specifications

### Page Props
```typescript
{
  title?: string;
  description?: string;
  theme?: object;
  padding?: "none" | "sm" | "md" | "lg";
  onLoad?: () => void;
}
```

### Section Props
```typescript
{
  title?: string;
  subtitle?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  bordered?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onExpand?: () => void;
  onCollapse?: () => void;
}
```

### Grid Props
```typescript
{
  columns?: number; // Default: 12
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  responsive?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}
```

### Card Props
```typescript
{
  title?: string;
  subtitle?: string;
  image?: string;
  elevation?: "none" | "sm" | "md" | "lg";
  bordered?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  actions?: Array<{
    id: string;
    label: string;
    actionId: string;
  }>;
  onActionClick?: (actionId: string) => void;
}
```

## Dependencies
- Depends on: #015 (Widget registry must exist)
- Depends on: #012 (Branding for theming)
- Depends on: #014 (Widget architecture POC)
- References: WIDGET-COMPONENT-MAPPING.md (shadcn component mapping)

## shadcn Component Installation

```bash
# Card widget - already installed in ISSUE-013
# npx shadcn@latest add card

# Button component (for Card actions) - already installed
# npx shadcn@latest add button

# No additional shadcn components needed for Page, Section, Grid
# These use custom Tailwind layouts
```

## Technical Notes
- **CardWidget:** Wraps shadcn `card`, `card-header`, `card-title`, `card-content`, `card-footer` components
- **PageWidget:** Custom layout using Tailwind CSS (`min-h-screen`, `flex`, `flex-col`)
- **SectionWidget:** Optional shadcn `card` for bordered sections, otherwise custom div with Tailwind
- **GridWidget:** CSS Grid with Tailwind utilities (`grid`, `grid-cols-*`, `gap-*`)
- Responsive breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl), 1536px (2xl)
- Use semantic HTML elements (`<main>`, `<section>`, `<article>`)
- Accessibility handled by semantic HTML and Radix (via shadcn Card)

## Responsive Behavior
- [ ] Mobile-first approach
- [ ] Automatic column stacking on mobile
- [ ] Touch-friendly targets
- [ ] Viewport-based sizing

## Accessibility Requirements
- [ ] Proper semantic HTML (`<main>`, `<section>`, `<article>`, `<aside>`)
- [ ] ARIA labels and roles where appropriate
- [ ] Keyboard navigation (handled by shadcn Card for interactive elements)
- [ ] Screen reader support (semantic HTML + ARIA)
- [ ] Focus management (handled by Radix for Card actions)
- [ ] Color contrast compliance (Tailwind theme ensures this)

**Note:** shadcn Card is built on Radix UI primitives, which handle complex accessibility automatically.

## Testing Requirements
- [ ] Unit tests for each widget
- [ ] Snapshot tests
- [ ] Responsive behavior tests
- [ ] Accessibility tests
- [ ] Event handler tests
- [ ] Edge case tests (no children, overflow)
- [ ] Visual regression tests

## Documentation
- [ ] Widget API documentation
- [ ] Usage examples for each widget
- [ ] Layout patterns and best practices
- [ ] Responsive design guide
- [ ] Accessibility guidelines

## Deliverables
- Page widget component (custom Tailwind layout)
- Section widget component (optional shadcn Card wrapper)
- Grid widget component (Tailwind grid)
- Card widget component (shadcn Card wrapper)
- Widget tests (following ISSUE-014 test patterns)
- Documentation (usage examples, configuration)

## Implementation Example

**CardWidget using shadcn:**
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WidgetProps } from '@/types/widget'

interface CardWidgetConfig extends WidgetConfig {
  type: 'Card'
  title?: string
  description?: string
  bordered?: boolean
  actions?: Array<{ id: string; label: string; variant?: string }>
}

export function CardWidget({ config, bindings, events }: WidgetProps<CardWidgetConfig>) {
  const { title, description, actions } = config
  
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{bindings?.content}</CardContent>
      {actions && (
        <CardFooter className="flex gap-2">
          {actions.map(action => (
            <Button
              key={action.id}
              variant={action.variant as any}
              onClick={() => events?.onAction?.(action.id)}
            >
              {action.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}
```

## References
- **WIDGET-COMPONENT-MAPPING.md:** Component mappings and complexity estimates
- **WIDGET-ARCHITECTURE.md:** 3-layer architecture patterns
- **ISSUE-014:** TextInputWidget POC implementation patterns
