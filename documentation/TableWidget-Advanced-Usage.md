# Advanced TableWidget Usage Examples

## Overview

The TableWidget now supports advanced features including pagination, sorting, filtering, row selection, row actions, bulk actions, column visibility, and data export.

## Basic Table (Backward Compatible)

```typescript
import { TableWidget } from '@/widgets/TableWidget';

const basicTableConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    { id: 'name', label: 'Name', field: 'name' },
    { id: 'email', label: 'Email', field: 'email' },
    { id: 'age', label: 'Age', field: 'age', format: 'number' },
  ],
  rowKey: 'id',
};

<TableWidget 
  config={basicTableConfig} 
  bindings={{ value: users }} 
/>
```

## Advanced Table with Pagination

```typescript
const paginatedTableConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    { id: 'name', label: 'Name', field: 'name' },
    { id: 'email', label: 'Email', field: 'email' },
    { id: 'age', label: 'Age', field: 'age', format: 'number' },
  ],
  rowKey: 'id',
  pagination: {
    enabled: true,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
};

<TableWidget 
  config={paginatedTableConfig} 
  bindings={{ value: users }} 
/>
```

## Table with Sorting

```typescript
const sortableTableConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    { id: 'name', label: 'Name', field: 'name', sortable: true },
    { id: 'email', label: 'Email', field: 'email', sortable: true },
    { id: 'age', label: 'Age', field: 'age', format: 'number', sortable: true },
  ],
  rowKey: 'id',
  sorting: {
    enabled: true,
    defaultField: 'name',
    defaultDirection: 'asc',
  },
};

<TableWidget 
  config={sortableTableConfig} 
  bindings={{ value: users }} 
/>
```

## Table with Filtering

```typescript
const filterableTableConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    {
      id: 'name',
      label: 'Name',
      field: 'name',
      sortable: true,
      filterable: true,
      filter: { type: 'text' },
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      filterable: true,
      filter: { type: 'text' },
    },
    {
      id: 'role',
      label: 'Role',
      field: 'role',
      filterable: true,
      filter: {
        type: 'select',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
          { label: 'Guest', value: 'guest' },
        ],
      },
    },
    {
      id: 'age',
      label: 'Age',
      field: 'age',
      format: 'number',
      sortable: true,
      filterable: true,
      filter: { type: 'number' },
    },
    {
      id: 'joinDate',
      label: 'Join Date',
      field: 'joinDate',
      format: 'date',
      filterable: true,
      filter: { type: 'date' },
    },
    {
      id: 'activePeriod',
      label: 'Active Period',
      field: 'activePeriod',
      filterable: true,
      filter: { type: 'dateRange' },
    },
  ],
  rowKey: 'id',
  sorting: {
    enabled: true,
  },
  filtering: {
    enabled: true,
  },
};

<TableWidget 
  config={filterableTableConfig} 
  bindings={{ value: users }} 
/>
```

### Date and Date Range Filters

Date filters use a calendar picker for easy date selection:

```typescript
// Single date filter
{
  id: 'joinDate',
  label: 'Join Date',
  field: 'joinDate',
  format: 'date',
  filterable: true,
  filter: { type: 'date' },
}

// Date range filter
{
  id: 'activePeriod',
  label: 'Active Period',
  field: 'activePeriod',
  filterable: true,
  filter: { type: 'dateRange' },
}
```

## Table with Row Selection

```typescript
const selectableTableConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    { id: 'name', label: 'Name', field: 'name' },
    { id: 'email', label: 'Email', field: 'email' },
  ],
  rowKey: 'id',
  selection: {
    enabled: true,
    multiSelect: true,
  },
};

<TableWidget 
  config={selectableTableConfig} 
  bindings={{ value: users }}
  events={{
    onRowSelect: (selectedKeys) => {
      console.log('Selected rows:', selectedKeys);
    },
  }}
/>
```

## Table with Row Actions

```typescript
const tableWithActionsConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    { id: 'name', label: 'Name', field: 'name' },
    { id: 'email', label: 'Email', field: 'email' },
  ],
  rowKey: 'id',
  rowActions: [
    { id: 'edit', label: 'Edit', actionId: 'edit-user' },
    { id: 'delete', label: 'Delete', actionId: 'delete-user' },
    { id: 'view', label: 'View Details', actionId: 'view-user' },
  ],
};

<TableWidget 
  config={tableWithActionsConfig} 
  bindings={{ value: users }}
  events={{
    onRowAction: ({ action, row }) => {
      if (action === 'edit-user') {
        handleEdit(row);
      } else if (action === 'delete-user') {
        handleDelete(row);
      } else if (action === 'view-user') {
        handleView(row);
      }
    },
  }}
/>
```

## Table with Bulk Actions

```typescript
const tableWithBulkActionsConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    { id: 'name', label: 'Name', field: 'name' },
    { id: 'email', label: 'Email', field: 'email' },
    { id: 'status', label: 'Status', field: 'status' },
  ],
  rowKey: 'id',
  selection: {
    enabled: true,
    multiSelect: true,
  },
  bulkActions: [
    { id: 'delete-all', label: 'Delete Selected', actionId: 'bulk-delete' },
    { id: 'activate-all', label: 'Activate Selected', actionId: 'bulk-activate' },
    { id: 'deactivate-all', label: 'Deactivate Selected', actionId: 'bulk-deactivate' },
  ],
};

<TableWidget 
  config={tableWithBulkActionsConfig} 
  bindings={{ value: users }}
  events={{
    onBulkAction: ({ action, rows }) => {
      if (action === 'bulk-delete') {
        handleBulkDelete(rows);
      } else if (action === 'bulk-activate') {
        handleBulkActivate(rows);
      } else if (action === 'bulk-deactivate') {
        handleBulkDeactivate(rows);
      }
    },
  }}
/>
```

## Table with Column Visibility

```typescript
const tableWithColumnConfigConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    { id: 'name', label: 'Name', field: 'name', defaultVisible: true },
    { id: 'email', label: 'Email', field: 'email', defaultVisible: true },
    { id: 'phone', label: 'Phone', field: 'phone', defaultVisible: false },
    { id: 'address', label: 'Address', field: 'address', defaultVisible: false },
  ],
  rowKey: 'id',
  columnConfig: {
    visibility: true,
  },
};

<TableWidget 
  config={tableWithColumnConfigConfig} 
  bindings={{ value: users }}
/>
```

## Table with Data Export

```typescript
const exportableTableConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    { id: 'name', label: 'Name', field: 'name' },
    { id: 'email', label: 'Email', field: 'email' },
    { id: 'age', label: 'Age', field: 'age', format: 'number' },
  ],
  rowKey: 'id',
  export: {
    csv: true,
    filename: 'users-export.csv',
  },
};

<TableWidget 
  config={exportableTableConfig} 
  bindings={{ value: users }}
/>
```

## Complete Advanced Table Example

```typescript
const advancedTableConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    {
      id: 'name',
      label: 'Name',
      field: 'name',
      width: 200,
      sortable: true,
      filterable: true,
      filter: { type: 'text' },
    },
    {
      id: 'email',
      label: 'Email',
      field: 'email',
      sortable: true,
      filterable: true,
      filter: { type: 'text' },
    },
    {
      id: 'role',
      label: 'Role',
      field: 'role',
      filterable: true,
      filter: {
        type: 'select',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
          { label: 'Guest', value: 'guest' },
        ],
      },
    },
    {
      id: 'age',
      label: 'Age',
      field: 'age',
      format: 'number',
      align: 'center',
      sortable: true,
      filterable: true,
      filter: { type: 'number' },
    },
    {
      id: 'salary',
      label: 'Salary',
      field: 'salary',
      format: 'currency',
      formatOptions: { currency: 'USD' },
      align: 'right',
      sortable: true,
      defaultVisible: false,
    },
  ],
  rowKey: 'id',
  striped: true,
  hoverable: true,
  pagination: {
    enabled: true,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  sorting: {
    enabled: true,
    defaultField: 'name',
    defaultDirection: 'asc',
  },
  filtering: {
    enabled: true,
  },
  selection: {
    enabled: true,
    multiSelect: true,
  },
  rowActions: [
    { id: 'edit', label: 'Edit', actionId: 'edit-user' },
    { id: 'delete', label: 'Delete', actionId: 'delete-user' },
  ],
  bulkActions: [
    { id: 'delete-all', label: 'Delete Selected', actionId: 'bulk-delete' },
    { id: 'export-selected', label: 'Export Selected', actionId: 'bulk-export' },
  ],
  columnConfig: {
    visibility: true,
  },
  export: {
    csv: true,
    filename: 'users-export.csv',
  },
};

<TableWidget 
  config={advancedTableConfig} 
  bindings={{ value: users }}
  events={{
    onClick: (row) => console.log('Row clicked:', row),
    onRowSelect: (selectedKeys) => console.log('Selected:', selectedKeys),
    onRowAction: ({ action, row }) => handleRowAction(action, row),
    onBulkAction: ({ action, rows }) => handleBulkAction(action, rows),
  }}
/>
```

## Server-Side Data Loading

For server-side pagination, sorting, and filtering:

```typescript
const serverSideTableConfig: TableWidgetConfig = {
  id: 'users-table',
  type: 'Table',
  columns: [
    { id: 'name', label: 'Name', field: 'name', sortable: true, filterable: true },
    { id: 'email', label: 'Email', field: 'email', sortable: true, filterable: true },
  ],
  rowKey: 'id',
  pagination: {
    enabled: true,
    serverSide: true,
    pageSize: 20,
    totalRows: 500, // Total rows from server
    currentPage: 0,
  },
  sorting: {
    enabled: true,
    serverSide: true,
  },
  filtering: {
    enabled: true,
    serverSide: true,
  },
};

<TableWidget 
  config={serverSideTableConfig} 
  bindings={{ value: currentPageData }} // Only current page data
  events={{
    onPageChange: async (pagination) => {
      // Fetch new page from server
      const data = await fetchUsers({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
      setCurrentPageData(data.results);
    },
    onSortChange: async (sorting) => {
      // Fetch sorted data from server
      const data = await fetchUsers({
        sortField: sorting[0]?.id,
        sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
      });
      setCurrentPageData(data.results);
    },
    onFilterChange: async (filters) => {
      // Fetch filtered data from server
      const data = await fetchUsers({
        filters: filters,
      });
      setCurrentPageData(data.results);
    },
  }}
/>
```

## Configuration Options

### TableWidgetConfig

```typescript
interface TableWidgetConfig {
  // Basic table config
  id: string;
  type: 'Table';
  columns: TableColumn[];
  rowKey: string;
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
  caption?: string;

  // Advanced features
  pagination?: PaginationConfig;
  sorting?: SortConfig;
  filtering?: FilterConfig;
  selection?: SelectionConfig;
  rowActions?: RowAction[];
  bulkActions?: BulkAction[];
  columnConfig?: ColumnConfig;
  export?: ExportConfig;
}
```

### Column Configuration

```typescript
interface TableColumn {
  id: string;
  label: string;
  field: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'currency' | 'date';
  formatOptions?: ColumnFormatOptions;
  
  // Advanced features
  sortable?: boolean;
  filterable?: boolean;
  filter?: ColumnFilter;
  resizable?: boolean;
  pinnable?: boolean;
  defaultVisible?: boolean;
}
```

### Events

```typescript
events={{
  onClick?: (row: Record<string, unknown>) => void;
  onRowSelect?: (selectedKeys: string[]) => void;
  onRowAction?: ({ action, row }) => void;
  onBulkAction?: ({ action, rows }) => void;
  onPageChange?: (pagination: PaginationState) => void;
  onSortChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState) => void;
}}
```

## Best Practices

1. **Performance**: For large datasets (1000+ rows), use server-side pagination
2. **User Experience**: Always provide pagination for datasets with more than 50 rows
3. **Accessibility**: Use semantic column names and provide a table caption
4. **Mobile**: Consider hiding less important columns by default for mobile views
5. **Filtering**: Use select filters for columns with limited distinct values
6. **Sorting**: Enable sorting on columns that users frequently search by
7. **Export**: Always provide data export for tables with important business data

## Future Enhancements (Phase 6)

- Virtualized scrolling for ultra-large datasets (1000+ rows)
- Column resizing with drag handles
- Column reordering with drag-and-drop
- Column pinning (freeze left/right columns)
- Advanced filter combinations (AND/OR logic)
- Excel export support
- Custom cell renderers
