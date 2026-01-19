# Issue #016: Layout Widgets Implementation (Page, Section, Grid, Card)

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 5-7  
**Component:** Frontend  
**Estimated Effort:** 5 days  
**Priority:** High  
**Labels:** phase-1, frontend, widgets, layout

## Description
Implement the core layout widgets (Page, Section, Grid, Card) that provide the structural foundation for all pages in the OpenPortal platform.

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

## Technical Notes
- Use CSS Grid for Grid widget
- Use Flexbox for internal layouts
- Support nested grids
- Responsive breakpoints: 640px, 768px, 1024px, 1280px, 1536px
- Use semantic HTML elements
- Support CSS-in-JS from chosen UI library

## Responsive Behavior
- [ ] Mobile-first approach
- [ ] Automatic column stacking on mobile
- [ ] Touch-friendly targets
- [ ] Viewport-based sizing

## Accessibility Requirements
- [ ] Proper semantic HTML
- [ ] ARIA labels and roles
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management
- [ ] Color contrast compliance

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
- Page widget component
- Section widget component
- Grid widget component
- Card widget component
- Widget tests
- Storybook stories
- Documentation
