/**
 * CheckboxWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Checkbox widget configuration
 */
export interface CheckboxWidgetConfig extends BaseWidgetConfig {
  type: 'Checkbox';

  /** Field label */
  label?: string;

  /** Help text displayed below the field */
  helpText?: string;

  /** Whether checkbox is disabled */
  disabled?: boolean;

  /** Whether field is required */
  required?: boolean;

  /** Indeterminate state (partially checked) */
  indeterminate?: boolean;

  /** Error message */
  error?: string;
}
