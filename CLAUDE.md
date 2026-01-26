# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenPortal is an **API-driven Business UI Platform** where the frontend is a generic React rendering engine and all UI structure, logic, and workflows come from backend APIs. The key principle is **zero frontend changes for new features** - everything is configuration-driven.

### Core Architecture Principle

The frontend is a generic rendering engine that:
1. Receives JSON configurations from backend APIs defining pages, widgets, and behaviors
2. Dynamically renders UI based on these configurations via a widget registry
3. Executes actions (API calls, navigation, validation) through a configured action engine
4. Contains no hardcoded business logic - the backend is authoritative

## Technology Stack

### Frontend
- **React 19.2.3** with hooks and functional components
- **Vite 6.4.1** for fast development and optimized builds
- **TypeScript 5.9** with strict mode for new files (existing files may be JavaScript)
- **TanStack Router v1.132** for file-based routing
- **Tailwind CSS v4.1** for styling
- **shadcn/ui + Radix UI** for accessible UI components
- **BiomeJS** for linting and formatting (replaced ESLint + Prettier)

### Development Tools
- **Jest + React Testing Library** for unit/integration tests
- **Playwright** for E2E tests
- **Husky + lint-staged** for pre-commit hooks

## Common Commands

### Development
```bash
npm run dev        # Vite dev server on http://localhost:3000
npm run build      # Production build to /build directory
npm run preview    # Preview production build locally
```

### Code Quality
```bash
npm run lint       # BiomeJS linting (check only)
npm run lint:fix   # BiomeJS linting with auto-fix
npm run format     # BiomeJS formatting
```

### Testing
```bash
npm test           # Jest tests
npm run test:watch # Jest in watch mode
npm run test:coverage # Jest with coverage report
npm run test:e2e   # Playwright E2E tests
```

### Running a Single Test
```bash
# Run tests matching a pattern
npm test -- --testNamePattern="testName"

# Run a specific test file
npm test -- TextInputWidget.test
```

### shadcn/ui Components
```bash
npx shadcn@latest add <component>  # Install component (goes to src/components/ui/)
```

## Architecture

### Widget Registry Pattern (Core Design)

The frontend uses a 4-layer widget architecture:

```
Layer 1: Radix UI Primitives (headless, accessible)
   ↓
Layer 2: shadcn/ui Components (styled, Tailwind-based)
   ↓
Layer 3: OpenPortal Widgets (configuration contracts)
   ↓
Layer 4: Widget Registry (dynamic rendering from JSON)
```

**Widget Contract Pattern:**
```typescript
// Each widget receives config, bindings, and events
interface WidgetProps<T extends WidgetConfig> {
  config: T              // Widget configuration from backend
  bindings?: DataBindings // Data connections
  events?: EventHandlers // User interaction handlers
  policies?: Policies    // Visibility/permissions
}

// Widgets are registered and rendered dynamically
widgetRegistry.register('TextInput', TextInputWidget)
<WidgetRenderer config={pageConfig} />
```

### Directory Structure

```
src/
├── routes/            # TanStack Router file-based routes
│   ├── __root.tsx     # Root layout
│   └── *.tsx          # Route files (auto-generated routeTree.gen.ts)
├── components/
│   └── ui/            # shadcn/ui components (managed by CLI)
├── widgets/           # OpenPortal widgets (configuration-driven)
│   └── index.ts       # Widget registration exports
├── core/              # Rendering engine
│   ├── registry/      # Widget registry for dynamic rendering
│   └── renderer/      # Widget renderer component
├── services/          # API layer (auth, data, http)
├── hooks/             # Custom React hooks
├── lib/               # Utilities (cn for class merging, etc.)
├── types/             # TypeScript definitions
├── config/            # Runtime configuration
└── styles/            # Global styles
```

### Path Aliases

Use path aliases for cleaner imports:
- `@/` → `src/`
- `@/components` → `src/components`
- `@/widgets` → `src/widgets`
- `@/core` → `src/core`
- `@/services` → `src/services`
- `@/hooks` → `src/hooks`
- `@/lib` → `src/lib`
- `@/types` → `src/types`
- `@/config` → `src/config`

### Import Order Convention

```typescript
// 1. External dependencies
import React from 'react';
import { useNavigate } from '@tanstack/react-router';

// 2. Internal modules (using path aliases)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// 3. Relative imports (same directory)
import styles from './Widget.module.css';
```

## Configuration-Driven Development

### Key Principles

1. **No Hardcoded Logic**: Widget behavior must be configurable via props from backend JSON
2. **Data Binding**: Use datasource bindings instead of direct API calls in components
3. **Action Engine**: User interactions trigger configured actions, not inline handlers
4. **Validation**: Validation rules come from configuration, not component code

### Page Configuration Example

A complete dashboard page defined in JSON from backend:

```json
{
  "pageId": "dashboard",
  "title": "Dashboard",
  "widgets": [
    {
      "id": "revenue-kpi",
      "type": "KPI",
      "datasourceId": "revenue",
      "props": { "label": "Revenue", "format": "currency" }
    }
  ],
  "datasources": [
    {
      "id": "revenue",
      "kind": "http",
      "http": { "method": "GET", "url": "/api/kpi/revenue" }
    }
  ]
}
```

## Development Workflow

### Issue-Based Development

All development follows an **issue-driven approach**:

1. Work is defined in `ISSUE-XXX-*.md` files in the project root
2. Follow step-by-step instructions in issue files
3. When complete, create `ISSUE-XXX-COMPLETION.md` documenting delivery
4. **Always update** `/documentation/roadmap.md` with completed tasks

### Code Style

- **BiomeJS** enforces code style automatically
- 2-space indentation, 100 char line width
- Single quotes for strings, trailing commas, semicolons
- Pre-commit hooks run formatting via lint-staged

### Widget Development

When creating new widgets:

1. Install required shadcn/ui components: `npx shadcn@latest add <component>`
2. Define TypeScript interface for widget config
3. Implement widget component wrapping shadcn/ui
4. Add to widget registry in `src/widgets/index.ts`
5. Write tests alongside the widget
6. Update widget catalog documentation

### Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('WidgetName', () => {
  it('renders with configuration', () => {
    const config = { /* configuration */ };
    render(<WidgetName config={config} />);
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const onEvent = vi.fn();
    const user = userEvent.setup();
    render(<WidgetName config={config} events={{ onEvent }} />);
    await user.click(screen.getByRole('button'));
    expect(onEvent).toHaveBeenCalled();
  });
});
```

## Important Constraints

1. **No Frontend Business Logic**: All logic must be configurable from backend
2. **Stable Widget Contracts**: Widget interfaces should not break backward compatibility
3. **Accessibility Required**: All interactive elements must be accessible (Radix UI handles this)
4. **No Direct API Calls in Widgets**: Use datasource bindings instead
5. **Configuration First**: Design JSON configuration before coding

## Environment Variables

Key environment variables (see `.env.example`):

- `VITE_API_URL` - Backend API base URL
- `VITE_AUTH_PROVIDER` - 'custom' or 'msal' (Azure)
- `VITE_OAUTH_CLIENT_ID` - Custom OAuth client ID
- `VITE_AZURE_CLIENT_ID` - Azure MSAL client ID
- `VITE_ENABLE_WEBSOCKET` - Enable real-time updates
- `VITE_LOG_LEVEL` - Logging verbosity

## Documentation

Comprehensive documentation in `/documentation/`:
- `architecture.md` - System architecture
- `widget-catalog.md` - Widget specifications
- `api-specification.md` - Backend API contracts
- `getting-started.md` - Project introduction
- `roadmap.md` - Implementation roadmap