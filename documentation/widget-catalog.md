# Widget Catalog

## Overview

This document defines the widget taxonomy for the OpenPortal platform. Each widget is a reusable, configurable component with a stable contract.

---

## Widget Categories

### 1. Layout & Structure
### 2. Form Inputs
### 3. Data Display
### 4. Navigation
### 5. Dialogs & Overlays
### 6. Feedback & Status

---

## 1. Layout & Structure Widgets

### Page
Top-level container for all page content.

**Type:** `Page`

**Props:**
```typescript
{
  title?: string;
  description?: string;
  theme?: object;
  padding?: "none" | "sm" | "md" | "lg";
}
```

**Events:**
- `onLoad` - Fires when page mounts

---

### Section
Groups related content with optional title and border.

**Type:** `Section`

**Props:**
```typescript
{
  title?: string;
  subtitle?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  bordered?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}
```

**Events:**
- `onExpand` - When section is expanded
- `onCollapse` - When section is collapsed

---

### Grid
Responsive grid layout container.

**Type:** `Grid`

**Props:**
```typescript
{
  columns?: number; // Default: 12
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  responsive?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}
```

**Children:** Each child can have layout props:
```typescript
{
  span?: number; // Column span
  offset?: number;
  order?: number;
}
```

---

### Card
Content container with optional header, footer, and actions.

**Type:** `Card`

**Props:**
```typescript
{
  title?: string;
  subtitle?: string;
  image?: string;
  elevation?: "none" | "sm" | "md" | "lg";
  bordered?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  actions?: Array<{
    id: string;
    label: string;
    actionId: string;
  }>;
}
```

**Events:**
- `onActionClick` - When action button clicked

---

### Tabs
Tabbed content container.

**Type:** `Tabs`

**Props:**
```typescript
{
  defaultTabId?: string;
  orientation?: "horizontal" | "vertical";
  tabs: Array<{
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
  }>;
}
```

**Children:** Each child corresponds to a tab panel

**Events:**
- `onTabChange` - When active tab changes

---

### Toolbar
Action bar with buttons and controls.

**Type:** `Toolbar`

**Props:**
```typescript
{
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end" | "spaceBetween";
  actions: Array<{
    id: string;
    label: string;
    icon?: string;
    variant?: "primary" | "secondary" | "text";
    actionId: string;
  }>;
}
```

**Events:**
- `onActionClick` - When toolbar action clicked

---

## 2. Form Input Widgets

### TextInput
Single-line text input field.

**Type:** `TextInput`

**Props:**
```typescript
{
  label?: string;
  placeholder?: string;
  helpText?: string;
  type?: "text" | "email" | "url" | "tel" | "search";
  maxLength?: number;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  icon?: string;
  iconPosition?: "start" | "end";
}
```

**Bindings:**
- `value` - Current input value

**Events:**
- `onChange` - When value changes
- `onBlur` - When focus leaves
- `onFocus` - When focus enters
- `onEnter` - When Enter key pressed

---

### Textarea
Multi-line text input.

**Type:** `Textarea`

**Props:**
```typescript
{
  label?: string;
  placeholder?: string;
  helpText?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autoResize?: boolean;
}
```

**Bindings:**
- `value` - Current text value

**Events:**
- `onChange`
- `onBlur`
- `onFocus`

---

### Select
Dropdown selection field.

**Type:** `Select`

**Props:**
```typescript
{
  label?: string;
  placeholder?: string;
  helpText?: string;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
    icon?: string;
  }>;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}
```

**Bindings:**
- `value` - Selected value

**Events:**
- `onChange`
- `onSearch` - When search term changes (if searchable)

---

### MultiSelect
Multiple selection dropdown.

**Type:** `MultiSelect`

**Props:**
```typescript
{
  label?: string;
  placeholder?: string;
  helpText?: string;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  maxSelections?: number;
}
```

**Bindings:**
- `value` - Array of selected values

**Events:**
- `onChange`
- `onSearch`

---

### DatePicker
Date selection input.

**Type:** `DatePicker`

**Props:**
```typescript
{
  label?: string;
  placeholder?: string;
  helpText?: string;
  format?: string; // e.g., "YYYY-MM-DD"
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  required?: boolean;
  showTime?: boolean;
}
```

**Bindings:**
- `value` - Selected date (ISO string)

**Events:**
- `onChange`

---

### DateRangePicker
Date range selection.

**Type:** `DateRangePicker`

**Props:**
```typescript
{
  label?: string;
  placeholder?: string;
  helpText?: string;
  format?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  required?: boolean;
}
```

**Bindings:**
- `value` - Object with `start` and `end` dates

**Events:**
- `onChange`

---

### Checkbox
Single checkbox input.

**Type:** `Checkbox`

**Props:**
```typescript
{
  label?: string;
  helpText?: string;
  disabled?: boolean;
  required?: boolean;
}
```

**Bindings:**
- `value` - Boolean checked state

**Events:**
- `onChange`

---

### RadioGroup
Radio button group.

**Type:** `RadioGroup`

**Props:**
```typescript
{
  label?: string;
  helpText?: string;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  required?: boolean;
}
```

**Bindings:**
- `value` - Selected radio value

**Events:**
- `onChange`

---

### Switch
Toggle switch input.

**Type:** `Switch`

**Props:**
```typescript
{
  label?: string;
  helpText?: string;
  disabled?: boolean;
}
```

**Bindings:**
- `value` - Boolean on/off state

**Events:**
- `onChange`

---

### FileUpload
File upload input with drag-and-drop.

**Type:** `FileUpload`

**Props:**
```typescript
{
  label?: string;
  helpText?: string;
  accept?: string; // MIME types
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  uploadUrl?: string;
  showPreview?: boolean;
  disabled?: boolean;
  required?: boolean;
}
```

**Bindings:**
- `value` - Array of file objects

**Events:**
- `onChange`
- `onUploadComplete`
- `onUploadError`

---

### ImagePicker
Image selection with preview and cropping.

**Type:** `ImagePicker`

**Props:**
```typescript
{
  label?: string;
  helpText?: string;
  aspectRatio?: number;
  maxSize?: number;
  allowCrop?: boolean;
  uploadUrl?: string;
  disabled?: boolean;
  required?: boolean;
}
```

**Bindings:**
- `value` - Image URL or file object

**Events:**
- `onChange`
- `onCrop`

---

## 3. Data Display Widgets

### Table
Data table with sorting, filtering, and pagination.

**Type:** `Table`

**Props:**
```typescript
{
  columns: Array<{
    id: string;
    label: string;
    field: string;
    sortable?: boolean;
    width?: number | string;
    align?: "left" | "center" | "right";
    format?: "text" | "number" | "currency" | "date" | "custom";
    formatOptions?: object;
  }>;
  rowKey: string;
  selectable?: boolean;
  multiSelect?: boolean;
  pagination?: {
    enabled: boolean;
    pageSize: number;
    serverSide?: boolean;
  };
  sorting?: {
    enabled: boolean;
    serverSide?: boolean;
    defaultSort?: { field: string; direction: "asc" | "desc" };
  };
  filtering?: {
    enabled: boolean;
    serverSide?: boolean;
  };
  rowActions?: Array<{
    id: string;
    label: string;
    icon?: string;
    actionId: string;
  }>;
  bulkActions?: Array<{
    id: string;
    label: string;
    actionId: string;
  }>;
  emptyMessage?: string;
  loading?: boolean;
}
```

**Bindings:**
- `data` - Array of row data
- `selection` - Selected row(s)
- `pagination` - Current page info
- `sorting` - Current sort state
- `filters` - Current filter state

**Events:**
- `onRowSelect`
- `onRowClick`
- `onRowAction`
- `onBulkAction`
- `onPageChange`
- `onSortChange`
- `onFilterChange`

---

### Chart
Data visualization chart.

**Type:** `Chart`

**Props:**
```typescript
{
  chartType: "line" | "bar" | "pie" | "area" | "scatter";
  height?: number;
  width?: number | string;
  title?: string;
  legend?: {
    show: boolean;
    position: "top" | "bottom" | "left" | "right";
  };
  tooltip?: {
    enabled: boolean;
    format?: string;
  };
  xAxis?: {
    label?: string;
    type?: "category" | "number" | "time";
  };
  yAxis?: {
    label?: string;
    min?: number;
    max?: number;
  };
  colors?: string[];
  stacked?: boolean;
  interactive?: boolean;
}
```

**Bindings:**
- `data` - Chart data series

**Events:**
- `onPointClick`
- `onLegendClick`

---

### KPI
Key performance indicator card.

**Type:** `KPI`

**Props:**
```typescript
{
  label: string;
  format?: "number" | "currency" | "percent";
  formatOptions?: object;
  showTrend?: boolean;
  trendDirection?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}
```

**Bindings:**
- `value` - KPI value
- `trend` - Trend information

**Events:**
- `onClick`

---

### Timeline
Chronological event timeline.

**Type:** `Timeline`

**Props:**
```typescript
{
  orientation?: "vertical" | "horizontal";
  alternating?: boolean; // For vertical timelines
}
```

**Bindings:**
- `data` - Array of timeline items

**Events:**
- `onItemClick`

---

### Badge
Status or count indicator.

**Type:** `Badge`

**Props:**
```typescript
{
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  icon?: string;
}
```

**Bindings:**
- `value` - Badge content

---

## 4. Navigation Widgets

### Breadcrumbs
Hierarchical navigation path.

**Type:** `Breadcrumbs`

**Props:**
```typescript
{
  separator?: string;
  maxItems?: number;
}
```

**Bindings:**
- `items` - Array of breadcrumb items

**Events:**
- `onItemClick`

---

### Pagination
Page navigation controls.

**Type:** `Pagination`

**Props:**
```typescript
{
  variant?: "simple" | "full";
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showTotal?: boolean;
}
```

**Bindings:**
- `page` - Current page
- `pageSize` - Items per page
- `total` - Total item count

**Events:**
- `onPageChange`
- `onPageSizeChange`

---

## 5. Dialogs & Overlays Widgets

### Modal
Modal dialog overlay.

**Type:** `Modal`

**Props:**
```typescript
{
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  closeOnBackdrop?: boolean;
  showFooter?: boolean;
  actions?: Array<{
    id: string;
    label: string;
    variant?: "primary" | "secondary" | "text";
    actionId: string;
  }>;
}
```

**Bindings:**
- `open` - Modal visibility state

**Events:**
- `onClose`
- `onActionClick`

---

### Drawer
Slide-out panel.

**Type:** `Drawer`

**Props:**
```typescript
{
  title?: string;
  position?: "left" | "right" | "top" | "bottom";
  size?: number | string;
  closable?: boolean;
  closeOnBackdrop?: boolean;
}
```

**Bindings:**
- `open` - Drawer visibility

**Events:**
- `onClose`

---

### ConfirmDialog
Confirmation dialog.

**Type:** `ConfirmDialog`

**Props:**
```typescript
{
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
}
```

**Events:**
- `onConfirm`
- `onCancel`

---

## 6. Feedback & Status Widgets

### Toast
Temporary notification message.

**Type:** `Toast`

**Props:**
```typescript
{
  variant: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number; // milliseconds
  closable?: boolean;
  action?: {
    label: string;
    actionId: string;
  };
}
```

**Events:**
- `onClose`
- `onActionClick`

---

### Alert
Persistent alert message.

**Type:** `Alert`

**Props:**
```typescript
{
  variant: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  closable?: boolean;
  icon?: string;
  actions?: Array<{
    label: string;
    actionId: string;
  }>;
}
```

**Events:**
- `onClose`
- `onActionClick`

---

### Spinner
Loading spinner indicator.

**Type:** `Spinner`

**Props:**
```typescript
{
  size?: "sm" | "md" | "lg";
  text?: string;
  overlay?: boolean;
}
```

---

### ProgressBar
Progress indicator.

**Type:** `ProgressBar`

**Props:**
```typescript
{
  variant?: "determinate" | "indeterminate";
  label?: string;
  showPercent?: boolean;
}
```

**Bindings:**
- `value` - Progress value (0-100)

---

## Widget Contract Standards

### All Widgets Must Provide

1. **Unique ID**: Used for state management and event handling
2. **Type**: Widget type identifier
3. **Props Schema**: TypeScript definition of accepted props
4. **Bindings**: Data binding specifications
5. **Events**: List of supported events
6. **Accessibility**: ARIA labels and keyboard navigation
7. **Responsive Behavior**: How widget adapts to screen size
8. **Error States**: How widget displays errors

### Widget Lifecycle

1. **Mount** - Widget receives initial props and bindings
2. **Render** - Widget renders based on current state
3. **Update** - Props/bindings change, widget re-renders
4. **Unmount** - Widget cleanup

### Testing Requirements

Each widget must have:
- Unit tests for component logic
- Integration tests for data binding
- Accessibility tests
- Visual regression tests
- Performance benchmarks

---

**Version:** 1.0
**Last Updated:** January 2026
