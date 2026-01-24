# Sample Page Configurations

**Version:** 1.0  
**Status:** Complete  
**Last Updated:** January 24, 2026  
**Issue:** #027

---

## Overview

This document describes the comprehensive sample page configurations created for OpenPortal to demonstrate the platform's capabilities and serve as templates for future development. These configurations showcase:

- **Layout widgets**: Page, Section, Grid, Card
- **Form widgets**: TextInput, Select, DatePicker, Checkbox
- **Data display widgets**: Table, KPI
- **Dialog widgets**: Modal, Toast
- **Data binding**: Datasource integration
- **Actions**: CRUD operations, navigation, state management

---

## Sample Pages

### 1. Dashboard Page (`dashboard-enhanced`)

**Route:** `/dashboard`  
**Page ID:** `dashboard-enhanced`  
**Permissions:** `dashboard.view`

#### Purpose
Demonstrates a modern dashboard with KPIs, data tables, and real-time metrics visualization.

#### Features
- ✅ Grid layout with 12-column system
- ✅ Four KPI cards with trend indicators
- ✅ Recent activity table with sorting
- ✅ Multiple datasources (metrics, activity)
- ✅ Click actions on KPI cards for drill-down
- ✅ Auto-refresh datasources
- ✅ Responsive design

#### Widgets Used
- **Page**: Root container with title and padding
- **Section**: Two sections (Key Metrics, Recent Activity)
- **Grid**: 12-column layout for KPI cards
- **KPI**: Four metric cards with different formats
  - Total Users (number format)
  - Monthly Revenue (currency format, USD)
  - Active Tasks (number format)
  - Conversion Rate (percent format)
- **Table**: Recent activity with sorting and pagination

#### Datasources
```json
[
  {
    "id": "metrics",
    "type": "http",
    "config": {
      "url": "/api/dashboard/metrics",
      "method": "GET",
      "autoLoad": true
    }
  },
  {
    "id": "recentActivity",
    "type": "http",
    "config": {
      "url": "/api/dashboard/recent-activity",
      "method": "GET",
      "autoLoad": true
    }
  }
]
```

#### Expected API Response Structure

**Metrics Endpoint** (`/api/dashboard/metrics`):
```json
{
  "data": {
    "totalUsers": 1234,
    "usersTrend": {
      "direction": "up",
      "value": "+12%"
    },
    "revenue": 45678,
    "revenueTrend": {
      "direction": "up",
      "value": "+8%"
    },
    "activeTasks": 42,
    "tasksTrend": {
      "direction": "neutral",
      "value": "0%"
    },
    "conversionRate": 0.24,
    "conversionTrend": {
      "direction": "up",
      "value": "+3%"
    }
  }
}
```

**Recent Activity Endpoint** (`/api/dashboard/recent-activity`):
```json
{
  "data": [
    {
      "id": "act-1",
      "userName": "John Doe",
      "action": "Created new task",
      "timestamp": "2026-01-24T10:30:00Z",
      "status": "completed"
    },
    {
      "id": "act-2",
      "userName": "Jane Smith",
      "action": "Updated profile",
      "timestamp": "2026-01-24T09:15:00Z",
      "status": "completed"
    }
  ]
}
```

#### Actions
- `showUserDetails`: Navigate to `/users` when Total Users KPI clicked
- `showRevenueDetails`: Navigate to `/reports/revenue` when Revenue KPI clicked

---

### 2. Profile Page (`profile`)

**Route:** `/profile`  
**Page ID:** `profile`  
**Permissions:** None (accessible to all authenticated users)

#### Purpose
User profile editing form demonstrating form inputs, validation, and data persistence.

#### Features
- ✅ Card layout for visual organization
- ✅ Grid-based form layout (6-column span for inputs)
- ✅ Multiple input types (text, email, tel)
- ✅ Select dropdown with timezone options
- ✅ Checkbox for newsletter subscription
- ✅ Form validation (required fields)
- ✅ Save action with success/error toasts
- ✅ Icon integration in inputs
- ✅ Help text for user guidance

#### Widgets Used
- **Page**: Root container
- **Section**: Profile Information section
- **Card**: Profile card container
- **Grid**: 12-column form layout
- **TextInput**: Name, email, phone (with icons)
- **Select**: Timezone selection with search
- **Checkbox**: Newsletter subscription
- **Button**: Save Changes button

#### Datasources
```json
[
  {
    "id": "userProfile",
    "type": "http",
    "config": {
      "url": "/api/users/me",
      "method": "GET",
      "autoLoad": true
    }
  }
]
```

#### Expected API Response Structure

**User Profile Endpoint** (`/api/users/me`):
```json
{
  "data": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "timezone": "America/New_York",
    "newsletter": true
  }
}
```

#### Actions
- `updateProfileField`: Updates local state as user types
- `saveProfile`: Executes backend action `user.updateProfile`
  - Sends updated profile data to backend
  - Shows success toast on completion
  - Shows error toast on failure
- `showSuccessToast`: Displays success notification
- `showErrorToast`: Displays error notification

#### Backend Action Required
The configuration expects a backend action handler named `user.updateProfile`:
```typescript
{
  id: 'user.updateProfile',
  type: 'executeAction',
  params: {
    actionId: 'updateRecord',
    collection: 'users',
    id: '{{user.id}}',
    data: '{{params.data}}'
  }
}
```

---

### 3. Listings Page (`listings`)

**Route:** `/listings`  
**Page ID:** `listings`  
**Permissions:** `items.view`

#### Purpose
Comprehensive CRUD interface demonstrating table operations, modals, and bulk actions.

#### Features
- ✅ Toolbar with Add New and Refresh actions
- ✅ Data table with sorting, filtering, pagination
- ✅ Server-side pagination and sorting
- ✅ Row-level actions (View, Edit, Delete)
- ✅ Bulk actions (Delete selected)
- ✅ Add/Edit modal with form
- ✅ Delete confirmation modal
- ✅ Category and status dropdowns
- ✅ Currency formatting for price column
- ✅ Date formatting for created column
- ✅ Empty state message
- ✅ Toast notifications for actions

#### Widgets Used
- **Page**: Root container
- **Section**: Listings section
- **Toolbar**: Action bar with Add New and Refresh buttons
- **Table**: Data table with 5 columns, actions, pagination
- **Modal**: Two modals (Add/Edit form, Delete confirmation)
- **Grid**: Form layout inside modal
- **TextInput**: Item name and price inputs
- **Select**: Category and status dropdowns
- **Text**: Delete confirmation message

#### Datasources
```json
[
  {
    "id": "items",
    "type": "http",
    "config": {
      "url": "/api/items",
      "method": "GET",
      "autoLoad": true,
      "params": {
        "page": "{{state.currentPage || 1}}",
        "pageSize": 25,
        "sort": "{{state.sortField}}",
        "sortDirection": "{{state.sortDirection}}"
      }
    }
  }
]
```

#### Expected API Response Structure

**Items Endpoint** (`/api/items`):
```json
{
  "data": {
    "items": [
      {
        "id": "item-1",
        "name": "Laptop Computer",
        "category": "electronics",
        "status": "active",
        "price": 999.99,
        "createdAt": "2026-01-15T10:00:00Z"
      },
      {
        "id": "item-2",
        "name": "Running Shoes",
        "category": "sports",
        "status": "active",
        "price": 129.99,
        "createdAt": "2026-01-20T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "totalCount": 150,
      "totalPages": 6
    }
  }
}
```

#### Actions

**Modal Management:**
- `openAddModal`: Opens modal in "add" mode with empty form
- `editItem`: Opens modal in "edit" mode with selected item data
- `deleteItem`: Opens delete confirmation modal
- `closeModal`: Closes add/edit modal
- `closeDeleteModal`: Closes delete confirmation modal

**Data Operations:**
- `saveItem`: Saves item (create or update based on mode)
  - Calls `item.create` or `item.update` backend action
  - Chains to `afterSave` on success
- `confirmDelete`: Deletes item
  - Calls `item.delete` backend action
  - Chains to `afterDelete` on success

**Data Refresh:**
- `refreshListings`: Refreshes items datasource
- `loadItemsPage`: Updates current page and refreshes data
- `sortItems`: Updates sort field/direction

**Action Chains:**
- `afterSave`: Closes modal → Refreshes data → Shows success toast
- `afterDelete`: Closes modal → Refreshes data → Shows success toast

**Action Routing:**
- `handleRowAction`: Routes row actions (view/edit/delete) to appropriate handlers
- `handleBulkAction`: Routes bulk actions to handlers

#### Backend Actions Required

The configuration expects these backend action handlers:

1. **item.create**:
```typescript
{
  id: 'item.create',
  type: 'executeAction',
  params: {
    actionId: 'createRecord',
    collection: 'items',
    data: '{{params.data}}'
  }
}
```

2. **item.update**:
```typescript
{
  id: 'item.update',
  type: 'executeAction',
  params: {
    actionId: 'updateRecord',
    collection: 'items',
    id: '{{params.data.id}}',
    data: '{{params.data}}'
  }
}
```

3. **item.delete**:
```typescript
{
  id: 'item.delete',
  type: 'executeAction',
  params: {
    actionId: 'deleteRecord',
    collection: 'items',
    id: '{{params.data.id}}'
  }
}
```

---

## Menu Configuration

The sample configurations include updated menu items for both user and admin roles:

### User Menu
```json
{
  "items": [
    { "id": "home", "label": "Home", "icon": "home", "path": "/" },
    { "id": "dashboard", "label": "Dashboard", "icon": "dashboard", "path": "/dashboard" },
    { "id": "profile", "label": "Profile", "icon": "user", "path": "/profile" },
    { "id": "listings", "label": "Listings", "icon": "list", "path": "/listings" },
    { "id": "users", "label": "Users", "icon": "users", "path": "/users" },
    { "id": "settings", "label": "Settings", "icon": "settings", "path": "/settings" }
  ]
}
```

### Admin Menu
Includes all user menu items plus:
```json
{
  "id": "admin",
  "label": "Administration",
  "icon": "admin",
  "path": "/admin",
  "children": [
    { "id": "admin-users", "label": "Manage Users", "path": "/admin/users" },
    { "id": "admin-settings", "label": "System Settings", "path": "/admin/settings" }
  ]
}
```

---

## Route Configurations

Added route configurations for the new pages:

```json
[
  {
    "pattern": "/profile",
    "pageId": "profile",
    "permissions": [],
    "exact": true,
    "metadata": { "title": "User Profile" }
  },
  {
    "pattern": "/listings",
    "pageId": "listings",
    "permissions": ["items.view"],
    "exact": true,
    "metadata": { "title": "Listings" }
  }
]
```

---

## Configuration Best Practices

These sample configurations demonstrate several best practices:

### 1. Widget Composition
- Use Grid for flexible layouts
- Nest widgets logically (Page → Section → Card → Form)
- Use layoutProps for responsive grid spans

### 2. Data Binding
- Bind to datasource data using `{{datasources.id.data.field}}`
- Use state for transient UI state: `{{state.fieldName}}`
- Bind complex objects for forms

### 3. Action Chaining
- Use `onSuccess` and `onError` for async actions
- Chain actions with `type: 'chain'`
- Close modals after successful operations
- Always show user feedback (toasts)

### 4. Form Handling
- Group related inputs in Grid
- Use appropriate input types (email, tel, number)
- Add icons for visual guidance
- Provide help text where needed
- Mark required fields

### 5. Table Configuration
- Enable server-side operations for large datasets
- Provide row-level actions
- Show empty states
- Configure sorting defaults
- Use format options for columns (currency, date)

### 6. Modal Patterns
- Use size prop appropriately (sm for confirmations, md for forms)
- Provide both Cancel and Primary actions
- Close on backdrop for dismissible modals
- Disable backdrop close for critical forms

### 7. State Management
- Use `updateState` action for local state
- Separate modal state from data state
- Track current page, sort, filters in state
- Clear state when closing modals

---

## Implementation Notes

### Backend Requirements

To fully support these configurations, the backend must provide:

1. **API Endpoints**:
   - `GET /api/dashboard/metrics` - Dashboard metrics
   - `GET /api/dashboard/recent-activity` - Recent activity log
   - `GET /api/users/me` - Current user profile
   - `GET /api/items` - Items list with pagination/sorting
   - Plus CRUD endpoints for users and items

2. **Action Handlers** (Already implemented in ISSUE-026):
   - `createRecord` - Create new record
   - `updateRecord` - Update existing record
   - `deleteRecord` - Delete record
   - `bulkDelete` - Delete multiple records
   - `executeQuery` - Query with filters

3. **Permissions**:
   - `dashboard.view` - View dashboard
   - `items.view` - View listings
   - `items.create` - Create items
   - `items.update` - Update items
   - `items.delete` - Delete items

### Frontend Requirements

The frontend renderer must support:

1. **Widget Types**:
   - ✅ Page, Section, Grid, Card (Layout)
   - ✅ TextInput, Select, DatePicker, Checkbox (Forms)
   - ✅ Table, KPI (Data Display)
   - ✅ Modal, Toast (Dialogs)
   - ⏳ Button, Toolbar, Text (Additional - to be implemented)

2. **Data Binding Engine**:
   - Resolve `{{datasources.id.data.field}}` expressions
   - Resolve `{{state.field}}` expressions
   - Support nested object paths
   - Handle conditional expressions

3. **Action Executor**:
   - Execute configured actions
   - Handle action chaining
   - Support onSuccess/onError handlers
   - Manage action context (user, event data)

---

## Testing Checklist

### Dashboard Page
- [ ] Page loads with correct title
- [ ] Four KPI cards render with values
- [ ] KPI trends display correctly
- [ ] Recent activity table shows data
- [ ] Table sorting works
- [ ] KPI click actions navigate correctly

### Profile Page
- [ ] Page loads user profile data
- [ ] All form fields populate correctly
- [ ] Text inputs accept input
- [ ] Timezone select is searchable
- [ ] Newsletter checkbox toggles
- [ ] Save button triggers update
- [ ] Success toast appears on save
- [ ] Error toast appears on failure

### Listings Page
- [ ] Page loads items table
- [ ] Table displays all columns correctly
- [ ] Add New button opens modal
- [ ] Refresh button reloads data
- [ ] Row Edit action opens modal with data
- [ ] Row Delete action opens confirmation
- [ ] Modal form accepts input
- [ ] Save in modal creates/updates item
- [ ] Delete confirmation deletes item
- [ ] Success toasts appear after operations
- [ ] Table pagination works
- [ ] Table sorting works
- [ ] Server-side operations trigger correctly

---

## Future Enhancements

### Additional Widgets to Demonstrate
- **Chart**: For dashboard trend visualization
- **FileUpload**: For profile avatar upload
- **DateRangePicker**: For filtering by date range
- **Tabs**: For organizing profile sections
- **Breadcrumbs**: For navigation hierarchy
- **Badge**: For status indicators
- **ProgressBar**: For completion tracking

### Additional Actions to Demonstrate
- **Navigation**: Forward/back, external links
- **File Operations**: Upload, download
- **Batch Operations**: Export, import
- **Email**: Send notifications
- **Webhooks**: Trigger external services

### Advanced Features
- **Conditional Rendering**: Show/hide based on permissions
- **Dynamic Forms**: Forms that adapt based on selections
- **Real-time Updates**: WebSocket integration
- **Optimistic Updates**: Update UI before server response
- **Undo/Redo**: For destructive operations
- **Drag and Drop**: For reordering

---

## Conclusion

These sample configurations provide a comprehensive foundation for building OpenPortal applications. They demonstrate:

1. **Complete CRUD workflows** - Create, read, update, delete
2. **Data binding patterns** - Datasources, state, events
3. **User feedback** - Toasts, modals, loading states
4. **Responsive design** - Grid layouts, mobile-friendly
5. **Permission handling** - Route and action permissions
6. **Best practices** - Action chaining, error handling, validation

Developers can use these as templates for building new pages, extending functionality, and learning the platform's patterns.

---

**Last Updated:** January 24, 2026  
**Author:** OpenPortal Development Team  
**Issue:** #027 - Sample Page Configurations
