/**
 * ToastWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Toast action button configuration
 */
export interface ToastAction {
  /** Button label */
  label: string;

  /** Action identifier for event handling */
  actionId: string;
}

/**
 * Toast position configuration
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Toast variant types
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast widget configuration
 */
export interface ToastWidgetConfig extends BaseWidgetConfig {
  type: 'Toast';

  /** Toast message */
  message: string;

  /** Toast variant/type */
  variant: ToastVariant;

  /** Description (optional subtitle) */
  description?: string;

  /** Auto-dismiss duration in milliseconds (default: 3000) */
  duration?: number;

  /** Whether toast is closable */
  closable?: boolean;

  /** Action button */
  action?: ToastAction;

  /** Position of the toast */
  position?: ToastPosition;
}

/**
 * Toast manager options
 */
export interface ToastOptions {
  /** Toast message */
  message: string;

  /** Toast variant */
  variant?: ToastVariant;

  /** Description */
  description?: string;

  /** Duration in milliseconds */
  duration?: number;

  /** Action button */
  action?: ToastAction;

  /** Action click handler */
  onActionClick?: (actionId: string) => void;

  /** Close handler */
  onClose?: () => void;
}
