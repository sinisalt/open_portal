/**
 * Toast Manager Service
 *
 * Provides imperative API for showing toast notifications using Sonner.
 */

import { toast as sonnerToast } from 'sonner';
import type { ToastOptions } from './types';

/**
 * Toast manager for showing notifications
 */
export const toastManager = {
  /**
   * Show a toast notification
   */
  show(options: ToastOptions): string | number {
    const {
      message,
      variant = 'info',
      description,
      duration = 3000,
      action,
      onActionClick,
      onClose,
    } = options;

    const toastOptions = {
      description,
      duration,
      action: action
        ? {
            label: action.label,
            onClick: () => {
              if (onActionClick) {
                onActionClick(action.actionId);
              }
            },
          }
        : undefined,
      onDismiss: onClose,
      onAutoClose: onClose,
    };

    // Show toast using Sonner's variant methods
    switch (variant) {
      case 'success':
        return sonnerToast.success(message, toastOptions);
      case 'error':
        return sonnerToast.error(message, toastOptions);
      case 'warning':
        return sonnerToast.warning(message, toastOptions);
      case 'info':
      default:
        return sonnerToast.info(message, toastOptions);
    }
  },

  /**
   * Show a success toast
   */
  success(message: string, description?: string, duration?: number): string | number {
    return this.show({ message, variant: 'success', description, duration });
  },

  /**
   * Show an error toast
   */
  error(message: string, description?: string, duration?: number): string | number {
    return this.show({ message, variant: 'error', description, duration });
  },

  /**
   * Show a warning toast
   */
  warning(message: string, description?: string, duration?: number): string | number {
    return this.show({ message, variant: 'warning', description, duration });
  },

  /**
   * Show an info toast
   */
  info(message: string, description?: string, duration?: number): string | number {
    return this.show({ message, variant: 'info', description, duration });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss(toastId: string | number): void {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    sonnerToast.dismiss();
  },
};
