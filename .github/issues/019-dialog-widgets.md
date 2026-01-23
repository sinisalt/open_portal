# Issue #019: Dialog Widgets (Modal, Toast/Notification)

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 5-7  
**Component:** Frontend  
**Estimated Effort:** 2-3 days  
**Priority:** High  
**Labels:** phase-1, frontend, widgets, dialogs

**Updated:** January 23, 2026 - Aligned with shadcn/ui approach (ADR-012)

## Description
Implement basic dialog widgets (Modal and Toast/Notification) for displaying overlay content and user feedback in the MVP.

**Implementation Approach:**
- **Modal:** Uses shadcn `dialog` component built on @radix-ui/react-dialog
- **Toast:** Uses shadcn `sonner` (recommended) or `toast` component

All accessibility features (focus trap, keyboard navigation, ARIA attributes) are handled automatically by Radix UI primitives.

See `WIDGET-COMPONENT-MAPPING.md` for detailed component mapping and installation commands.

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
- Depends on: #014 (Widget architecture POC)
- References: WIDGET-COMPONENT-MAPPING.md (component mapping)

## shadcn Component Installation

```bash
# Modal widget
npx shadcn@latest add dialog
npx shadcn@latest add button

# Toast widget (Option 1: Sonner - Recommended)
npm install sonner
npx shadcn@latest add sonner

# Toast widget (Option 2: Radix Toast)
# npx shadcn@latest add toast
```

## Technical Notes
- **Modal:** Wrap shadcn `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- **Focus trap:** Handled automatically by @radix-ui/react-dialog
- **Body scroll lock:** Handled automatically by Radix Dialog
- **Backdrop:** Included in shadcn Dialog component
- **Toast (Sonner):** Use `toast()` function for imperative API, `<Toaster />` component for rendering
- **Toast variants:** success, error, warning, info (Sonner supports all)
- **Animation:** Built into shadcn Dialog and Sonner
- **Z-index:** Managed by Radix and shadcn (Dialog: 50, Toast: 100)
- **Accessibility:** ARIA dialog role, focus trap, escape key - all handled by Radix

## Modal Features
- [ ] Prevent background interaction (handled by Radix)
- [ ] Maintain focus within modal (handled by Radix)
- [ ] Return focus after close (handled by Radix)
- [ ] Backdrop blur effect (Tailwind: backdrop-blur-sm)
- [ ] Slide/fade animations (shadcn includes these)
- [ ] Header/footer sections (shadcn DialogHeader/DialogFooter)

**Note:** @radix-ui/react-dialog handles all complex focus management, keyboard interactions, and ARIA attributes automatically.

## Toast Features
- [ ] Toast container/manager (Sonner `<Toaster />` component)
- [ ] Auto-dismiss timer (configurable duration)
- [ ] Pause on hover (Sonner default)
- [ ] Progress bar (Sonner includes this)
- [ ] Icon per variant (Sonner includes)
- [ ] Stack with spacing (Sonner handles)
- [ ] Limit visible toasts (Sonner config: `visibleToasts`)

**Note:** Sonner provides excellent UX out of the box with minimal configuration.

## Toast Manager
```typescript
interface ToastManager {
  show(options: ToastOptions): string;
  dismiss(id: string): void;
  dismissAll(): void;
}
```

## Accessibility Requirements
- [ ] Modal dialog role (handled by Radix)
- [ ] aria-labelledby for title (handled by shadcn DialogTitle)
- [ ] aria-describedby for content (handled by shadcn DialogDescription)
- [ ] Focus management (handled by Radix)
- [ ] Keyboard navigation (Tab, Escape - handled by Radix)
- [ ] Escape key handler (handled by Radix)
- [ ] Toast aria-live region (Sonner implements this)
- [ ] Screen reader announcements (aria-live="polite" for toasts)

**Note:** @radix-ui/react-dialog and Sonner handle all accessibility requirements automatically. No custom implementation needed.

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
- Modal widget using shadcn Dialog
- Toast widget/service using Sonner
- Tests (following ISSUE-014 test patterns)
- Documentation (usage examples, configuration)

## Implementation Examples

**ModalWidget using shadcn Dialog:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { WidgetProps } from '@/types/widget'

interface ModalWidgetConfig extends WidgetConfig {
  type: 'Modal'
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  actions?: Array<{ id: string; label: string; variant?: string }>
}

export function ModalWidget({ config, bindings, events }: WidgetProps<ModalWidgetConfig>) {
  const { title, description, actions } = config
  const isOpen = bindings?.isOpen ?? false

  return (
    <Dialog open={isOpen} onOpenChange={(open) => events?.onOpenChange?.(open)}>
      <DialogContent className={`sm:max-w-${config.size || 'md'}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {bindings?.content}
        {actions && (
          <DialogFooter>
            {actions.map(action => (
              <Button
                key={action.id}
                variant={action.variant as any}
                onClick={() => events?.onAction?.(action.id)}
              >
                {action.label}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

**Toast Service using Sonner:**
```typescript
import { toast } from 'sonner'

// In action handler or component
export function showToast(message: string, variant: 'success' | 'error' | 'warning' | 'info') {
  toast[variant](message, {
    duration: 3000,
    closeButton: true,
  })
}

// In app root
import { Toaster } from '@/components/ui/sonner'

export function App() {
  return (
    <>
      <YourApp />
      <Toaster />
    </>
  )
}
```

## References
- **WIDGET-COMPONENT-MAPPING.md:** Modal complexity (4-5 hours), Toast complexity (2-3 hours)
- **WIDGET-ARCHITECTURE.md:** 3-layer architecture patterns
- **shadcn/ui Components:** [Dialog](https://ui.shadcn.com/docs/components/dialog), [Sonner](https://ui.shadcn.com/docs/components/sonner)
- **Sonner Documentation:** [sonner.emilkowal.ski](https://sonner.emilkowal.ski/)
