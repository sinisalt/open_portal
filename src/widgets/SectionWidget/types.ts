/**
 * SectionWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Section widget configuration
 */
export interface SectionWidgetConfig extends BaseWidgetConfig {
  type: 'Section';

  /** Section title */
  title?: string;

  /** Section subtitle */
  subtitle?: string;

  /** Enable collapsible functionality */
  collapsible?: boolean;

  /** Default collapsed state */
  defaultCollapsed?: boolean;

  /** Show border around section */
  bordered?: boolean;

  /** Padding configuration */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
