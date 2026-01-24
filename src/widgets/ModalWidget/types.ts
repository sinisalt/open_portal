/**
 * ModalWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Modal action button configuration
 */
export interface ModalAction {
  /** Unique button identifier (for React key prop) */
  id: string;

  /** Button label */
  label: string;

  /** Button variant style */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';

  /** Action identifier passed to onActionClick event handler */
  actionId: string;
}

/**
 * Modal widget configuration
 */
export interface ModalWidgetConfig extends BaseWidgetConfig {
  type: 'Modal';

  /** Modal title */
  title?: string;

  /** Modal description (optional subtitle) */
  description?: string;

  /** Modal size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /** Whether to show close button (X) */
  closable?: boolean;

  /** Whether clicking backdrop closes the modal */
  closeOnBackdrop?: boolean;

  /** Whether to show the footer */
  showFooter?: boolean;

  /** Action buttons in the footer */
  actions?: ModalAction[];
}
