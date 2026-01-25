/**
 * ModalPageWidget Type Definitions
 *
 * Types for rendering full page configurations inside modals with data passing.
 */

import type { PageConfig } from '@/types/page.types';
import type { BaseWidgetConfig } from '@/types/widget.types';
import type { ModalAction } from '@/widgets/ModalWidget/types';

/**
 * Modal page widget configuration
 * Renders a full page configuration inside a modal dialog
 */
export interface ModalPageWidgetConfig extends BaseWidgetConfig {
  type: 'ModalPage';

  /** Modal title */
  title?: string;

  /** Modal description */
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

  /** Page configuration to render inside the modal */
  pageConfig?: PageConfig;
}

/**
 * Modal input data passed to the modal
 */
export interface ModalInputData {
  /** Input data for the modal page */
  [key: string]: unknown;
}

/**
 * Modal output data returned from the modal
 */
export interface ModalOutputData {
  /** Output data from the modal page */
  [key: string]: unknown;
}

/**
 * Modal workflow events
 */
export interface ModalWorkflowEvents {
  /** Called when modal is closed */
  onClose?: () => void;

  /** Called when an action button is clicked */
  onActionClick?: (actionId: string) => void;

  /** Called when modal returns data */
  onReturn?: (data: ModalOutputData) => void;

  /** Called when modal is cancelled */
  onCancel?: () => void;

  /** Called when modal is submitted */
  onSubmit?: (data: ModalOutputData) => void;
}
