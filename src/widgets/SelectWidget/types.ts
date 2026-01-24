/**
 * SelectWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Option for select dropdown
 */
export interface SelectOption {
  /** Option value */
  value: string | number;

  /** Display label */
  label: string;

  /** Whether option is disabled */
  disabled?: boolean;

  /** Icon for the option (optional) */
  icon?: string;
}

/**
 * Select widget configuration
 */
export interface SelectWidgetConfig extends BaseWidgetConfig {
  type: 'Select';

  /** Field label */
  label?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Help text displayed below the field */
  helpText?: string;

  /** Available options */
  options: SelectOption[];

  /** Whether field is disabled */
  disabled?: boolean;

  /** Whether field is required */
  required?: boolean;

  /** Whether select is searchable (uses Command component) */
  searchable?: boolean;

  /** Whether user can clear selection */
  clearable?: boolean;

  /** Error message */
  error?: string;
}
