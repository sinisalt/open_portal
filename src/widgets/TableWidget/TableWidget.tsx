/**
 * TableWidget Component
 *
 * Data table widget for displaying tabular data with formatting support.
 * Uses shadcn/ui Table components and @tanstack/react-table for data management.
 */

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
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

export function TableWidget({ config, bindings, events }: WidgetProps<TableWidgetConfig>) {
  const {
    columns: columnConfigs,
    rowKey,
    loading = false,
    emptyMessage = 'No data available',
    striped = false,
    hoverable = true,
    caption,
  } = config;

  // Get data from bindings
  const data = (bindings?.value as Record<string, unknown>[]) || [];

  // Convert column configs to TanStack Table column definitions
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    return columnConfigs.map((col: TableColumn) => ({
      id: col.id,
      accessorKey: col.field,
      header: col.label,
      cell: ({ getValue }) => {
        const value = getValue();
        return formatValue(value, col.format || 'text', col.formatOptions);
      },
      meta: {
        align: col.align,
        width: col.width,
      },
    }));
  }, [columnConfigs]);

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle row click
  const handleRowClick = (row: Record<string, unknown>) => {
    if (events?.onClick) {
      events.onClick(row);
    }
  };

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

  // Data table
  return (
    <div className="w-full rounded-md border">
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const align = (header.column.columnDef.meta as { align?: string })?.align;
                const width = (header.column.columnDef.meta as { width?: number | string })?.width;

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
          {table.getRowModel().rows.map((row, index) => {
            const rowData = row.original;
            const key = rowData[rowKey] as string | number;

            return (
              <TableRow
                key={key || index}
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
                  const align = (cell.column.columnDef.meta as { align?: string })?.align;

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
          })}
        </TableBody>
      </Table>
    </div>
  );
}

TableWidget.displayName = 'TableWidget';
