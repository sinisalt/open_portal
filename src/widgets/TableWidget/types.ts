/**
 * TableWidget Type Definitions
 */

import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Column alignment options
 */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Column format types
 */
export type ColumnFormat = 'text' | 'number' | 'currency' | 'date';

/**
 * Format options for columns
 */
export interface ColumnFormatOptions {
  decimals?: number;
  currency?: string;
  locale?: string;
  dateFormat?: string;
}

/**
 * Table column configuration
 */
export interface TableColumn {
  /** Unique column identifier */
  id: string;

  /** Column header label */
  label: string;

  /** Field name in data object */
  field: string;

  /** Column width (CSS value or number for pixels) */
  width?: number | string;

  /** Column alignment */
  align?: ColumnAlign;

  /** Column format type */
  format?: ColumnFormat;

  /** Format-specific options */
  formatOptions?: ColumnFormatOptions;
}

/**
 * TableWidget configuration
 */
export interface TableWidgetConfig extends BaseWidgetConfig {
  type: 'Table';

  /** Column definitions */
  columns: TableColumn[];

  /** Field name to use as row key (required for React key prop) */
  rowKey: string;

  /** Loading state */
  loading?: boolean;

  /** Empty state message */
  emptyMessage?: string;

  /** Enable zebra striping */
  striped?: boolean;

  /** Enable hover effect on rows */
  hoverable?: boolean;

  /** Table caption (for accessibility) */
  caption?: string;
}
