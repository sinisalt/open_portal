# Developer Tools

This directory contains developer tools for the OpenPortal platform, including configuration editors, debuggers, validators, and preview tools.

## Tools Overview

### 1. Configuration Validator
- **Purpose**: Validate page, route, branding, and menu configurations
- **Features**: Real-time validation, error highlighting, schema reference
- **Location**: `components/ConfigValidatorTool.tsx`

### 2. Widget Documentation Browser
- **Purpose**: Browse available widgets with live examples
- **Features**: Interactive widget catalog, props documentation, live preview
- **Location**: `components/WidgetDocsBrowser.tsx`

### 3. Page Preview Tool
- **Purpose**: Preview pages with hot reload
- **Features**: Live configuration editing, responsive preview, error boundaries
- **Location**: `components/PagePreviewTool.tsx`

### 4. Action Debugger
- **Purpose**: Debug action execution flow
- **Features**: Step-through execution, trace visualization, input/output inspection
- **Location**: `components/ActionDebugger.tsx`

### 5. Configuration Editor/Builder
- **Purpose**: Visual configuration builder with drag-and-drop
- **Features**: Widget builder, property editor, datasource configuration, action flows
- **Location**: `components/ConfigEditor.tsx`

### 6. Mock Data Generator
- **Purpose**: Generate mock data for testing
- **Features**: Schema-based generation, custom templates, export functionality
- **Location**: `components/MockDataGenerator.tsx`

## Directory Structure

```
src/tools/
├── components/          # Tool components
│   ├── ConfigValidatorTool.tsx
│   ├── WidgetDocsBrowser.tsx
│   ├── PagePreviewTool.tsx
│   ├── ActionDebugger.tsx
│   ├── ConfigEditor.tsx
│   └── MockDataGenerator.tsx
├── validators/          # Validation utilities
├── hooks/              # Custom hooks for tools
├── utils/              # Tool utilities
└── README.md           # This file
```

## Usage

Developer tools are available at `/dev-tools` route (development mode only).

### Accessing Tools

```typescript
// Navigate to developer tools
navigate('/dev-tools')

// Access specific tool
navigate('/dev-tools/config-validator')
navigate('/dev-tools/widget-docs')
navigate('/dev-tools/page-preview')
navigate('/dev-tools/action-debugger')
navigate('/dev-tools/config-editor')
navigate('/dev-tools/mock-data')
```

## Development

### Adding a New Tool

1. Create tool component in `components/`
2. Add route in `/src/routes/dev-tools/`
3. Update navigation in DevToolsLayout
4. Write tests in `__tests__/`
5. Update this README

### Testing

```bash
# Run tool tests
npm test -- src/tools

# E2E tests for tools
npm run test:e2e -- dev-tools
```

## Security

**Important**: Developer tools should only be accessible in development mode or with proper authorization in production environments.

- Route guard checks `import.meta.env.DEV` flag
- Admin-only access in production (future enhancement)
- No sensitive data exposure in tool interfaces
