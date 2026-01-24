/**
 * TextInputWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * TextInput widget configuration
 */
export interface TextInputWidgetConfig extends BaseWidgetConfig {
  type: 'TextInput';

  /** Field label */
  label?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Help text displayed below the field */
  helpText?: string;

  /** Input type */
  inputType?: 'text' | 'email' | 'url' | 'tel' | 'search' | 'password' | 'number';

  /** Maximum length of input */
  maxLength?: number;

  /** Whether field is disabled */
  disabled?: boolean;

  /** Whether field is readonly */
  readonly?: boolean;

  /** Whether field is required */
  required?: boolean;

  /** Whether to autofocus the field */
  autoFocus?: boolean;

  /** Icon name (optional - not implemented in MVP) */
  icon?: string;

  /** Icon position (optional - not implemented in MVP) */
  iconPosition?: 'start' | 'end';

  /** Error message */
  error?: string;
}
