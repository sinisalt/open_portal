/**
 * TextWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Text widget configuration
 *
 * Generic text display component with typography variants.
 * Supports headings, paragraphs, captions, and code blocks.
 * Can be used for: titles, descriptions, labels, formatted text, etc.
 */
export interface TextWidgetConfig extends BaseWidgetConfig {
  type: 'Text';

  /** Text content to display */
  content: string;

  /** Typography variant */
  variant?: 'heading' | 'subheading' | 'body' | 'caption' | 'code';

  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';

  /** Text color (Tailwind color class or hex) */
  color?: string;

  /** Font weight */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

  /** Text size override (CSS value) */
  size?: string;

  /**
   * Enable markdown parsing (FUTURE FEATURE - NOT YET IMPLEMENTED)
   * Currently renders as plain text. Will be implemented in a future release with react-markdown.
   * @deprecated This feature is planned but not yet available. Setting this to true will log a warning.
   */
  markdown?: boolean;

  /** Truncate text with ellipsis after N lines */
  truncate?: number;

  /** Enable text wrapping */
  wrap?: boolean;
}
