/**
 * Advanced TableWidget Demo
 *
 * Demonstrates all advanced features of the TableWidget including:
 * - Pagination
 * - Sorting
 * - Filtering
 * - Row selection
 * - Row actions
 * - Bulk actions
 * - Column visibility
 * - Data export
 */

import { useState } from 'react';
import { TableWidget } from '@/widgets/TableWidget';
import type { TableWidgetConfig } from '@/widgets/TableWidget/types';

// Generate sample data
const generateUsers = (count: number) => {
  const roles = ['Admin', 'User', 'Guest'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: roles[i % 3],
    department: departments[i % 5],
    age: 20 + (i % 40),
    salary: 50000 + i * 1000,
    status:
      i % 4 === 0 ? 'Active' : i % 4 === 1 ? 'Inactive' : i % 4 === 2 ? 'Pending' : 'Suspended',
    joinDate: new Date(2020 + (i % 4), i % 12, (i % 28) + 1).toISOString(),
  }));
};

export default function TableAdvancedDemo() {
  const [users] = useState(() => generateUsers(100));
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setActionLog(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)]);
  };

  // Advanced table configuration
  const advancedTableConfig: TableWidgetConfig = {
    id: 'advanced-users-table',
    type: 'Table',
    columns: [
      {
        id: 'name',
        label: 'Name',
        field: 'name',
        width: 150,
        sortable: true,
        filterable: true,
        filter: { type: 'text' },
      },
      {
        id: 'email',
        label: 'Email',
        field: 'email',
        width: 200,
        sortable: true,
        filterable: true,
        filter: { type: 'text' },
      },
      {
        id: 'role',
        label: 'Role',
        field: 'role',
        width: 100,
        sortable: true,
        filterable: true,
        filter: {
          type: 'select',
          options: [
            { label: 'Admin', value: 'Admin' },
            { label: 'User', value: 'User' },
            { label: 'Guest', value: 'Guest' },
          ],
        },
      },
      {
        id: 'department',
        label: 'Department',
        field: 'department',
        width: 120,
        sortable: true,
        filterable: true,
        filter: {
          type: 'select',
          options: [
            { label: 'Engineering', value: 'Engineering' },
            { label: 'Marketing', value: 'Marketing' },
            { label: 'Sales', value: 'Sales' },
            { label: 'HR', value: 'HR' },
            { label: 'Finance', value: 'Finance' },
          ],
        },
      },
      {
        id: 'age',
        label: 'Age',
        field: 'age',
        width: 80,
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
        width: 120,
        format: 'currency',
        formatOptions: { currency: 'USD' },
        align: 'right',
        sortable: true,
        defaultVisible: false,
      },
      {
        id: 'status',
        label: 'Status',
        field: 'status',
        width: 100,
        sortable: true,
        filterable: true,
        filter: {
          type: 'select',
          options: [
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Suspended', value: 'Suspended' },
          ],
        },
      },
      {
        id: 'joinDate',
        label: 'Join Date',
        field: 'joinDate',
        width: 120,
        format: 'date',
        formatOptions: { dateFormat: 'yyyy-MM-dd' },
        sortable: true,
        defaultVisible: false,
      },
    ],
    rowKey: 'id',
    striped: true,
    hoverable: true,
    caption: 'User Management Table - Advanced Features Demo',

    // Pagination
    pagination: {
      enabled: true,
      pageSize: 10,
      pageSizeOptions: [5, 10, 20, 50],
    },

    // Sorting
    sorting: {
      enabled: true,
      defaultField: 'name',
      defaultDirection: 'asc',
    },

    // Filtering
    filtering: {
      enabled: true,
    },

    // Row selection
    selection: {
      enabled: true,
      multiSelect: true,
    },

    // Row actions
    rowActions: [
      { id: 'view', label: 'View Details', actionId: 'view-user' },
      { id: 'edit', label: 'Edit User', actionId: 'edit-user' },
      { id: 'activate', label: 'Activate', actionId: 'activate-user' },
      { id: 'deactivate', label: 'Deactivate', actionId: 'deactivate-user' },
      { id: 'delete', label: 'Delete User', actionId: 'delete-user' },
    ],

    // Bulk actions
    bulkActions: [
      { id: 'delete-all', label: 'Delete Selected', actionId: 'bulk-delete' },
      { id: 'activate-all', label: 'Activate Selected', actionId: 'bulk-activate' },
      { id: 'deactivate-all', label: 'Deactivate Selected', actionId: 'bulk-deactivate' },
      { id: 'export-selected', label: 'Export Selected', actionId: 'bulk-export' },
    ],

    // Column configuration
    columnConfig: {
      visibility: true,
    },

    // Export
    export: {
      csv: true,
      filename: 'users-export.csv',
    },
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Advanced TableWidget Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating pagination, sorting, filtering, row selection, row actions, bulk actions,
          column visibility, and CSV export.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="font-semibold mb-2">📄 Pagination</h3>
          <p className="text-sm text-muted-foreground">
            Navigate through pages with customizable page sizes
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="font-semibold mb-2">🔄 Sorting</h3>
          <p className="text-sm text-muted-foreground">
            Click column headers to sort ascending/descending
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="font-semibold mb-2">🔍 Filtering</h3>
          <p className="text-sm text-muted-foreground">
            Filter columns with text, select, and number filters
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="font-semibold mb-2">✅ Selection</h3>
          <p className="text-sm text-muted-foreground">Select rows individually or all at once</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="font-semibold mb-2">⚡ Row Actions</h3>
          <p className="text-sm text-muted-foreground">
            Access row-specific actions from dropdown menu
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="font-semibold mb-2">🎯 Bulk Actions</h3>
          <p className="text-sm text-muted-foreground">Perform actions on multiple selected rows</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="font-semibold mb-2">👁️ Column Visibility</h3>
          <p className="text-sm text-muted-foreground">Show/hide columns using the Columns menu</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="font-semibold mb-2">💾 Export</h3>
          <p className="text-sm text-muted-foreground">Export table data to CSV format</p>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">User Management Table</h2>

        <TableWidget
          config={advancedTableConfig}
          bindings={{ value: users }}
          events={{
            onClick: row => {
              addLog(`Row clicked: ${row.name}`);
            },
            onRowSelect: selectedKeys => {
              setSelectedRows(selectedKeys);
              addLog(`Selected ${selectedKeys.length} row(s)`);
            },
            onRowAction: ({ action, row }) => {
              addLog(`Action "${action}" on ${row.name}`);
            },
            onBulkAction: ({ action, rows }) => {
              addLog(`Bulk action "${action}" on ${rows.length} row(s)`);
            },
            onPageChange: pagination => {
              addLog(`Page changed to ${pagination.pageIndex + 1}, size: ${pagination.pageSize}`);
            },
            onSortChange: sorting => {
              if (sorting.length > 0) {
                addLog(`Sorted by ${sorting[0].id} ${sorting[0].desc ? 'desc' : 'asc'}`);
              }
            },
            onFilterChange: filters => {
              addLog(`Filters updated: ${filters.length} active filter(s)`);
            },
          }}
        />
      </div>

      {/* Action Log */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Action Log</h2>
        <div className="space-y-2">
          {actionLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Interact with the table to see logged events here
            </p>
          ) : (
            actionLog.map(log => (
              <div key={log} className="text-sm font-mono p-2 bg-muted rounded">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-card text-center">
          <div className="text-3xl font-bold text-primary">{users.length}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        <div className="p-4 border rounded-lg bg-card text-center">
          <div className="text-3xl font-bold text-primary">{selectedRows.length}</div>
          <div className="text-sm text-muted-foreground">Selected Rows</div>
        </div>
        <div className="p-4 border rounded-lg bg-card text-center">
          <div className="text-3xl font-bold text-primary">{actionLog.length}</div>
          <div className="text-sm text-muted-foreground">Actions Logged</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Usage Tips</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Click column headers with sort icons to sort data</li>
          <li>Click filter icons in column headers to apply filters</li>
          <li>Use checkboxes to select rows individually or all at once</li>
          <li>Click the three-dot menu in each row for row-specific actions</li>
          <li>When rows are selected, bulk action buttons appear in the toolbar</li>
          <li>
            Use the "Columns" menu to show/hide columns (Salary and Join Date are hidden by default)
          </li>
          <li>Click "Export CSV" to download the table data</li>
          <li>Change page size using the dropdown at the bottom of the table</li>
          <li>Navigate between pages using First/Previous/Next/Last buttons</li>
        </ul>
      </div>
    </div>
  );
}
