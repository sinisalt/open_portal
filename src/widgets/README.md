# Widgets Directory

This directory contains the **widget library** - configuration-driven components that are rendered dynamically based on backend API configurations.

## Purpose

Widgets are the core building blocks of the OpenPortal UI platform. Each widget:

- **Configuration-Driven**: Behavior controlled via JSON configuration from backend
- **Stable Contract**: Clear props interface that doesn't break backward compatibility
- **Cataloged**: Part of the official widget catalog
- **Reusable**: Can be used across different pages and contexts
- **Composable**: Can contain and nest other widgets

## Widget Catalog

The OpenPortal platform has 30+ widgets in the full catalog, but the **MVP focuses on 12 core widgets**:

### MVP Core Widgets (12)

**Layout & Structure (4 widgets):**

- `Page` - Top-level page container
- `Section` - Page section organizer
- `Grid` - Responsive grid layout
- `Card` - Content card container

**Form Inputs (4 widgets):**

- `TextInput` - Single-line text input
- `Select` - Dropdown selection
- `DatePicker` - Date selection
- `Checkbox` - Boolean checkbox

**Data Display (2 widgets):**

- `Table` - Data table with sorting/filtering
- `KPI` - Key performance indicator display

**Dialogs & Feedback (2 widgets):**

- `Modal` - Modal dialog overlay
- `Toast` - Toast notification

## Widget Structure

Each widget follows this pattern:

```javascript
// TextInput widget example
function TextInputWidget({ config, data, onEvent }) {
  const { id, label, placeholder, validation, bindings } = config;

  // Widget implementation using config
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        // ... other props from config
      />
    </div>
  );
}

export default TextInputWidget;
```

## Widget Contract

Every widget must have:

1. **Props Interface**:

   - `config` - Widget configuration object
   - `data` - Bound data from datasources
   - `onEvent` - Event handler for widget actions

2. **Configuration Schema**:

   - `id` - Unique widget identifier
   - `type` - Widget type (e.g., "TextInput", "Button")
   - `props` - Widget-specific properties
   - `bindings` - Data bindings
   - `events` - Event handlers
   - `policies` - Visibility/permission rules

3. **Event Handlers**:

   - User interactions trigger configured actions
   - No inline business logic - delegate to action engine

4. **Data Bindings**:
   - Use datasource bindings instead of direct API calls
   - Support static and dynamic data sources

## Widget Guidelines

1. **Stable Contracts**: Don't break backward compatibility
2. **Accessibility**: Support WCAG 2.1 Level AA
   - Proper ARIA labels and roles
   - Keyboard navigation
   - Screen reader support
   - Focus management
3. **Responsive Design**: Mobile-first approach
4. **Composability**: Support nesting and composition
5. **Performance**: Lazy loading, optimized rendering
6. **No Business Logic**: Widget behavior must be configurable

## File Structure

```
widgets/
├── TextInput/
│   ├── TextInput.js
│   ├── TextInput.test.js
│   ├── TextInput.schema.json
│   └── index.js
├── Button/
│   ├── Button.js
│   ├── Button.test.js
│   ├── Button.schema.json
│   └── index.js
└── README.md
```

## Widget Registry

Widgets are registered in `src/core/registry/widgetRegistry.js`:

```javascript
const widgetRegistry = {
  TextInput: TextInputWidget,
  Button: ButtonWidget,
  Card: CardWidget,
  // ...
};
```

## Testing

Each widget must include:

- Unit tests for rendering with configuration
- Accessibility tests
- Event handler tests
- Integration tests with config engine

## Documentation

Full widget specifications available in:

- `/documentation/widget-catalog.md` - Complete catalog (30+ widgets)
- `/documentation/widget-taxonomy.md` - MVP core widgets (12 widgets)
