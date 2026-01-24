/**
 * ModalWidget Component
 *
 * Modal dialog overlay widget with support for title, description, actions, and size variants.
 * Uses shadcn/ui Dialog component built on @radix-ui/react-dialog.
 *
 * Features:
 * - Size variants (sm, md, lg, xl, full)
 * - Closable option with X button
 * - Close on backdrop click
 * - Title and description support
 * - Footer with action buttons
 * - Focus trap and keyboard navigation (handled by Radix)
 * - Accessibility (ARIA roles, labels - handled by Radix)
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { ModalWidgetConfig } from './types';

export function ModalWidget({
  config,
  bindings,
  events,
  children,
}: WidgetProps<ModalWidgetConfig>) {
  const {
    title,
    description,
    size = 'md',
    closable = true,
    closeOnBackdrop = true,
    showFooter = true,
    actions = [],
  } = config;

  const isOpen = (bindings?.isOpen as boolean) ?? false;
  const content = bindings?.content ?? children;

  const handleOpenChange = (open: boolean) => {
    if (!open && events?.onClose) {
      events.onClose();
    }
  };

  const handleActionClick = (actionId: string) => {
    if (events?.onActionClick) {
      events.onActionClick(actionId);
    }
  };

  // Prevent default event when condition is met
  const preventDefaultIf = (condition: boolean) => (e: Event) => {
    if (condition) {
      e.preventDefault();
    }
  };

  // Size class mapping
  const sizeClasses: Record<string, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    full: 'sm:max-w-[95vw]',
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeOnBackdrop ? handleOpenChange : undefined}>
      <DialogContent
        className={cn(sizeClasses[size])}
        onEscapeKeyDown={preventDefaultIf(!closable)}
        onPointerDownOutside={preventDefaultIf(!closeOnBackdrop)}
        onInteractOutside={preventDefaultIf(!closeOnBackdrop)}
        // Hide close button if not closable
        hideCloseButton={!closable}
      >
        {/* Header with title and description */}
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        {/* Content area */}
        <div className="py-4">{content}</div>

        {/* Footer with actions */}
        {showFooter && actions.length > 0 && (
          <DialogFooter>
            {actions.map(action => (
              <Button
                key={action.id}
                variant={action.variant || 'default'}
                onClick={() => handleActionClick(action.actionId)}
              >
                {action.label}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

ModalWidget.displayName = 'ModalWidget';
