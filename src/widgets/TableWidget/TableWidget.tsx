/**
 * Advanced TableWidget Component
 *
 * Enhanced data table widget with pagination, sorting, filtering, selection, and more.
 * Uses shadcn/ui components and @tanstack/react-table v8 for advanced features.
 */

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Settings2,
} from 'lucide-react';
import Papa from 'papaparse';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatValue } from '@/lib/formatting';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { TableColumn, TableWidgetConfig } from './types';

// Helper function to extract column metadata with proper typing
function getColumnMeta<T extends Record<string, unknown>>(meta: unknown): T | undefined {
  return meta as T | undefined;
}

export function TableWidget({ config, bindings, events }: WidgetProps<TableWidgetConfig>) {
  const {
    columns: columnConfigs,
    rowKey,
    loading = false,
    emptyMessage = 'No data available',
    striped = false,
    hoverable = true,
    caption,
    sorting,
    pagination,
    filtering,
    selection,
    rowActions,
    bulkActions,
    columnConfig,
    export: exportConfig,
  } = config;

  // Get data from bindings with runtime validation
  const rawData = bindings?.value;
  const data: Record<string, unknown>[] = Array.isArray(rawData) ? rawData : [];

  // Use ref for events to avoid rebuilding columns on every render
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // State management
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sortingState, setSortingState] = useState<SortingState>(() => {
    if (sorting?.defaultField && sorting?.defaultDirection) {
      return [{ id: sorting.defaultField, desc: sorting.defaultDirection === 'desc' }];
    }
    return [];
  });
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: pagination?.currentPage || 0,
    pageSize: pagination?.pageSize || 10,
  });

  // Initialize column visibility from config (only on mount)
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run on mount to preserve user customizations
  useEffect(() => {
    const initialVisibility: VisibilityState = {};
    columnConfigs.forEach(col => {
      if (col.defaultVisible === false) {
        initialVisibility[col.id] = false;
      }
    });
    setColumnVisibility(initialVisibility);
  }, []);

  // Notify parent of state changes
  useEffect(() => {
    if (events?.onSortChange && sorting?.serverSide) {
      events.onSortChange(sortingState);
    }
  }, [sortingState, events, sorting?.serverSide]);

  useEffect(() => {
    if (events?.onPageChange && pagination?.serverSide) {
      events.onPageChange(paginationState);
    }
  }, [paginationState, events, pagination?.serverSide]);

  useEffect(() => {
    if (events?.onFilterChange && filtering?.serverSide) {
      events.onFilterChange(columnFilters);
    }
  }, [columnFilters, events, filtering?.serverSide]);

  useEffect(() => {
    if (events?.onRowSelect) {
      const selectedRows = Object.keys(rowSelection).filter(key => rowSelection[key]);
      events.onRowSelect(selectedRows);
    }
  }, [rowSelection, events]);

  // Build column definitions with advanced features
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    const cols: ColumnDef<Record<string, unknown>>[] = [];

    // Add selection column if enabled
    if (selection?.enabled) {
      cols.push({
        id: 'select',
        header: ({ table }) =>
          selection.multiSelect ? (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          ) : null,
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={e => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Add data columns
    cols.push(
      ...columnConfigs.map((col: TableColumn) => ({
        id: col.id,
        accessorKey: col.field,
        header: ({ column }) => {
          const isSortable = sorting?.enabled && col.sortable !== false;
          const isFilterable = filtering?.enabled && col.filterable !== false;

          return (
            <div className="flex items-center gap-2">
              <span>{col.label}</span>
              {isSortable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                  {column.getIsSorted() === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : column.getIsSorted() === 'desc' ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle sorting</span>
                </Button>
              )}
              {isFilterable && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn('h-8 w-8 p-0', column.getFilterValue() && 'text-primary')}
                    >
                      <Filter className="h-4 w-4" />
                      <span className="sr-only">Filter column</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-medium">Filter {col.label}</h4>
                        {col.filter?.type === 'select' && col.filter.options ? (
                          <Select
                            value={(column.getFilterValue() as string) || ''}
                            onValueChange={value => column.setFilterValue(value || undefined)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${col.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {col.filter.options.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder={`Filter ${col.label}...`}
                            value={(column.getFilterValue() as string) || ''}
                            onChange={e => column.setFilterValue(e.target.value || undefined)}
                            type={col.filter?.type === 'number' ? 'number' : 'text'}
                          />
                        )}
                      </div>
                      {column.getFilterValue() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => column.setFilterValue(undefined)}
                          className="w-full"
                        >
                          Clear filter
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          );
        },
        cell: ({ getValue }) => {
          const value = getValue();
          return formatValue(value, col.format || 'text', col.formatOptions);
        },
        enableSorting: sorting?.enabled && col.sortable !== false,
        enableHiding: columnConfig?.visibility !== false && col.defaultVisible !== false,
        meta: {
          align: col.align,
          width: col.width,
        },
      }))
    );

    // Add row actions column if enabled
    if (rowActions && rowActions.length > 0) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {rowActions.map(action => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => {
                    if (eventsRef.current?.onRowAction) {
                      eventsRef.current.onRowAction({ action: action.actionId, row: row.original });
                    }
                  }}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    return cols;
  }, [columnConfigs, sorting, filtering, selection, rowActions, columnConfig]);

  // Create table instance with all features
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Sorting
    ...(sorting?.enabled &&
      !sorting.serverSide && {
        getSortedRowModel: getSortedRowModel(),
      }),
    onSortingChange: setSortingState,
    // Filtering
    ...(filtering?.enabled &&
      !filtering.serverSide && {
        getFilteredRowModel: getFilteredRowModel(),
      }),
    onColumnFiltersChange: setColumnFilters,
    // Pagination
    ...(pagination?.enabled &&
      !pagination.serverSide && {
        getPaginationRowModel: getPaginationRowModel(),
      }),
    onPaginationChange: setPaginationState,
    // Selection
    onRowSelectionChange: setRowSelection,
    // Column visibility
    onColumnVisibilityChange: setColumnVisibility,
    // Consolidated state
    state: {
      sorting: sortingState,
      columnFilters,
      pagination: paginationState,
      rowSelection,
      columnVisibility,
    },
    // Server-side configuration
    ...(pagination?.enabled &&
      pagination.serverSide && {
        pageCount: pagination.totalRows
          ? Math.ceil(pagination.totalRows / paginationState.pageSize)
          : -1,
        manualPagination: true,
      }),
    ...(sorting?.enabled &&
      sorting.serverSide && {
        manualSorting: true,
      }),
    ...(filtering?.enabled &&
      filtering.serverSide && {
        manualFiltering: true,
      }),
    // Row selection
    enableRowSelection: selection?.enabled || false,
    enableMultiRowSelection: selection?.multiSelect !== false,
  });

  // Handle row click
  const handleRowClick = useCallback(
    (row: Record<string, unknown>) => {
      if (events?.onClick) {
        events.onClick(row);
      }
    },
    [events]
  );

  // Handle bulk action
  const handleBulkAction = useCallback(
    (actionId: string) => {
      if (events?.onBulkAction) {
        const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
        events.onBulkAction({ action: actionId, rows: selectedRows });
      }
    },
    [events, table]
  );

  // Export functionality
  const handleExport = useCallback(
    (format: 'csv') => {
      if (format === 'csv') {
        const rows = table.getRowModel().rows;
        // Map column IDs back to labels from original config
        const headers = columns
          .filter(col => col.id !== 'select' && col.id !== 'actions')
          .map(col => {
            const configCol = columnConfigs.find(c => c.id === col.id);
            return configCol?.label || col.id;
          });

        const csvData = rows.map(row =>
          columns
            .filter(col => col.id !== 'select' && col.id !== 'actions')
            .map(col => {
              const cell = row.getAllCells().find(c => c.column.id === col.id);
              return cell ? String(cell.getValue() || '') : '';
            })
        );

        const csv = Papa.unparse({
          fields: headers,
          data: csvData,
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = exportConfig?.filename || 'table-export.csv';
        link.click();
        URL.revokeObjectURL(url);
      }
    },
    [table, columns, exportConfig, columnConfigs]
  );

  // Loading state
  if (loading) {
    return (
      <div className="w-full rounded-md border">
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columnConfigs.map(col => (
                <TableHead
                  key={col.id}
                  className={cn(
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                  style={{ width: col.width }}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columnConfigs.length} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="ml-2 text-muted-foreground">Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="w-full rounded-md border">
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columnConfigs.map(col => (
                <TableHead
                  key={col.id}
                  className={cn(
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                  style={{ width: col.width }}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={columnConfigs.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  const hasSelection = Object.keys(rowSelection).length > 0;

  // Advanced data table with toolbar
  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {/* Bulk actions */}
          {hasSelection && bulkActions && bulkActions.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {Object.keys(rowSelection).length} row(s) selected
              </span>
              {bulkActions.map(action => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction(action.actionId)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Column visibility and export */}
        <div className="flex items-center space-x-2">
          {/* Column visibility toggle */}
          {columnConfig?.visibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={value => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export button */}
          {exportConfig?.csv && (
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const meta = getColumnMeta<{ align?: string; width?: number | string }>(
                    header.column.columnDef.meta
                  );
                  const align = meta?.align;
                  const width = meta?.width;

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        align === 'center' && 'text-center',
                        align === 'right' && 'text-right'
                      )}
                      style={{ width }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => {
                const rowData = row.original;
                const key = rowData[rowKey] as string | number;

                return (
                  <TableRow
                    key={key || index}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => handleRowClick(rowData)}
                    className={cn(
                      striped && index % 2 === 1 && 'bg-muted/50',
                      hoverable && events?.onClick && 'cursor-pointer',
                      !hoverable && 'hover:bg-transparent'
                    )}
                    role={events?.onClick ? 'button' : undefined}
                    tabIndex={events?.onClick ? 0 : undefined}
                    onKeyDown={e => {
                      if (events?.onClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleRowClick(rowData);
                      }
                    }}
                  >
                    {row.getVisibleCells().map(cell => {
                      const meta = getColumnMeta<{ align?: string }>(cell.column.columnDef.meta);
                      const align = meta?.align;

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            align === 'center' && 'text-center',
                            align === 'right' && 'text-right'
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination?.enabled && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {hasSelection && (
              <span>
                {Object.keys(rowSelection).length} of {table.getFilteredRowModel().rows.length}{' '}
                row(s) selected.
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            {/* Page size selector */}
            {pagination.pageSizeOptions && pagination.pageSizeOptions.length > 0 && (
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={value => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {pagination.pageSizeOptions.map(pageSize => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Page info */}
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

TableWidget.displayName = 'TableWidget';
