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

- **Frontend**: React 19.2.3 (Create React App)
- **Testing**: Jest with React Testing Library
- **Build Tool**: react-scripts
- **Configuration**: JSON-based API contracts
- **Architecture**: Widget registry pattern with configuration engine

## Development Commands

```bash
npm start          # Development server (http://localhost:3000)
npm test          # Run tests in watch mode
npm run build     # Production build
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
2. **Widget Pattern**: Each widget must have a stable contract with:
   - Props interface (TypeScript or PropTypes)
   - Bindings for data connections
   - Event handlers for user interactions
   - Policy support for visibility/permissions

3. **Component Structure**:
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

### Widget Development Guidelines

When creating or modifying widgets:

1. **Stable Contracts**: Define clear TypeScript interfaces for all widget props
2. **Accessibility**: Support WCAG 2.1 Level AA standards
   - Proper ARIA labels and roles
   - Keyboard navigation
   - Screen reader support
   - Focus management
3. **Responsive Design**: Mobile-first approach, adapt to all screen sizes
4. **Composability**: Widgets should be nestable and reusable
5. **Performance**: Lazy loading support, optimized rendering

### Widget Categories

The platform has a comprehensive widget catalog (see `/documentation/widget-catalog.md`) with 30+ widgets, but the **MVP focuses on 12 core widgets** (see `/documentation/widget-taxonomy.md`):

**MVP Core Widgets (12):**
- **Layout & Structure** (4 widgets): Page, Section, Grid, Card
- **Form Inputs** (4 widgets): TextInput, Select, DatePicker, Checkbox
- **Data Display** (2 widgets): Table, KPI
- **Dialogs & Feedback** (2 widgets): Modal, Toast

**Extended Widget Catalog** includes additional widgets like Tabs, Toolbar, Textarea, MultiSelect, DateRangePicker, RadioGroup, Switch, FileUpload, ImagePicker, Chart, Timeline, Badge, Breadcrumbs, Pagination, Drawer, ConfirmDialog, Alert, Spinner, and ProgressBar.

## File Organization

```
/src                    # Source code (Create React App structure)
  App.js               # Main application component
  App.test.js          # App tests
  index.js             # Application entry point
  setupTests.js        # Test configuration
/documentation         # Comprehensive project docs
  architecture.md      # System architecture
  widget-catalog.md    # Complete widget specifications (30+ widgets)
  widget-taxonomy.md   # MVP core widgets (12 widgets)
  api-specification.md # Backend API contracts
  json-schemas.md      # Configuration schemas
  getting-started.md   # Project introduction
  roadmap.md          # Implementation roadmap with progress tracking
/public               # Static assets
/.github              # GitHub configurations
  copilot-instructions.md  # This file
/ISSUE-*.md           # Active issue definitions (development tasks)
/ISSUE-*-COMPLETION.md     # Completed issue documentation
```

**Future structure** (as implementation progresses):
```
/src/widgets          # Widget library components
/src/core             # Core rendering engine
/src/state            # State management
```

## Documentation

**Always reference documentation** before making changes:
- `/documentation/architecture.md` - System design and component architecture
- `/documentation/widget-catalog.md` - All widget specifications
- `/documentation/api-specification.md` - Backend API contracts
- `/documentation/json-schemas.md` - Configuration formats
- `/documentation/getting-started.md` - Project introduction

## Testing Guidelines

1. **Component Testing**: Use React Testing Library
2. **Test Widget Contracts**: Verify props, events, and rendering
3. **Accessibility Testing**: Include a11y checks in widget tests
4. **Integration Testing**: Test widget interactions with config engine
5. **No Hardcoded Test Data**: Use mock configurations that match JSON schemas

### Test Structure
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

- **Current Phase**: Phase 1 - Core Platform (MVP Renderer) 🚀
- **Completed Phases**: 
  - ✅ Phase 0 - Discovery & Foundation (100%)
  - 🚀 Authentication & Token Management (Phase 1.1 - 75%)
- **Architecture**: Fully documented in `/documentation/`
- **Widget Specifications**: 
  - 12 core MVP widgets defined in `/documentation/widget-taxonomy.md`
  - 30+ widgets in full catalog in `/documentation/widget-catalog.md`
- **Implementation**: Authentication flow complete (Issues #007-#009), widget implementation next

**Recent Completions:**
- ✅ ISSUE-004: Technical Stack Finalization
- ✅ ISSUE-005: Development Environment Setup
- ✅ ISSUE-006: Project Repository Structure
- ✅ ISSUE-007: Login Page Implementation
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
