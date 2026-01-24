/**
 * DatePickerWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Date picker widget configuration
 */
export interface DatePickerWidgetConfig extends BaseWidgetConfig {
  type: 'DatePicker';

  /** Field label */
  label?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Help text displayed below the field */
  helpText?: string;

  /** Date format string (using date-fns format) */
  format?: string;

  /** Minimum selectable date (ISO 8601 string) */
  minDate?: string;

  /** Maximum selectable date (ISO 8601 string) */
  maxDate?: string;

  /** Whether field is disabled */
  disabled?: boolean;

  /** Whether field is required */
  required?: boolean;

  /** Whether to show time picker (not implemented in MVP) */
  showTime?: boolean;

  /** Error message */
  error?: string;
}
