/**
 * TextareaWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Textarea widget configuration
 *
 * Multi-line text input component for longer form content.
 * Can be used for: comments, descriptions, feedback, notes, etc.
 */
export interface TextareaWidgetConfig extends BaseWidgetConfig {
  type: 'Textarea';

  /** Input label */
  label?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Number of visible text rows */
  rows?: number;

  /** Maximum character length */
  maxLength?: number;

  /** Show character counter */
  showCounter?: boolean;

  /** Required field */
  required?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Read-only state */
  readOnly?: boolean;

  /** Helper text below input */
  helperText?: string;

  /** Error message */
  error?: string;

  /** Enable auto-resize based on content */
  autoResize?: boolean;
}
