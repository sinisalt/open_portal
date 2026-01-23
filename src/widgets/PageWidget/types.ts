/**
 * PageWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Page widget configuration
 */
export interface PageWidgetConfig extends BaseWidgetConfig {
  type: 'Page';

  /** Page title */
  title?: string;

  /** Page description */
  description?: string;

  /** Theme configuration */
  theme?: {
    background?: string;
    textColor?: string;
  };

  /** Padding configuration */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
