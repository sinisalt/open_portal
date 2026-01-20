# Copilot Instructions for OpenPortal

## Project Overview

OpenPortal is an **API-driven Business UI Platform** where the frontend is a generic React rendering engine and all UI structure, logic, and workflows are configured via backend APIs. The key principle is **zero frontend changes for new features** - everything is configuration-driven.

### Core Architecture Principles

1. **Configuration-Driven UI**: All pages, widgets, and behaviors are defined in JSON configurations from backend APIs
2. **Widget-Based Design**: Reusable components with stable contracts (props, bindings, events)
3. **Separation of Concerns**: Business logic lives in backend; frontend is purely a rendering engine
4. **Generic Frontend**: No hardcoded UI logic; everything comes from API configurations
5. **Smart Caching**: Static configs cached locally, dynamic data fetched on demand

## Technology Stack

### Current Stack (Phase 0.5 Migration in Progress)

**⚠️ MIGRATION NOTICE:** The project is undergoing a technology stack migration (Phase 0.5). See ADR-012 for rationale.

**Target Stack (Phase 0.5+):**
- **Frontend**: React 19.2.3
- **Build Tool**: Vite 6
- **Language**: TypeScript 5 (strict mode for new files, JavaScript for existing)
- **Routing**: TanStack Router v1.132 (file-based routing)
- **Data Fetching**: TanStack Query v5.90
- **State Management**: TanStack Store v0.8 + React Context
- **UI Components**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS v4.1
- **Authentication**: Azure MSAL + Custom OAuth (dual, feature-flag switched)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + Playwright (migrating from Jest)
- **Code Quality**: BiomeJS Ultracite preset
- **Configuration**: JSON-based API contracts
- **Architecture**: Widget registry pattern with 3-layer widget architecture

**Legacy Stack (Phase 0-1.1, being replaced):**
- **Build Tool**: Create React App 5.0.1 ❌ (removing in ISSUE-010)
- **Language**: JavaScript ❌ (migrating to TypeScript in ISSUE-010)
- **Routing**: React Router v6 ❌ (replacing with TanStack Router in ISSUE-012)
- **UI Components**: Custom widgets ❌ (replacing with shadcn/ui in ISSUE-011)
- **Testing**: Jest + React Testing Library ⚠️ (coexisting with Vitest during transition)
- **Code Quality**: ESLint + Prettier ❌ (replacing with BiomeJS in ISSUE-010)

### Widget Architecture (3 Layers)

```
Layer 1: Radix UI Primitives (headless, accessible)
   ↓
Layer 2: shadcn/ui Components (styled, Tailwind-based)
   ↓
Layer 3: OpenPortal Widgets (configuration contracts)
   ↓
Layer 4: Widget Registry (dynamic rendering)
```

See `/documentation/WIDGET-ARCHITECTURE.md` for details.

## Development Commands

### During Migration (Phase 0.5)
```bash
# Legacy (CRA) - Phase 0-1.1
npm start          # Development server (http://localhost:3000)
npm test          # Jest tests
npm run build     # Production build

# After ISSUE-010 (Vite migration)
npm run dev        # Vite dev server (http://localhost:3000)
npm run build      # Vite production build
npm run preview    # Preview production build
npm run lint       # BiomeJS linting
npm run lint:fix   # BiomeJS auto-fix
npm run format     # BiomeJS formatting
npm test          # Vitest tests (for new TS code)
npm run test:e2e   # Playwright E2E tests
```

### shadcn Component Installation
```bash
# Install components as needed (after ISSUE-011)
npx shadcn@latest add <component-name>

# Example:
npx shadcn@latest add input button card
```

## Development Workflow

### Issue-Based Development

All development work follows an **issue-driven approach**:

1. **Issue Files**: Development tasks are defined in `ISSUE-XXX-*.md` files in the project root
2. **Step-by-Step Execution**: Each issue contains detailed development steps to follow
3. **Completion Tracking**: When an issue is completed, create an `ISSUE-XXX-COMPLETION.md` file documenting:
   - What was delivered
   - Acceptance criteria met
   - Files created/modified
   - Testing performed
   - Any relevant notes or decisions

4. **Roadmap Updates**: After completing an issue, **always update** `/documentation/roadmap.md`:
   - Mark completed tasks with `[x]` checkboxes in the relevant phase section
   - Update the "Overall Progress Summary" section at the end of the roadmap
   - Update phase completion percentages
   - Update the "Version" and "Last Updated" metadata at the bottom
   - Document any deviations or learnings

### Development Process

1. Read the issue file thoroughly
2. Follow the defined steps in order
3. Test each deliverable
4. Create completion documentation (ISSUE-XXX-COMPLETION.md)
5. **Update the roadmap with completed tasks** (both specific tasks AND overall progress summary)
6. Commit changes with reference to issue number

**CRITICAL**: Before finalizing any PR, verify that:
- The specific task checkboxes `[ ]` → `[x]` are updated in the roadmap
- The "Overall Progress Summary" section reflects the current state
- Phase completion percentages are accurate
- The "Last Updated" date is current

**Example:**
- Issue file: `ISSUE-002-CONFIGURATION-SCHEMA.md`
- Completion file: `ISSUE-002-COMPLETION.md`
- Roadmap update: 
  1. Mark "Configuration schema draft" as `[x]` in Phase 0
  2. Update "Overall Progress Summary" section to reflect Phase 0 completion percentage
  3. Update "Last Updated" date

### Roadmap Maintenance

The roadmap (`/documentation/roadmap.md`) serves as the single source of truth for project progress. It must be kept up-to-date on every PR that completes work:

**Two-Level Update Required:**
1. **Specific Task Level**: Update checkboxes in the detailed phase sections (e.g., Phase 1.1)
2. **Overall Progress Level**: Update the "Overall Progress Summary" section at the end with:
   - Phase completion percentages (e.g., "Phase 1.1 - 75% Complete")
   - Completed issue references (e.g., "ISSUE-007")
   - Status indicators (✅ Complete, 🚀 In Progress, ⏳ Pending)

**Metadata Updates:**
- Update "Version" (increment minor version for each update)
- Update "Last Updated" date to current date
- Update "Status" if phase changes (e.g., "Planning Phase" → "Active Development - Phase 1")

**Why This Matters:**
- Provides accurate project status at a glance
- Helps stakeholders track progress
- Prevents confusion about what's been completed
- Makes it easy to resume work or onboard new contributors

## Coding Standards

### React Components

1. **Functional Components**: Use React functional components with hooks
2. **TypeScript for New Code**: All new components should be TypeScript (.tsx)
3. **Widget Pattern**: Each widget must have a stable contract with:
   - Config interface (TypeScript)
   - Bindings for data connections
   - Event handlers for user interactions
   - Policy support for visibility/permissions

4. **Widget Component Structure** (Post-Phase 0.5):
   ```typescript
   // OpenPortal widget wrapping shadcn component
   import { Input } from '@/components/ui/input'
   import { Label } from '@/components/ui/label'
   import { WidgetProps } from '@/types/widget'
   
   interface TextInputWidgetConfig extends WidgetConfig {
     type: 'TextInput'
     label: string
     placeholder?: string
     required?: boolean
   }
   
   export function TextInputWidget({ config, bindings, events }: WidgetProps<TextInputWidgetConfig>) {
     const { id, label, placeholder, required } = config
     const value = bindings?.value ?? ''
     
     return (
       <div className="space-y-2">
         <Label htmlFor={id}>
           {label}
           {required && <span className="text-destructive ml-1">*</span>}
         </Label>
         <Input
           id={id}
           value={value}
           placeholder={placeholder}
           onChange={(e) => events?.onChange?.(e.target.value)}
         />
       </div>
     )
   }
   ```

5. **Legacy Component Structure** (Pre-Phase 0.5):
   ```javascript
   // Widget components should follow this pattern:
   function WidgetName({ config, data, onEvent }) {
     // Widget implementation
   }
   ```

### Configuration-Driven Development

1. **No Hardcoded Logic**: Widget behavior must be configurable via props
2. **Data Binding**: Use datasource bindings instead of direct API calls in components
3. **Action Engine**: User interactions trigger configured actions, not inline handlers
4. **Validation**: Validation rules come from configuration, not component code

### New Stack Patterns (Phase 0.5+)

#### TypeScript Usage
- **Strict Mode**: Enabled for all new TypeScript files
- **Existing JavaScript**: Keep working, convert incrementally
- **Type Definitions**: Define interfaces for all widget configs
- **Path Aliases**: Use `@/` for imports (e.g., `@/components/ui/button`)

#### Tailwind CSS Patterns
```typescript
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  error && "error-classes",
  disabled && "disabled-classes"
)} />
```

#### TanStack Router Patterns
```typescript
// File-based routing in src/routes/
// Example: src/routes/login.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: async ({ location }) => {
    // Auth checks, redirects, etc.
  },
})
```

#### Widget Registry Pattern
```typescript
// Register widgets at app startup
import { widgetRegistry } from '@/core/registry/WidgetRegistry'
import { TextInputWidget } from '@/widgets/TextInputWidget'

widgetRegistry.register('TextInput', TextInputWidget)

// Render dynamically from configuration
<WidgetRenderer
  config={{ type: 'TextInput', id: 'email', label: 'Email' }}
  bindings={{ value: email }}
  events={{ onChange: setEmail }}
/>
```

#### Azure MSAL Authentication Pattern
```typescript
// Feature flag switching between auth providers
const authProvider = import.meta.env.VITE_AUTH_PROVIDER || 'custom'

// Custom OAuth (existing)
if (authProvider === 'custom') {
  return <LoginPage />
}

// Azure MSAL (new)
if (authProvider === 'msal') {
  return <LoginPageMSAL />
}
```

### Widget Development Guidelines

When creating or modifying widgets (Phase 0.5+):

1. **Use shadcn/ui as Foundation**:
   - Check `/documentation/WIDGET-COMPONENT-MAPPING.md` for component mapping
   - Install required shadcn components first: `npx shadcn@latest add <component>`
   - Wrap shadcn components with OpenPortal widget contract

2. **3-Layer Architecture**:
   - Layer 1: Radix UI (accessibility, interactions)
   - Layer 2: shadcn/ui (styling, design system)
   - Layer 3: OpenPortal Widget (configuration contract)
   - Layer 4: Widget Registry (dynamic rendering)

3. **Widget Development Workflow**:
   ```bash
   # 1. Install shadcn components
   npx shadcn@latest add input label
   
   # 2. Create widget config type
   # src/widgets/TextInputWidget/types.ts
   
   # 3. Implement widget component
   # src/widgets/TextInputWidget/TextInputWidget.tsx
   
   # 4. Write tests
   # src/widgets/TextInputWidget/TextInputWidget.test.tsx
   
   # 5. Register widget
   # Add to src/widgets/index.ts
   ```

4. **Stable Contracts**: Define clear TypeScript interfaces for all widget configs
   ```typescript
   interface TextInputWidgetConfig extends WidgetConfig {
     type: 'TextInput'
     label: string
     placeholder?: string
     required?: boolean
     // ... other props
   }
   ```

5. **Accessibility**: Radix UI handles WCAG 2.1 Level AA compliance automatically
   - ARIA attributes managed by Radix
   - Keyboard navigation built-in
   - Screen reader support included
   - Focus management automatic

6. **Responsive Design**: Use Tailwind responsive classes
   ```typescript
   <div className="w-full md:w-1/2 lg:w-1/3">
     {/* Responsive widget */}
   </div>
   ```

7. **Performance**:
   - Widgets lazy-loadable via dynamic imports
   - shadcn components are tree-shakeable
   - Minimal bundle size (1-5KB per component)

### Widget Categories

The platform has a comprehensive widget catalog (see `/documentation/widget-catalog.md`) with 30+ widgets, but the **MVP focuses on 12 core widgets** (see `/documentation/widget-taxonomy.md` and `/documentation/WIDGET-COMPONENT-MAPPING.md`):

**MVP Core Widgets (12):**
- **Layout & Structure** (4 widgets): Page, Section, Grid, Card
- **Form Inputs** (4 widgets): TextInput, Select, DatePicker, Checkbox
- **Data Display** (2 widgets): Table, KPI
- **Dialogs & Feedback** (2 widgets): Modal, Toast

**Implementation Status:**
- Phase 0.5: TextInputWidget (POC) - ISSUE-014
- Phase 1.3: Remaining 11 widgets

**Extended Widget Catalog** includes additional widgets like Tabs, Toolbar, Textarea, MultiSelect, DateRangePicker, RadioGroup, Switch, FileUpload, ImagePicker, Chart, Timeline, Badge, Breadcrumbs, Pagination, Drawer, ConfirmDialog, Alert, Spinner, and ProgressBar (implemented in later phases).

## File Organization

### Current Structure (Legacy CRA)
```
/src                    # Source code (Create React App structure - Phase 0-1.1)
  App.js               # Main application component
  App.test.js          # App tests
  index.js             # Application entry point
  setupTests.js        # Test configuration
  /components          # React components (LoginPage, OAuthCallback)
  /services            # Services (authService, tokenManager, httpClient)
  /hooks               # Custom hooks (useAuth)
/documentation         # Comprehensive project docs
  architecture.md      # System architecture
  widget-catalog.md    # Complete widget specifications (30+ widgets)
  widget-taxonomy.md   # MVP core widgets (12 widgets)
  WIDGET-ARCHITECTURE.md          # NEW: 3-layer widget architecture
  WIDGET-COMPONENT-MAPPING.md     # NEW: MVP widgets → shadcn mapping
  api-specification.md # Backend API contracts
  json-schemas.md      # Configuration schemas
  getting-started.md   # Project introduction
  roadmap.md          # Implementation roadmap with progress tracking
  /adr                 # Architecture Decision Records
    ADR-001-build-tool.md
    ADR-003-ui-component-library.md
    ADR-012-technology-stack-revision.md  # NEW
/public               # Static assets
/.github              # GitHub configurations
  copilot-instructions.md  # This file
  /issues             # Issue definitions
    010-migration-vite-typescript.md      # NEW
    011-migration-shadcn-setup.md         # NEW
    012-migration-tanstack-router.md      # NEW
    013-migration-azure-msal.md           # NEW
    014-migration-widget-registry.md      # NEW
/ISSUE-*.md           # Active issue definitions (root - being deprecated)
/ISSUE-*-COMPLETION.md     # Completed issue documentation
```

### Target Structure (Post-Phase 0.5)
```
/src
  main.tsx            # Application entry point (Vite + TypeScript)
  App.tsx             # Main application component
  /routes             # TanStack Router file-based routes
    __root.tsx        # Root layout
    index.tsx         # Home page
    login.tsx         # Login page
    oauth-callback.tsx # OAuth callback
  /components
    /ui               # shadcn/ui components (managed by CLI)
      input.tsx
      button.tsx
      card.tsx
      label.tsx
    LoginPage.js      # Legacy (preserved)
    LoginPageMSAL.tsx # NEW: Azure MSAL login
    OAuthCallback.js  # Legacy (preserved)
    AuthProvider.tsx  # NEW: Auth provider wrapper
  /widgets            # OpenPortal widgets (Layer 3)
    index.ts          # Widget registration
    /TextInputWidget
      TextInputWidget.tsx
      TextInputWidget.test.tsx
      types.ts
      index.ts
  /core
    /registry
      WidgetRegistry.ts         # Widget registry (Layer 4)
      WidgetRegistry.test.ts
    /renderer
      WidgetRenderer.tsx        # Dynamic widget renderer
  /services           # Services (preserved)
    authService.js
    tokenManager.js
    httpClient.js
  /hooks              # Custom hooks
    useAuth.js        # Legacy (preserved)
    useMsalAuth.ts    # NEW: MSAL auth hook
  /config
    msalConfig.ts     # NEW: Azure MSAL config
  /lib
    utils.ts          # NEW: cn() and other utilities
  /types
    widget.ts         # NEW: Widget type definitions
/documentation
  # (same as above, with new files added)
index.html            # Root HTML (moved from /public)
vite.config.ts        # NEW: Vite configuration
tsconfig.json         # NEW: TypeScript configuration
tsconfig.node.json    # NEW: TypeScript config for Vite
biome.json            # NEW: BiomeJS configuration
tailwind.config.js    # NEW: Tailwind CSS configuration
postcss.config.js     # NEW: PostCSS configuration
components.json       # NEW: shadcn/ui CLI configuration
```

## Documentation

**Always reference documentation** before making changes:
- `/documentation/architecture.md` - System design and component architecture
- `/documentation/WIDGET-ARCHITECTURE.md` - **NEW: 3-layer widget architecture**
- `/documentation/WIDGET-COMPONENT-MAPPING.md` - **NEW: MVP widgets → shadcn components**
- `/documentation/widget-catalog.md` - All widget specifications
- `/documentation/api-specification.md` - Backend API contracts
- `/documentation/json-schemas.md` - Configuration formats
- `/documentation/getting-started.md` - Project introduction

## Testing Guidelines

### Legacy Testing (Pre-Phase 0.5)
1. **Framework**: Jest + React Testing Library
2. **Coverage**: >80% for authentication code (41 tests passing)
3. **Files**: `*.test.js` files alongside components

### New Testing (Phase 0.5+)
1. **Framework**: Vitest + React Testing Library (for TypeScript code)
2. **Test Widget Contracts**: Verify props, events, and rendering
3. **Accessibility Testing**: Radix UI handles most a11y, verify integration
4. **Integration Testing**: Test widget interactions with config engine
5. **No Hardcoded Test Data**: Use mock configurations that match JSON schemas

### Test Structure (TypeScript/Vitest)
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextInputWidget } from './TextInputWidget'
import { TextInputWidgetConfig } from './types'

describe('TextInputWidget', () => {
  const config: TextInputWidgetConfig = {
    id: 'email',
    type: 'TextInput',
    label: 'Email Address',
  }

  it('renders label and input', () => {
    render(<TextInputWidget config={config} />)
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })

  it('calls onChange event', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    
    render(<TextInputWidget config={config} events={{ onChange }} />)
    
    const input = screen.getByLabelText('Email Address')
    await user.type(input, 'test@example.com')
    
    expect(onChange).toHaveBeenCalledWith('test@example.com')
  })
})
```

### Test Structure (Legacy JavaScript/Jest)
```javascript
import { render, screen } from '@testing-library/react';
import WidgetName from './WidgetName';

test('renders widget with configuration', () => {
  const config = { /* configuration object */ };
  render(<WidgetName config={config} />);
  // Assertions
});
```

## Key Design Patterns

### 1. Widget Registry Pattern
Map widget types to React components:
```javascript
const widgetRegistry = {
  'TextInput': TextInputWidget,
  'Button': ButtonWidget,
  // ...
};
```

### 2. Configuration Rendering
Parse JSON config and render widgets dynamically:
```javascript
function renderWidget(config) {
  const Component = widgetRegistry[config.type];
  return <Component {...config.props} />;
}
```

### 3. Action Engine
Execute configured actions (API calls, navigation, validation):
```javascript
const actionHandlers = {
  'executeAction': executeActionHandler,
  'navigate': navigateHandler,
  // ...
};
```

### 4. Datasource Pattern
Separate data fetching from rendering:
```javascript
const datasources = {
  'user-data': { kind: 'http', url: '/api/users' },
  'static-content': { kind: 'static', data: {...} }
};
```

## Common Tasks

### Adding a New Widget

1. Create widget component in `/src/widgets/`
2. Define TypeScript interface for props
3. Implement accessibility features
4. Add to widget registry
5. Create tests
6. Document in `/documentation/widget-catalog.md`

### Modifying Configuration Schema

1. Update JSON schema in `/documentation/json-schemas.md`
2. Update relevant TypeScript interfaces
3. Modify parsing logic in config engine
4. Update tests
5. Document changes

### Working with API Contracts

1. Reference `/documentation/api-specification.md`
2. Backend provides all configuration and data
3. Frontend never makes direct business logic decisions
4. All validation rules come from backend config

## Important Constraints

1. **No Frontend Business Logic**: All logic must be configurable from backend
2. **Stable Widget Contracts**: Widget interfaces should not break backward compatibility
3. **Configuration Validation**: Validate all JSON configs against schemas
4. **Accessibility Required**: All interactive elements must be accessible
5. **No Direct API Calls in Widgets**: Use datasource bindings instead
6. **Performance First**: Consider bundle size and rendering performance

## Project Status

- **Current Phase**: Phase 0.5 - Technology Stack Migration 🚀
- **Completed Phases**: 
  - ✅ Phase 0 - Discovery & Foundation (100%)
  - 🚀 Phase 1.1 - Authentication & Token Management (75% - paused for migration)
- **Architecture**: Fully documented in `/documentation/`
- **Technology Stack**: Migrating to Vite + TypeScript 5 + shadcn/ui + TanStack ecosystem
  - See ADR-012 for rationale
  - See Phase 0.5 issues (ISSUE-010 through ISSUE-014) for implementation
- **Widget Specifications**: 
  - 12 core MVP widgets defined in `/documentation/widget-taxonomy.md`
  - Widget architecture documented in `/documentation/WIDGET-ARCHITECTURE.md`
  - Component mapping in `/documentation/WIDGET-COMPONENT-MAPPING.md`
  - 30+ widgets in full catalog in `/documentation/widget-catalog.md`
- **Implementation**: 
  - Authentication flow complete (Issues #007-#009) ✅
  - Technology stack migration (Phase 0.5) - in progress
  - Widget implementation (Phase 1.3) - pending after migration

**Recent Completions:**
- ✅ ISSUE-001 through ISSUE-009: Phase 0 and partial Phase 1.1
- 🚀 Phase 0.5 Planning: Issues #010-#014 created, ADR-012 written

**Migration Issues (Phase 0.5):**
- ⏳ ISSUE-010: Vite + TypeScript 5 + BiomeJS - pending
- ⏳ ISSUE-011: Tailwind CSS + shadcn/ui setup - pending
- ⏳ ISSUE-012: TanStack Router migration - pending
- ⏳ ISSUE-013: Azure MSAL parallel implementation - pending
- ⏳ ISSUE-014: Widget registry + TextInputWidget POC - pending
- ✅ ISSUE-008: OAuth Integration
- ✅ ISSUE-009: Token Management System

## Code Review Checklist

Before submitting changes:
- [ ] Follows configuration-driven pattern (no hardcoded logic)
- [ ] Widget has stable contract (props, bindings, events)
- [ ] Includes accessibility features (ARIA, keyboard, focus)
- [ ] Has comprehensive tests
- [ ] Responsive design implemented
- [ ] Documentation updated
- [ ] No business logic in frontend components
- [ ] Performance optimized (lazy loading, memoization)
- [ ] Issue completion file created (if applicable)
- [ ] **Roadmap updated with completed tasks (specific checkboxes AND overall progress summary)**
- [ ] **Roadmap "Last Updated" date is current**
- [ ] **Phase completion percentages are accurate**

## Common Pitfalls to Avoid

1. ❌ Hardcoding business logic in components
2. ❌ Making direct API calls from widgets
3. ❌ Creating widget-specific state management
4. ❌ Breaking widget contract backward compatibility
5. ❌ Ignoring accessibility requirements
6. ❌ Adding features without backend configuration support

## Resources

- Project Documentation: `/documentation/`
- Widget Specifications: `/documentation/widget-catalog.md`
- Architecture Guide: `/documentation/architecture.md`
- API Contracts: `/documentation/api-specification.md`
- Getting Started: `/documentation/getting-started.md`
- Implementation Roadmap: `/documentation/roadmap.md`
- Issue Files: `ISSUE-*.md` in project root

## Best Practices for OpenPortal

1. **Think Configuration First**: Before coding, design the JSON configuration
2. **Widget Reusability**: Make widgets generic and reusable across contexts
3. **Test with Configs**: Test components with various configuration scenarios
4. **Document Contracts**: Update widget catalog when changing interfaces
5. **Performance Matters**: Cache configurations, lazy load widgets
6. **Accessibility Always**: Built-in, not bolted-on
7. **Backend Drives Frontend**: Frontend reflects backend configuration faithfully

---

*Last Updated: January 19, 2026*  
*For questions or clarifications, refer to `/documentation/` or project maintainers.*
