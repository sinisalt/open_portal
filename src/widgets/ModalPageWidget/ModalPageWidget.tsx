/**
 * ModalPageWidget Component
 *
 * Renders a full page configuration inside a modal dialog.
 * Supports data passing from parent to modal and returning data from modal.
 *
 * Features:
 * - Full page rendering in modal
 * - Input data passing via bindings
 * - Output data return via events
 * - Modal state management
 * - Action handlers with data flow
 */

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WidgetRenderer } from '@/core/renderer/WidgetRenderer';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { ModalInputData, ModalOutputData, ModalPageWidgetConfig } from './types';

export function ModalPageWidget({ config, bindings, events }: WidgetProps<ModalPageWidgetConfig>) {
  const {
    title,
    description,
    size = 'md',
    closable = true,
    closeOnBackdrop = true,
    showFooter = true,
    actions = [],
    pageConfig,
  } = config;

  // Get input data from bindings
  const inputData = (bindings?.inputData as ModalInputData) ?? {};
  const isOpen = (bindings?.isOpen as boolean) ?? false;

  // Local state for modal data
  const [modalData, setModalData] = useState<Record<string, unknown>>(inputData);

  // Handle modal close
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        if (events?.onClose) {
          events.onClose();
        }
        if (events?.onCancel) {
          events.onCancel();
        }
      }
    },
    [events]
  );

  // Handle action button clicks
  const handleActionClick = useCallback(
    (actionId: string) => {
      // Check for standard action IDs
      if (actionId === 'submit' || actionId === 'confirm' || actionId === 'ok') {
        // Submit action - return data
        const outputData: ModalOutputData = { ...modalData };
        if (events?.onSubmit) {
          events.onSubmit(outputData);
        }
        if (events?.onReturn) {
          events.onReturn(outputData);
        }
      } else if (actionId === 'cancel' || actionId === 'close') {
        // Cancel action - close without returning data
        if (events?.onCancel) {
          events.onCancel();
        }
        if (events?.onClose) {
          events.onClose();
        }
      } else {
        // Custom action - delegate to parent
        if (events?.onActionClick) {
          events.onActionClick(actionId);
        }
      }
    },
    [modalData, events]
  );

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

  // Handle data updates from child widgets
  const handleDataChange = useCallback((key: string, value: unknown) => {
    setModalData(prev => ({ ...prev, [key]: value }));
  }, []);

  // Create event handlers for child widgets
  const _createChildEvents = useCallback(
    (fieldId: string) => ({
      onChange: (value: unknown) => handleDataChange(fieldId, value),
    }),
    [handleDataChange]
  );

  return (
    <Dialog open={isOpen} onOpenChange={closeOnBackdrop ? handleOpenChange : undefined}>
      <DialogContent
        className={cn(sizeClasses[size], 'max-h-[90vh] flex flex-col')}
        onEscapeKeyDown={preventDefaultIf(!closable)}
        onPointerDownOutside={preventDefaultIf(!closeOnBackdrop)}
        onInteractOutside={preventDefaultIf(!closeOnBackdrop)}
        hideCloseButton={!closable}
      >
        {/* Header with title and description */}
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        {/* Page content area - scrollable */}
        <div className="flex-1 overflow-y-auto py-4">
          {pageConfig ? (
            <WidgetRenderer
              config={pageConfig}
              bindings={{
                ...bindings,
                // Pass input data to child widgets
                inputData,
                // Pass current modal data state
                modalData,
              }}
              events={{
                ...events,
                // Provide data change handler to children
                onDataChange: handleDataChange,
              }}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No page configuration provided
            </div>
          )}
        </div>

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

ModalPageWidget.displayName = 'ModalPageWidget';
