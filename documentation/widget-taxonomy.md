# Widget Taxonomy v1

**Version:** 1.0  
**Phase:** Phase 0 - Discovery & Foundation  
**Status:** Draft  
**Last Updated:** January 2026

---

## Overview

This document defines the initial widget taxonomy for the OpenPortal platform, focusing on the 10-15 core widgets required for the Minimum Viable Product (MVP). Each widget is a reusable, configurable component with a stable contract defined through TypeScript interfaces.

The widget taxonomy establishes the foundation for:
- Widget registry implementation
- Component library development
- Configuration schema design
- API contract definitions

---

## Design Principles

### 1. Stable Contracts
Each widget exposes a well-defined interface with:
- **Props**: Configuration options (TypeScript interface)
- **Bindings**: Data connections from backend
- **Events**: User interactions and lifecycle hooks

### 2. Composability
Widgets can be nested and combined to create complex UIs without custom code.

### 3. Configuration-Driven
All widget behavior is controlled via JSON configuration from the backend API.

### 4. Accessibility First
All widgets support WCAG 2.1 Level AA standards with:
- Proper ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management

### 5. Responsive Design
Widgets adapt to different screen sizes and support mobile-first design patterns.

---

## Widget Categories

The core taxonomy organizes widgets into four categories:

1. **Layout & Structure** (4 widgets) - Page composition and organization
2. **Form Inputs** (4 widgets) - Data collection and user input
3. **Data Display** (2 widgets) - Information presentation
4. **Dialogs & Feedback** (2 widgets) - User notifications and modals

**Total: 12 Core Widgets**

---

## 1. Layout & Structure Widgets

### 1.1 Page

Top-level container for all page content. Every rendered page starts with a Page widget.

**Type:** `Page`

**Description:**  
The Page widget serves as the root container for all content. It handles page-level concerns like title, metadata, and global padding.

**Props:**
```typescript
interface PageProps {
  title?: string;           // Page title (displayed in browser tab)
  description?: string;     // Page description for SEO/metadata
  theme?: object;           // Page-specific theme overrides
  padding?: "none" | "sm" | "md" | "lg";  // Global page padding
}
```

**Bindings:**
- None (Page does not bind to dynamic data)

**Events:**
- `onLoad` - Fires when page mounts (useful for analytics, initialization)

**Accessibility:**
- Sets `<title>` element
- Main landmark role on content area
- Skip-to-content link support

**Responsive Behavior:**
- Padding adjusts based on viewport size
- Full-width on mobile, constrained max-width on desktop

**Example Usage:**
```json
{
  "type": "Page",
  "props": {
    "title": "Dashboard",
    "padding": "md"
  },
  "children": [...]
}
```

---

### 1.2 Section

Groups related content with optional title, subtitle, and collapsible behavior.

**Type:** `Section`

**Description:**  
Sections organize page content into logical groups. They can have headers, borders, and support collapsible behavior for progressive disclosure.

**Props:**
```typescript
interface SectionProps {
  title?: string;           // Section heading
  subtitle?: string;        // Secondary text below title
  collapsible?: boolean;    // Can section be collapsed?
  defaultCollapsed?: boolean;  // Initial collapsed state
  bordered?: boolean;       // Show border around section
  padding?: "none" | "sm" | "md" | "lg";  // Internal padding
}
```

**Bindings:**
- None

**Events:**
- `onExpand` - When section is expanded
- `onCollapse` - When section is collapsed

**Accessibility:**
- `<section>` element with `aria-labelledby`
- Expand/collapse button has proper ARIA states
- Keyboard: Space/Enter to toggle

**Responsive Behavior:**
- Stack vertically on mobile
- Padding reduces on smaller screens

**Example Usage:**
```json
{
  "type": "Section",
  "props": {
    "title": "Recent Activity",
    "bordered": true,
    "padding": "md"
  },
  "children": [...]
}
```

---

### 1.3 Grid

Responsive grid layout container based on 12-column system.

**Type:** `Grid`

**Description:**  
The Grid widget provides a flexible, responsive layout system. It uses a 12-column grid by default and supports responsive breakpoints.

**Props:**
```typescript
interface GridProps {
  columns?: number;         // Number of columns (default: 12)
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";  // Space between items
  responsive?: {
    xs?: number;            // Columns on extra-small screens (< 576px)
    sm?: number;            // Columns on small screens (≥ 576px)
    md?: number;            // Columns on medium screens (≥ 768px)
    lg?: number;            // Columns on large screens (≥ 992px)
    xl?: number;            // Columns on extra-large screens (≥ 1200px)
  };
}
```

**Children Layout Props:**
Each child widget can specify layout properties:
```typescript
interface GridItemProps {
  span?: number;            // Number of columns to span (default: 1)
  offset?: number;          // Columns to offset from start
  order?: number;           // Display order (for reordering)
}
```

**Bindings:**
- None

**Events:**
- None

**Accessibility:**
- Proper heading hierarchy within grid items
- Logical tab order maintained

**Responsive Behavior:**
- Columns adjust based on breakpoints
- Gap sizes scale down on smaller screens
- Items reflow automatically

**Example Usage:**
```json
{
  "type": "Grid",
  "props": {
    "columns": 12,
    "gap": "md"
  },
  "children": [
    {
      "type": "Card",
      "layoutProps": { "span": 6 },
      "props": { "title": "Card 1" }
    },
    {
      "type": "Card",
      "layoutProps": { "span": 6 },
      "props": { "title": "Card 2" }
    }
  ]
}
```

---

### 1.4 Card

Content container with optional header, footer, and actions.

**Type:** `Card`

**Description:**  
Cards are versatile containers for grouping related information. They support headers, images, actions, and various elevation styles.

**Props:**
```typescript
interface CardProps {
  title?: string;           // Card title/heading
  subtitle?: string;        // Secondary text
  image?: string;           // Header image URL
  elevation?: "none" | "sm" | "md" | "lg";  // Shadow depth
  bordered?: boolean;       // Show border instead of elevation
  padding?: "none" | "sm" | "md" | "lg";    // Internal padding
  actions?: Array<{
    id: string;             // Unique action identifier
    label: string;          // Button text
    actionId: string;       // ID of action to execute
  }>;
}
```

**Bindings:**
- None (Card is a presentational container)

**Events:**
- `onActionClick` - When action button is clicked (receives action.id)

**Accessibility:**
- `<article>` element for semantic meaning
- Action buttons have proper labels
- Focus management for interactive elements

**Responsive Behavior:**
- Full-width on mobile
- Image scales responsively
- Actions stack vertically on small screens

**Example Usage:**
```json
{
  "type": "Card",
  "props": {
    "title": "User Profile",
    "elevation": "md",
    "actions": [
      { "id": "edit", "label": "Edit", "actionId": "editProfile" }
    ]
  },
  "children": [...]
}
```

---

## 2. Form Input Widgets

All form widgets share common patterns:
- Support for labels, help text, and error messages
- Required field validation
- Disabled and readonly states
- Consistent error state styling

### 2.1 TextInput

Single-line text input field for short text values.

**Type:** `TextInput`

**Description:**  
The TextInput widget handles single-line text entry with support for various input types (text, email, URL, etc.).

**Props:**
```typescript
interface TextInputProps {
  label?: string;           // Field label
  placeholder?: string;     // Placeholder text
  helpText?: string;        // Helper text below input
  type?: "text" | "email" | "url" | "tel" | "search";  // Input type
  maxLength?: number;       // Maximum character length
  disabled?: boolean;       // Disable interaction
  readonly?: boolean;       // Read-only display
  required?: boolean;       // Mark as required field
  autoFocus?: boolean;      // Auto-focus on mount
  icon?: string;            // Icon identifier
  iconPosition?: "start" | "end";  // Icon placement
}
```

**Bindings:**
- `value` - Current input value (string)

**Events:**
- `onChange` - Fires when value changes (debounced)
- `onBlur` - When focus leaves the input
- `onFocus` - When focus enters the input
- `onEnter` - When Enter key is pressed

**Validation:**
- Client-side: maxLength, required, type-specific (email format, URL format)
- Server-side: validation errors displayed via binding

**Accessibility:**
- `<input>` with proper `type` attribute
- Associated `<label>` with `for` attribute
- `aria-describedby` for help text
- `aria-invalid` for error states
- `aria-required` for required fields

**Responsive Behavior:**
- Full-width on mobile
- Appropriate keyboard on mobile (email keyboard for type="email")

**Example Usage:**
```json
{
  "type": "TextInput",
  "props": {
    "label": "Email Address",
    "type": "email",
    "placeholder": "you@example.com",
    "required": true
  },
  "bindings": {
    "value": "user.email"
  },
  "events": {
    "onChange": { "actionId": "updateEmail" }
  }
}
```

---

### 2.2 Select

Dropdown selection field for choosing from a list of options.

**Type:** `Select`

**Description:**  
Select provides a dropdown menu for single-choice selection from a predefined list of options.

**Props:**
```typescript
interface SelectProps {
  label?: string;           // Field label
  placeholder?: string;     // Shown when no selection
  helpText?: string;        // Helper text
  options: Array<{
    value: string | number; // Option value
    label: string;          // Display text
    disabled?: boolean;     // Disable this option
    icon?: string;          // Optional icon
  }>;
  disabled?: boolean;       // Disable entire select
  required?: boolean;       // Required field
  searchable?: boolean;     // Enable option search/filter
  clearable?: boolean;      // Show clear button
}
```

**Bindings:**
- `value` - Currently selected value (string | number)

**Events:**
- `onChange` - When selection changes (receives new value)
- `onSearch` - When search term changes (if searchable)

**Validation:**
- Required field validation

**Accessibility:**
- Native `<select>` element for basic usage
- Custom dropdown with full keyboard navigation for enhanced features
- `aria-expanded`, `aria-activedescendant` for custom implementation
- Options announced by screen readers

**Responsive Behavior:**
- Native mobile select picker on mobile devices
- Full-width on mobile
- Searchable becomes more important on mobile for long lists

**Example Usage:**
```json
{
  "type": "Select",
  "props": {
    "label": "Country",
    "placeholder": "Select a country",
    "required": true,
    "searchable": true,
    "options": [
      { "value": "us", "label": "United States" },
      { "value": "uk", "label": "United Kingdom" },
      { "value": "ca", "label": "Canada" }
    ]
  },
  "bindings": {
    "value": "user.country"
  },
  "events": {
    "onChange": { "actionId": "updateCountry" }
  }
}
```

---

### 2.3 DatePicker

Date selection input with calendar interface.

**Type:** `DatePicker`

**Description:**  
DatePicker provides an intuitive calendar interface for selecting dates, with support for date ranges and time selection.

**Props:**
```typescript
interface DatePickerProps {
  label?: string;           // Field label
  placeholder?: string;     // Placeholder text
  helpText?: string;        // Helper text
  format?: string;          // Display format (e.g., "YYYY-MM-DD", "MM/DD/YYYY")
  minDate?: string;         // Minimum selectable date (ISO string)
  maxDate?: string;         // Maximum selectable date (ISO string)
  disabled?: boolean;       // Disable interaction
  required?: boolean;       // Required field
  showTime?: boolean;       // Include time selection
}
```

**Bindings:**
- `value` - Selected date as ISO 8601 string (e.g., "2026-01-19" or "2026-01-19T10:30:00Z")

**Events:**
- `onChange` - When date selection changes

**Validation:**
- Date range validation (minDate, maxDate)
- Required field validation
- Format validation

**Accessibility:**
- Date input with calendar popup
- Keyboard navigation: Arrow keys to navigate dates, Enter to select
- `aria-label` on calendar days
- Focus trap in calendar popup

**Responsive Behavior:**
- Native date picker on mobile browsers where supported
- Mobile-optimized calendar overlay
- Touch-friendly date selection

**Example Usage:**
```json
{
  "type": "DatePicker",
  "props": {
    "label": "Start Date",
    "format": "MM/DD/YYYY",
    "required": true,
    "minDate": "2026-01-01"
  },
  "bindings": {
    "value": "project.startDate"
  },
  "events": {
    "onChange": { "actionId": "updateStartDate" }
  }
}
```

---

### 2.4 Checkbox

Single checkbox input for boolean values.

**Type:** `Checkbox`

**Description:**  
Checkbox provides a simple true/false input for user consent, preferences, or boolean data.

**Props:**
```typescript
interface CheckboxProps {
  label?: string;           // Checkbox label text
  helpText?: string;        // Helper text below checkbox
  disabled?: boolean;       // Disable interaction
  required?: boolean;       // Must be checked to proceed
}
```

**Bindings:**
- `value` - Boolean checked state (true/false)

**Events:**
- `onChange` - When checkbox is toggled (receives new boolean value)

**Validation:**
- Required validation (must be checked)

**Accessibility:**
- Native `<input type="checkbox">`
- Associated `<label>` for click target
- `aria-required` for required checkboxes
- `aria-describedby` for help text

**Responsive Behavior:**
- Larger touch target on mobile (48x48px minimum)
- Label text wraps appropriately

**Example Usage:**
```json
{
  "type": "Checkbox",
  "props": {
    "label": "I agree to the terms and conditions",
    "required": true
  },
  "bindings": {
    "value": "user.agreedToTerms"
  },
  "events": {
    "onChange": { "actionId": "updateTermsAgreement" }
  }
}
```

---

## 3. Data Display Widgets

### 3.1 Table

Data table with sorting, filtering, and pagination support.

**Type:** `Table`

**Description:**  
Table displays tabular data with rich features including column sorting, row selection, pagination, and row-level actions. Supports both client-side and server-side operations.

**Props:**
```typescript
interface TableProps {
  columns: Array<{
    id: string;             // Unique column identifier
    label: string;          // Column header text
    field: string;          // Data field path (dot notation supported)
    sortable?: boolean;     // Enable sorting on this column
    width?: number | string;  // Column width
    align?: "left" | "center" | "right";  // Text alignment
    format?: "text" | "number" | "currency" | "date" | "custom";  // Display format
    formatOptions?: object; // Format-specific options
  }>;
  rowKey: string;           // Unique identifier field for rows
  selectable?: boolean;     // Enable row selection
  multiSelect?: boolean;    // Allow multiple row selection
  pagination?: {
    enabled: boolean;       // Enable pagination
    pageSize: number;       // Rows per page
    serverSide?: boolean;   // Server-side pagination
  };
  sorting?: {
    enabled: boolean;       // Enable sorting
    serverSide?: boolean;   // Server-side sorting
    defaultSort?: {         // Default sort configuration
      field: string;
      direction: "asc" | "desc";
    };
  };
  filtering?: {
    enabled: boolean;       // Enable filtering
    serverSide?: boolean;   // Server-side filtering
  };
  rowActions?: Array<{      // Per-row action buttons
    id: string;
    label: string;
    icon?: string;
    actionId: string;
  }>;
  bulkActions?: Array<{     // Actions for selected rows
    id: string;
    label: string;
    actionId: string;
  }>;
  emptyMessage?: string;    // Message when no data
  loading?: boolean;        // Show loading state
}
```

**Bindings:**
- `data` - Array of row data objects
- `selection` - Selected row(s) - single object or array
- `pagination` - Current page info `{ page: number, pageSize: number, totalCount: number }`
- `sorting` - Current sort state `{ field: string, direction: "asc" | "desc" }`
- `filters` - Current filter state (object with field: filterValue)

**Events:**
- `onRowSelect` - When row selection changes
- `onRowClick` - When row is clicked
- `onRowAction` - When row action button is clicked
- `onBulkAction` - When bulk action is triggered
- `onPageChange` - When page changes (server-side pagination)
- `onSortChange` - When sort changes (server-side sorting)
- `onFilterChange` - When filters change (server-side filtering)

**Accessibility:**
- Semantic `<table>` element with proper structure
- Column headers in `<th>` with `scope="col"`
- Row selection with `aria-selected`
- Sort buttons with `aria-sort` state
- Keyboard: Arrow keys for navigation, Space for selection

**Responsive Behavior:**
- Horizontal scroll on mobile for wide tables
- Optional: Card view for mobile (stacked layout)
- Touch-friendly row actions
- Pagination controls adapt to screen size

**Example Usage:**
```json
{
  "type": "Table",
  "props": {
    "columns": [
      { "id": "name", "label": "Name", "field": "name", "sortable": true },
      { "id": "email", "label": "Email", "field": "email" },
      { "id": "created", "label": "Created", "field": "createdAt", "format": "date" }
    ],
    "rowKey": "id",
    "selectable": true,
    "multiSelect": true,
    "pagination": {
      "enabled": true,
      "pageSize": 25,
      "serverSide": true
    },
    "sorting": {
      "enabled": true,
      "serverSide": true
    },
    "rowActions": [
      { "id": "edit", "label": "Edit", "actionId": "editUser" },
      { "id": "delete", "label": "Delete", "actionId": "deleteUser" }
    ]
  },
  "bindings": {
    "data": "users.list"
  },
  "events": {
    "onRowAction": { "actionId": "handleRowAction" },
    "onPageChange": { "actionId": "loadUsersPage" }
  }
}
```

---

### 3.2 KPI

Key Performance Indicator card for displaying metrics.

**Type:** `KPI`

**Description:**  
KPI widget displays a single metric value with optional trend indicator, formatting, and click actions. Perfect for dashboards and summary views.

**Props:**
```typescript
interface KPIProps {
  label: string;            // KPI label/name
  format?: "number" | "currency" | "percent";  // Value format
  formatOptions?: object;   // Format-specific options (e.g., { currency: "USD" })
  showTrend?: boolean;      // Display trend indicator
  trendDirection?: "up" | "down" | "neutral";  // Trend direction
  trendValue?: string;      // Trend value text (e.g., "+12%")
  icon?: string;            // Optional icon
  color?: string;           // Accent color
  size?: "sm" | "md" | "lg";  // Display size
}
```

**Bindings:**
- `value` - KPI numeric value
- `trend` - Trend information object `{ direction: "up" | "down" | "neutral", value: string }`

**Events:**
- `onClick` - When KPI card is clicked (for drill-down)

**Accessibility:**
- Semantic markup with `role="article"`
- Value and label properly associated
- Trend indicator has text alternative
- Clickable KPIs have `role="button"` and keyboard support

**Responsive Behavior:**
- Size adapts to container width
- Font sizes scale based on size prop and viewport
- Stacks vertically on small screens when in groups

**Example Usage:**
```json
{
  "type": "KPI",
  "props": {
    "label": "Monthly Revenue",
    "format": "currency",
    "formatOptions": { "currency": "USD" },
    "showTrend": true,
    "size": "md"
  },
  "bindings": {
    "value": "metrics.monthlyRevenue",
    "trend": "metrics.revenueTrend"
  },
  "events": {
    "onClick": { "actionId": "showRevenueDetails" }
  }
}
```

---

## 4. Dialogs & Feedback Widgets

### 4.1 Modal

Modal dialog overlay for focused interactions.

**Type:** `Modal`

**Description:**  
Modal creates an overlay dialog that focuses user attention on a specific task or information. Blocks interaction with the rest of the page until dismissed.

**Props:**
```typescript
interface ModalProps {
  title?: string;           // Modal title/header
  size?: "sm" | "md" | "lg" | "xl" | "full";  // Modal width
  closable?: boolean;       // Show close button (default: true)
  closeOnBackdrop?: boolean;  // Close when clicking outside (default: true)
  showFooter?: boolean;     // Display footer section (default: true)
  actions?: Array<{         // Footer action buttons
    id: string;
    label: string;
    variant?: "primary" | "secondary" | "text";
    actionId: string;
  }>;
}
```

**Bindings:**
- `open` - Boolean controlling modal visibility

**Events:**
- `onClose` - When modal is closed (X button or backdrop click)
- `onActionClick` - When action button is clicked (receives action.id)

**Accessibility:**
- `role="dialog"` with `aria-modal="true"`
- Focus trap: Focus stays within modal
- `aria-labelledby` pointing to title
- Escape key closes modal
- Focus returns to trigger element on close

**Responsive Behavior:**
- Full-screen on mobile devices
- Size props scale appropriately
- Touch-friendly close buttons
- Scrollable content if too tall

**Example Usage:**
```json
{
  "type": "Modal",
  "props": {
    "title": "Confirm Delete",
    "size": "sm",
    "actions": [
      { "id": "cancel", "label": "Cancel", "variant": "secondary", "actionId": "closeModal" },
      { "id": "confirm", "label": "Delete", "variant": "primary", "actionId": "confirmDelete" }
    ]
  },
  "bindings": {
    "open": "ui.deleteModalOpen"
  },
  "events": {
    "onClose": { "actionId": "closeDeleteModal" },
    "onActionClick": { "actionId": "handleModalAction" }
  },
  "children": [
    {
      "type": "Text",
      "props": { "content": "Are you sure you want to delete this item?" }
    }
  ]
}
```

---

### 4.2 Toast

Temporary notification message for user feedback.

**Type:** `Toast`

**Description:**  
Toast displays a temporary notification message that automatically dismisses after a duration. Used for success messages, errors, warnings, and info alerts.

**Props:**
```typescript
interface ToastProps {
  variant: "success" | "error" | "warning" | "info";  // Toast type/severity
  message: string;          // Notification message text
  duration?: number;        // Auto-dismiss time in milliseconds (default: 5000)
  closable?: boolean;       // Show close button (default: true)
  action?: {                // Optional action button
    label: string;
    actionId: string;
  };
}
```

**Bindings:**
- None (Toast is typically triggered via actions, not bound to data)

**Events:**
- `onClose` - When toast is dismissed (manually or auto)
- `onActionClick` - When action button is clicked

**Accessibility:**
- `role="alert"` for urgent messages (error, warning)
- `role="status"` for non-urgent messages (success, info)
- `aria-live="polite"` or `aria-live="assertive"` based on variant
- Screen reader announces message
- Focus management for closable toasts

**Responsive Behavior:**
- Full-width on mobile
- Positioned at top or bottom of viewport
- Stacks multiple toasts vertically
- Touch-friendly close button

**Example Usage:**
```json
{
  "type": "Toast",
  "props": {
    "variant": "success",
    "message": "User updated successfully",
    "duration": 5000,
    "closable": true
  },
  "events": {
    "onClose": { "actionId": "clearToast" }
  }
}
```

**Toast Trigger via Action:**
Toast widgets are typically not part of the page configuration but rather triggered dynamically through actions:

```json
{
  "actionId": "showSuccessToast",
  "type": "showToast",
  "params": {
    "variant": "success",
    "message": "Operation completed successfully"
  }
}
```

---

## Widget Contract Standards

### Required Elements for All Widgets

Every widget in the OpenPortal platform must provide:

#### 1. Unique ID
Each widget instance requires a unique identifier for:
- State management and data binding
- Event handling and action routing
- DOM element references
- Testing and debugging

**Format:** String (alphanumeric with hyphens/underscores)

#### 2. Type Identifier
The widget type as a string constant:
- Must match the widget registry entry
- Case-sensitive
- Used for rendering lookup

**Example:** `"TextInput"`, `"Table"`, `"Modal"`

#### 3. Props Schema
TypeScript interface defining all accepted properties:
- Optional vs. required props clearly marked
- Type definitions for all values
- Enums for constrained values
- Documentation comments for complex props

#### 4. Bindings Specification
Data binding contract:
- List of bindable properties
- Expected data types
- Update frequency expectations
- Default values when unbound

#### 5. Events List
Supported event handlers:
- Event names and when they fire
- Payload structure for each event
- Async vs. sync event expectations

#### 6. Accessibility Requirements
WCAG 2.1 Level AA compliance:
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader announcements
- Color contrast requirements

#### 7. Responsive Behavior
How the widget adapts across viewports:
- Breakpoint behavior
- Mobile-specific considerations
- Touch vs. mouse interactions
- Orientation changes

#### 8. Error States
Error handling and display:
- Validation error display
- Network error handling
- Required field indicators
- Error message formatting

---

## Widget Lifecycle

All widgets follow a consistent lifecycle managed by the rendering engine:

### 1. Mount Phase
**Occurs:** When widget is first added to the page

**Actions:**
- Widget receives initial props from configuration
- Data bindings are established
- Initial state is set
- Event listeners are registered
- `onLoad` event fires (if defined)

**Example:**
```javascript
// Configuration processed
const widget = {
  id: "user-table",
  type: "Table",
  props: { /* ... */ },
  bindings: { data: "users.list" }
};

// Widget mounts
// - Initial render with props
// - Subscribe to "users.list" data
// - Register event handlers
```

### 2. Render Phase
**Occurs:** Initial render and every update

**Actions:**
- Props and bindings are evaluated
- Component renders with current data
- DOM is updated efficiently (React reconciliation)
- Styles are applied
- Accessibility attributes set

### 3. Update Phase
**Occurs:** When props or bindings change

**Triggers:**
- Configuration update from backend
- Bound data changes
- Parent widget updates
- User interactions

**Actions:**
- New props/bindings received
- Component re-renders with new data
- Event handlers may fire (onChange, etc.)
- DOM updates applied

**Example:**
```javascript
// User data updates
users.list = [...newUsers];

// Widget automatically re-renders
// - Table component receives new data
// - Rows re-render
// - Selection state maintained
```

### 4. Unmount Phase
**Occurs:** When widget is removed from the page

**Actions:**
- Event listeners are removed
- Data binding subscriptions are cleaned up
- Component state is cleared
- DOM nodes are removed
- Resources are freed

**Example:**
```javascript
// User navigates away from page
// - All widgets unmount
// - Event listeners removed
// - Data subscriptions cancelled
// - Memory cleaned up
```

### Lifecycle Events

Certain widgets expose lifecycle events:
- `onLoad` - After mount completes (Page, Section)
- `onUnload` - Before unmount begins
- `onResize` - When widget size changes (responsive)

---

## Testing Requirements

Each widget must meet comprehensive testing standards to ensure reliability, accessibility, and performance.

### Unit Tests

**Purpose:** Test widget logic in isolation

**Requirements:**
- Props rendering with various configurations
- Default values and optional props
- Event handler invocation
- State management (if internal state exists)
- Edge cases and error conditions
- Min 80% code coverage

**Example Test Cases:**
- TextInput renders with label
- TextInput fires onChange when value changes
- TextInput displays error state when invalid
- TextInput respects maxLength prop
- TextInput is disabled when disabled prop is true

### Integration Tests

**Purpose:** Test widget with data binding and actions

**Requirements:**
- Data binding updates widget correctly
- Widget events trigger correct actions
- Multiple widgets interact properly
- Form submission flows
- Navigation and state persistence

**Example Test Cases:**
- Table binds to data source and displays rows
- Table onPageChange fires action with correct params
- Form with TextInput and Submit button submits correctly
- Modal open binding controls visibility

### Accessibility Tests

**Purpose:** Ensure WCAG 2.1 Level AA compliance

**Requirements:**
- Automated accessibility testing (axe-core, WAVE)
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast verification
- Focus management validation
- ARIA attribute correctness

**Tools:**
- jest-axe for automated checks
- Manual keyboard testing
- Screen reader manual testing

**Example Test Cases:**
- All interactive elements keyboard accessible
- Form inputs have associated labels
- Error messages announced to screen readers
- Focus trap works in Modal
- Table supports arrow key navigation

### Visual Regression Tests

**Purpose:** Prevent unintended visual changes

**Requirements:**
- Baseline screenshots for all widget states
- Cross-browser visual consistency
- Responsive breakpoint screenshots
- Theme variations

**Tools:**
- Percy, Chromatic, or similar
- Snapshot testing

**Example Test Cases:**
- TextInput normal state
- TextInput focused state
- TextInput error state
- TextInput disabled state
- All states across mobile/tablet/desktop

### Performance Benchmarks

**Purpose:** Ensure widgets perform efficiently

**Requirements:**
- Render time benchmarks
- Re-render optimization (React.memo, useMemo)
- Large dataset handling (Table with 1000+ rows)
- Memory usage profiling
- Event handler efficiency

**Metrics:**
- Initial render time < 100ms (simple widgets)
- Re-render time < 50ms
- Memory leaks detected and prevented
- No unnecessary re-renders

**Example Test Cases:**
- Table renders 1000 rows in < 500ms
- TextInput onChange debounced properly
- Modal mount/unmount has no memory leaks

### Test Coverage Goals

| Widget Category | Unit Tests | Integration Tests | A11y Tests | Visual Tests | Performance |
|----------------|------------|-------------------|------------|--------------|-------------|
| Layout         | ≥ 80%      | ≥ 60%             | 100%       | All states   | Basic       |
| Form Inputs    | ≥ 90%      | ≥ 80%             | 100%       | All states   | Standard    |
| Data Display   | ≥ 85%      | ≥ 70%             | 100%       | Key states   | Critical    |
| Dialogs        | ≥ 85%      | ≥ 75%             | 100%       | All states   | Standard    |

---

## Cross-References

This widget taxonomy aligns with other OpenPortal documentation:

### Architecture Documentation
- **[architecture.md](./architecture.md)** - Widget Registry implementation details
- **[architecture.md](./architecture.md)** - State Management and data binding
- **[architecture.md](./architecture.md)** - Event system and Action Engine

### API Specification
- **[api-specification.md](./api-specification.md)** - Page Configuration API structure
- **[api-specification.md](./api-specification.md)** - Widget configuration format
- **[api-specification.md](./api-specification.md)** - Datasource bindings

### JSON Schemas
- **[json-schemas.md](./json-schemas.md)** - Widget configuration JSON Schema
- **[json-schemas.md](./json-schemas.md)** - Props validation schemas
- **[json-schemas.md](./json-schemas.md)** - Event and action schemas

### Widget Catalog
- **[widget-catalog.md](./widget-catalog.md)** - Complete widget reference (30+ widgets)
- **[widget-catalog.md](./widget-catalog.md)** - Extended widget features and variants

### Roadmap
- **[roadmap.md](./roadmap.md)** - Phase 1: Widget implementation schedule
- **[roadmap.md](./roadmap.md)** - Phase 0: Widget taxonomy establishment

---

## Examples

### Complete Form Example

```json
{
  "pageId": "user-form",
  "title": "Edit User",
  "widgets": [
    {
      "id": "main-page",
      "type": "Page",
      "props": {
        "title": "Edit User Profile",
        "padding": "md"
      },
      "children": [
        {
          "id": "form-section",
          "type": "Section",
          "props": {
            "title": "User Information",
            "bordered": true,
            "padding": "lg"
          },
          "children": [
            {
              "id": "form-grid",
              "type": "Grid",
              "props": {
                "columns": 12,
                "gap": "md"
              },
              "children": [
                {
                  "id": "name-input",
                  "type": "TextInput",
                  "layoutProps": { "span": 6 },
                  "props": {
                    "label": "Full Name",
                    "required": true,
                    "placeholder": "Enter full name"
                  },
                  "bindings": {
                    "value": "user.name"
                  },
                  "events": {
                    "onChange": { "actionId": "updateUserName" }
                  }
                },
                {
                  "id": "email-input",
                  "type": "TextInput",
                  "layoutProps": { "span": 6 },
                  "props": {
                    "label": "Email",
                    "type": "email",
                    "required": true
                  },
                  "bindings": {
                    "value": "user.email"
                  },
                  "events": {
                    "onChange": { "actionId": "updateUserEmail" }
                  }
                },
                {
                  "id": "country-select",
                  "type": "Select",
                  "layoutProps": { "span": 6 },
                  "props": {
                    "label": "Country",
                    "searchable": true,
                    "options": []
                  },
                  "bindings": {
                    "value": "user.country",
                    "options": "countries.list"
                  },
                  "events": {
                    "onChange": { "actionId": "updateUserCountry" }
                  }
                },
                {
                  "id": "birthdate-picker",
                  "type": "DatePicker",
                  "layoutProps": { "span": 6 },
                  "props": {
                    "label": "Birth Date",
                    "format": "MM/DD/YYYY"
                  },
                  "bindings": {
                    "value": "user.birthDate"
                  },
                  "events": {
                    "onChange": { "actionId": "updateUserBirthDate" }
                  }
                },
                {
                  "id": "terms-checkbox",
                  "type": "Checkbox",
                  "layoutProps": { "span": 12 },
                  "props": {
                    "label": "I agree to receive marketing emails",
                    "required": false
                  },
                  "bindings": {
                    "value": "user.marketingOptIn"
                  },
                  "events": {
                    "onChange": { "actionId": "updateMarketingOptIn" }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Dashboard with KPIs and Table

```json
{
  "pageId": "dashboard",
  "title": "Dashboard",
  "widgets": [
    {
      "id": "dashboard-page",
      "type": "Page",
      "props": {
        "title": "Sales Dashboard",
        "padding": "md"
      },
      "children": [
        {
          "id": "kpi-grid",
          "type": "Grid",
          "props": {
            "columns": 12,
            "gap": "md"
          },
          "children": [
            {
              "id": "revenue-kpi",
              "type": "KPI",
              "layoutProps": { "span": 3 },
              "props": {
                "label": "Monthly Revenue",
                "format": "currency",
                "formatOptions": { "currency": "USD" },
                "showTrend": true,
                "size": "md"
              },
              "bindings": {
                "value": "metrics.monthlyRevenue",
                "trend": "metrics.revenueTrend"
              },
              "events": {
                "onClick": { "actionId": "showRevenueDetails" }
              }
            },
            {
              "id": "orders-kpi",
              "type": "KPI",
              "layoutProps": { "span": 3 },
              "props": {
                "label": "Total Orders",
                "format": "number",
                "showTrend": true,
                "size": "md"
              },
              "bindings": {
                "value": "metrics.totalOrders",
                "trend": "metrics.ordersTrend"
              }
            },
            {
              "id": "customers-kpi",
              "type": "KPI",
              "layoutProps": { "span": 3 },
              "props": {
                "label": "New Customers",
                "format": "number",
                "showTrend": true,
                "size": "md"
              },
              "bindings": {
                "value": "metrics.newCustomers",
                "trend": "metrics.customersTrend"
              }
            },
            {
              "id": "conversion-kpi",
              "type": "KPI",
              "layoutProps": { "span": 3 },
              "props": {
                "label": "Conversion Rate",
                "format": "percent",
                "showTrend": true,
                "size": "md"
              },
              "bindings": {
                "value": "metrics.conversionRate",
                "trend": "metrics.conversionTrend"
              }
            }
          ]
        },
        {
          "id": "recent-orders-section",
          "type": "Section",
          "props": {
            "title": "Recent Orders",
            "bordered": true,
            "padding": "md"
          },
          "children": [
            {
              "id": "orders-table",
              "type": "Table",
              "props": {
                "columns": [
                  {
                    "id": "orderId",
                    "label": "Order ID",
                    "field": "id",
                    "sortable": true
                  },
                  {
                    "id": "customer",
                    "label": "Customer",
                    "field": "customerName",
                    "sortable": true
                  },
                  {
                    "id": "amount",
                    "label": "Amount",
                    "field": "total",
                    "format": "currency",
                    "sortable": true,
                    "align": "right"
                  },
                  {
                    "id": "status",
                    "label": "Status",
                    "field": "status",
                    "sortable": true
                  },
                  {
                    "id": "date",
                    "label": "Date",
                    "field": "createdAt",
                    "format": "date",
                    "sortable": true
                  }
                ],
                "rowKey": "id",
                "selectable": false,
                "pagination": {
                  "enabled": true,
                  "pageSize": 10,
                  "serverSide": true
                },
                "sorting": {
                  "enabled": true,
                  "serverSide": true,
                  "defaultSort": {
                    "field": "createdAt",
                    "direction": "desc"
                  }
                },
                "rowActions": [
                  {
                    "id": "view",
                    "label": "View",
                    "actionId": "viewOrder"
                  },
                  {
                    "id": "edit",
                    "label": "Edit",
                    "actionId": "editOrder"
                  }
                ]
              },
              "bindings": {
                "data": "orders.recent"
              },
              "events": {
                "onRowAction": { "actionId": "handleOrderAction" },
                "onPageChange": { "actionId": "loadOrdersPage" },
                "onSortChange": { "actionId": "sortOrders" }
              }
            }
          ]
        }
      ]
    }
  ],
  "datasources": [
    {
      "id": "metrics",
      "kind": "http",
      "http": {
        "method": "GET",
        "url": "/api/dashboard/metrics"
      },
      "fetchPolicy": "cache-first",
      "cacheTTL": 300
    },
    {
      "id": "orders",
      "kind": "http",
      "http": {
        "method": "GET",
        "url": "/api/orders/recent"
      },
      "fetchPolicy": "network-only"
    }
  ]
}
```

---

## Next Steps

After establishing this widget taxonomy v1:

1. **Review & Approval** - Team review and sign-off on taxonomy
2. **JSON Schema Generation** - Create formal JSON schemas for validation
3. **Widget Registry Design** - Design the runtime widget registry system
4. **Implementation Planning** - Detailed implementation plan for each widget
5. **Phase 1 Development** - Begin building widgets per roadmap

---

## Changelog

### Version 1.0 (January 2026)
- Initial widget taxonomy with 12 core widgets
- Widget categories: Layout (4), Form Inputs (4), Data Display (2), Dialogs (2)
- Complete TypeScript prop definitions
- Comprehensive accessibility requirements
- Testing standards and requirements
- Widget lifecycle documentation
- Cross-references to architecture and API docs

---

**Document Status:** Draft  
**Next Review:** After team feedback  
**Owner:** OpenPortal Core Team
