# Core Directory

This directory contains the **core rendering engine** and foundational logic for the OpenPortal platform.

## Purpose

The core directory houses the essential infrastructure that:
- **Parses** JSON configurations from backend APIs
- **Renders** widgets dynamically based on configurations
- **Manages** the widget registry
- **Executes** actions and event handlers
- **Handles** data binding and datasources
- **Enforces** policies and validation rules

## Subdirectories

### `engine/`
The configuration rendering engine that interprets JSON configs and renders widgets.

**Key responsibilities:**
- Parse page configurations
- Resolve widget types and props
- Handle nested widget rendering
- Manage widget lifecycle
- Execute action handlers
- Validate configurations against schemas

**Example files:**
- `ConfigEngine.js` - Main configuration engine
- `ActionEngine.js` - Action execution engine
- `ValidationEngine.js` - Configuration validation
- `PolicyEngine.js` - Policy enforcement

### `registry/`
The widget registry that maps widget types to React components.

**Key responsibilities:**
- Register available widgets
- Provide widget lookup by type
- Validate widget contracts
- Support dynamic widget loading

**Example files:**
- `widgetRegistry.js` - Widget type mappings
- `datasourceRegistry.js` - Datasource type mappings
- `actionRegistry.js` - Action handler mappings

## Design Principles

1. **Configuration-Driven**: All rendering logic driven by backend configs
2. **Zero Frontend Changes**: New features don't require frontend code changes
3. **Separation of Concerns**: Business logic in backend, rendering in frontend
4. **Extensibility**: Easy to add new widget types and action handlers
5. **Performance**: Smart caching, lazy loading, optimized rendering

## Key Patterns

### Widget Registry Pattern
Map widget types to React components:
```javascript
const widgetRegistry = {
  'TextInput': TextInputWidget,
  'Button': ButtonWidget,
  // ...
};
```

### Configuration Rendering
Parse JSON config and render widgets dynamically:
```javascript
function renderWidget(config) {
  const Component = widgetRegistry[config.type];
  return <Component {...config.props} />;
}
```

### Action Engine
Execute configured actions:
```javascript
const actionHandlers = {
  'executeAction': executeActionHandler,
  'navigate': navigateHandler,
  // ...
};
```

### Datasource Pattern
Separate data fetching from rendering:
```javascript
const datasources = {
  'user-data': { kind: 'http', url: '/api/users' },
  'static-content': { kind: 'static', data: {...} }
};
```

## Core Architecture

```
┌─────────────────────────────────────────┐
│          Backend API                     │
│  (Page Configs, Widget Configs, Data)   │
└─────────────┬───────────────────────────┘
              │
              │ JSON Configuration
              ▼
┌─────────────────────────────────────────┐
│      Config Engine (core/engine)        │
│  - Parse configuration                   │
│  - Validate schema                       │
│  - Resolve datasources                   │
│  - Execute policies                      │
└─────────────┬───────────────────────────┘
              │
              │ Widget Config
              ▼
┌─────────────────────────────────────────┐
│    Widget Registry (core/registry)      │
│  - Map type → Component                  │
│  - Validate contract                     │
└─────────────┬───────────────────────────┘
              │
              │ Widget Component
              ▼
┌─────────────────────────────────────────┐
│      Widget Rendering (widgets/)        │
│  - Render UI based on config             │
│  - Handle user interactions              │
│  - Emit events                           │
└─────────────┬───────────────────────────┘
              │
              │ User Events
              ▼
┌─────────────────────────────────────────┐
│     Action Engine (core/engine)         │
│  - Execute actions                       │
│  - API calls, navigation, validation     │
└─────────────────────────────────────────┘
```

## File Structure

```
core/
├── engine/
│   ├── ConfigEngine.js
│   ├── ActionEngine.js
│   ├── ValidationEngine.js
│   ├── PolicyEngine.js
│   └── index.js
├── registry/
│   ├── widgetRegistry.js
│   ├── datasourceRegistry.js
│   ├── actionRegistry.js
│   └── index.js
└── README.md
```

## Integration Points

- **Services** (`src/services/`) - API communication for configs and data
- **Widgets** (`src/widgets/`) - UI components rendered by engine
- **Hooks** (`src/hooks/`) - Custom hooks for config loading, caching
- **Utils** (`src/utils/`) - Helper functions for parsing, validation

## Testing

Core engine testing includes:
- Configuration parsing tests
- Widget rendering integration tests
- Action execution tests
- Validation and policy tests
- Performance benchmarks

## Documentation

See `/documentation/architecture.md` for detailed architecture documentation.
