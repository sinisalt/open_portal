/**
 * KPIWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * KPI format types
 */
export type KPIFormat = 'number' | 'currency' | 'percent';

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * KPI size variants
 */
export type KPISize = 'sm' | 'md' | 'lg';

/**
 * Format options for KPI values
 */
export interface KPIFormatOptions {
  decimals?: number;
  currency?: string;
  locale?: string;
}

/**
 * Trend configuration
 */
export interface TrendConfig {
  /** Trend direction */
  direction: TrendDirection;

  /** Trend value to display */
  value: string;
}

/**
 * KPIWidget configuration
 */
export interface KPIWidgetConfig extends BaseWidgetConfig {
  type: 'KPI';

  /** KPI label */
  label: string;

  /** Format type */
  format?: KPIFormat;

  /** Format-specific options */
  formatOptions?: KPIFormatOptions;

  /** Show trend indicator */
  showTrend?: boolean;

  /** Trend configuration */
  trend?: TrendConfig;

  /** Icon text/emoji to display (placeholder for future lucide-react integration) */
  icon?: string;

  /** Custom color for the card */
  color?: string;

  /** Size variant */
  size?: KPISize;

  /** Loading state */
  loading?: boolean;

  /** Description text */
  description?: string;
}
