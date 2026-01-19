# Issue #019: Dialog Widgets (Modal, Toast/Notification)

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 5-7  
**Component:** Frontend  
**Estimated Effort:** 4 days  
**Priority:** High  
**Labels:** phase-1, frontend, widgets, dialogs

## Description
Implement basic dialog widgets (Modal and Toast/Notification) for displaying overlay content and user feedback in the MVP.

## Acceptance Criteria

### Modal Widget (Basic)
- [ ] Overlay/backdrop rendering
- [ ] Title support
- [ ] Size variants (sm, md, lg, xl, full)
- [ ] Closable option (X button)
- [ ] Close on backdrop click option
- [ ] Content area for children
- [ ] Footer with actions
- [ ] Open/close state management
- [ ] onClose event
- [ ] onActionClick event
- [ ] Focus trap
- [ ] Escape key to close
- [ ] Scroll management (body scroll lock)
- [ ] Accessibility

### Toast/Notification Widget
- [ ] Notification message display
- [ ] Variant types (success, error, warning, info)
- [ ] Auto-dismiss with duration
- [ ] Closable option
- [ ] Action button support
- [ ] Position configuration (top-right, top-center, etc.)
- [ ] Stack multiple toasts
- [ ] Slide-in animation
- [ ] onClose event
- [ ] onActionClick event
- [ ] Accessibility (aria-live)

## Widget Props Schemas

### Modal
```typescript
{
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  open: boolean;
  closable?: boolean;
  closeOnBackdrop?: boolean;
  showFooter?: boolean;
  actions?: Array<{
    id: string;
    label: string;
    variant?: "primary" | "secondary" | "text";
    actionId: string;
  }>;
  onClose: () => void;
  onActionClick?: (actionId: string) => void;
  children: React.ReactNode;
}
```

### Toast
```typescript
{
  message: string;
  variant: "success" | "error" | "warning" | "info";
  duration?: number; // milliseconds (default: 3000)
  closable?: boolean;
  action?: {
    label: string;
    actionId: string;
  };
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
  onClose?: () => void;
  onActionClick?: (actionId: string) => void;
}
```

## Dependencies
- Depends on: #015 (Widget registry)
- Depends on: #012 (Branding/theming)

## Technical Notes
- Use React Portal for rendering outside DOM hierarchy
- Implement focus trap for modals
- Lock body scroll when modal is open
- Use z-index layering for stacking
- Handle modal nesting (if needed later)
- Toast queue management for multiple notifications
- Animation using CSS transitions or Framer Motion

## Modal Features
- [ ] Prevent background interaction
- [ ] Maintain focus within modal
- [ ] Return focus after close
- [ ] Backdrop blur effect
- [ ] Slide/fade animations
- [ ] Header/footer sections

## Toast Features
- [ ] Toast container/manager
- [ ] Auto-dismiss timer
- [ ] Pause on hover
- [ ] Progress bar (optional)
- [ ] Icon per variant
- [ ] Stack with spacing
- [ ] Limit visible toasts

## Toast Manager
```typescript
interface ToastManager {
  show(options: ToastOptions): string;
  dismiss(id: string): void;
  dismissAll(): void;
}
```

## Accessibility Requirements
- [ ] Modal dialog role
- [ ] aria-labelledby for title
- [ ] aria-describedby for content
- [ ] Focus management
- [ ] Keyboard navigation
- [ ] Escape key handler
- [ ] Toast aria-live region
- [ ] Screen reader announcements

## Testing Requirements
- [ ] Unit tests for components
- [ ] Test open/close behavior
- [ ] Test focus management
- [ ] Test keyboard interactions
- [ ] Test toast stacking
- [ ] Test auto-dismiss
- [ ] Accessibility tests
- [ ] Visual regression tests

## Documentation
- [ ] Widget API documentation
- [ ] Usage examples
- [ ] Modal patterns guide
- [ ] Toast best practices
- [ ] Accessibility guidelines

## Deliverables
- Modal widget
- Toast widget
- Toast manager/service
- Tests
- Storybook stories
- Documentation
