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
 * Filter types for columns
 *
 * Note: Additional filter types (e.g. date-based filters) will be added here
 * when they are fully supported by the TableWidget implementation.
 */
export type FilterType = 'text' | 'number' | 'select';

/**
 * Filter configuration for a column
 */
export interface ColumnFilter {
  /** Filter type */
  type: FilterType;

  /** Options for select filters */
  options?: Array<{ label: string; value: string }>;

  /** Custom filter function (client-side only) */
  filterFn?: (row: unknown, columnId: string, filterValue: unknown) => boolean;
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

  /** Enable sorting for this column */
  sortable?: boolean;

  /** Enable filtering for this column */
  filterable?: boolean;

  /** Filter configuration */
  filter?: ColumnFilter;

  /** Enable resizing for this column */
  resizable?: boolean;

  /** Enable pinning for this column */
  pinnable?: boolean;

  /** Default visibility */
  defaultVisible?: boolean;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig {
  /** Enable sorting */
  enabled: boolean;

  /** Server-side sorting */
  serverSide?: boolean;

  /** Default sort field */
  defaultField?: string;

  /** Default sort direction */
  defaultDirection?: SortDirection;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Enable pagination */
  enabled: boolean;

  /** Server-side pagination */
  serverSide?: boolean;

  /** Default page size */
  pageSize: number;

  /** Page size options */
  pageSizeOptions?: number[];

  /** Total rows (for server-side pagination) */
  totalRows?: number;

  /** Current page (0-indexed, for server-side pagination) */
  currentPage?: number;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  /** Enable filtering */
  enabled: boolean;

  /** Server-side filtering */
  serverSide?: boolean;
}

/**
 * Row selection configuration
 */
export interface SelectionConfig {
  /** Enable row selection */
  enabled: boolean;

  /** Allow multiple row selection */
  multiSelect?: boolean;

  /** Selected row keys */
  selectedKeys?: string[];
}

/**
 * Row action configuration
 */
export interface RowAction {
  /** Unique action identifier */
  id: string;

  /** Action label */
  label: string;

  /** Action icon (optional) */
  icon?: string;

  /** Action ID to execute */
  actionId: string;
}

/**
 * Bulk action configuration
 */
export interface BulkAction {
  /** Unique action identifier */
  id: string;

  /** Action label */
  label: string;

  /** Action ID to execute */
  actionId: string;
}

/**
 * Column configuration
 */
export interface ColumnConfig {
  /** Enable column visibility toggle */
  visibility?: boolean;

  /** Enable column reordering */
  reordering?: boolean;

  /** Enable column resizing */
  resizing?: boolean;

  /** Enable column pinning */
  pinning?: boolean;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Enable CSV export */
  csv?: boolean;

  /** Enable Excel export */
  excel?: boolean;

  /** Custom export filename */
  filename?: string;
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

  /** Sorting configuration */
  sorting?: SortConfig;

  /** Pagination configuration */
  pagination?: PaginationConfig;

  /** Filtering configuration */
  filtering?: FilterConfig;

  /** Row selection configuration */
  selection?: SelectionConfig;

  /** Row actions */
  rowActions?: RowAction[];

  /** Bulk actions */
  bulkActions?: BulkAction[];

  /** Column configuration */
  columnConfig?: ColumnConfig;

  /** Export configuration */
  export?: ExportConfig;

  /** Enable virtualized scrolling for large datasets */
  virtualized?: boolean;

  /** Height for virtualized scrolling */
  virtualizedHeight?: number;
}
