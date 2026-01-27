/**
 * TagInputWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * TagInput widget configuration
 *
 * Generic tag/chip input component for adding/removing tags.
 * Can be used for categories, keywords, skills, labels, etc.
 */
export interface TagInputWidgetConfig extends BaseWidgetConfig {
  type: 'TagInput';

  /** Label text for the input */
  label?: string;

  /** Placeholder text when input is empty */
  placeholder?: string;

  /** Current tags array (from bindings) */
  tags?: string[];

  /** Datasource ID for autocomplete suggestions */
  datasourceId?: string;

  /** Maximum number of tags allowed */
  maxTags?: number;

  /** Allow user to create custom tags */
  allowCustom?: boolean;

  /** Help text displayed below input */
  helpText?: string;

  /** Whether the input is disabled */
  disabled?: boolean;

  /** Custom CSS class */
  className?: string;

  /** Error message to display */
  error?: string;
}

/**
 * Tag suggestion item from datasource
 */
export interface TagSuggestion {
  /** Suggestion value */
  value: string;

  /** Display label (optional, defaults to value) */
  label?: string;
}
