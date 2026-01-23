/**
 * GridWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Grid widget configuration
 */
export interface GridWidgetConfig extends BaseWidgetConfig {
  type: 'Grid';

  /** Number of columns (default: 12) */
  columns?: number;

  /** Gap spacing between grid items */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Responsive column configuration */
  responsive?: {
    /** Extra small devices (< 640px) */
    xs?: number;
    /** Small devices (≥ 640px) */
    sm?: number;
    /** Medium devices (≥ 768px) */
    md?: number;
    /** Large devices (≥ 1024px) */
    lg?: number;
    /** Extra large devices (≥ 1280px) */
    xl?: number;
  };
}
