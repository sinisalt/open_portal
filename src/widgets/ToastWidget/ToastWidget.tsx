/**
 * ToastWidget Component
 *
 * Toast notification widget for displaying temporary messages.
 * Uses Sonner library for toast notifications with excellent UX.
 *
 * Features:
 * - Variant types (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Closable option
 * - Action button support
 * - Accessibility (handled by Sonner)
 *
 * Note: This widget is typically used via the toastManager service
 * rather than being rendered directly in page configs.
 */

import { useEffect } from 'react';
import type { WidgetProps } from '@/types/widget.types';
import { toastManager } from './toastManager';
import type { ToastWidgetConfig } from './types';

export function ToastWidget({ config, events }: WidgetProps<ToastWidgetConfig>) {
  const { message, variant, description, duration = 3000, action } = config;

  useEffect(() => {
    // Show toast when component mounts or config changes
    const toastId = toastManager.show({
      message,
      variant,
      description,
      duration,
      action,
      onActionClick: (actionId: string) => {
        if (events?.onActionClick) {
          events.onActionClick(actionId);
        }
      },
      onClose: () => {
        if (events?.onClose) {
          events.onClose();
        }
      },
    });

    // Cleanup: dismiss toast when component unmounts
    return () => {
      if (toastId) {
        toastManager.dismiss(toastId);
      }
    };
  }, [message, variant, description, duration, action, events]);

  // ToastWidget doesn't render anything itself - Sonner handles rendering
  return null;
}

ToastWidget.displayName = 'ToastWidget';
