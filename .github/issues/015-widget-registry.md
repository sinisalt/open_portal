# Issue #015: Widget Registry System

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 5-7  
**Component:** Frontend  
**Estimated Effort:** 2-3 days  
**Priority:** Critical  
**Labels:** phase-1, frontend, widgets, foundation, architecture

**Updated:** January 23, 2026 - Aligned with shadcn/ui approach (ADR-012)

## Description
Implement the widget registry system that maps widget type strings to React components, manages widget lifecycle, and provides the foundation for the configuration-driven rendering engine.

**Note:** This issue has been updated to align with the 3-layer widget architecture (Radix UI → shadcn/ui → OpenPortal Widgets → Widget Registry) as defined in ADR-012 and WIDGET-ARCHITECTURE.md. The registry will map to widgets that wrap shadcn/ui components, not custom-built components.

## Acceptance Criteria
- [ ] Widget registry implementation
- [ ] Widget registration API
- [ ] Type-safe widget retrieval
- [ ] Widget prop validation
- [ ] Default widget props support
- [ ] Widget error boundaries
- [ ] Widget lazy loading support
- [ ] Widget lifecycle hooks
- [ ] Development mode warnings
- [ ] Unknown widget handling

## Registry Interface
```typescript
interface WidgetRegistry {
  register<T>(type: string, component: React.ComponentType<T>, schema?: JSONSchema): void;
  get(type: string): React.ComponentType | null;
  has(type: string): boolean;
  getAll(): Map<string, WidgetDefinition>;
  unregister(type: string): void;
}

interface WidgetDefinition {
  type: string;
  component: React.ComponentType;
  schema?: JSONSchema;
  lazy?: boolean;
  displayName?: string;
  category?: string;
}
```

## Core Features
- [ ] Centralized widget registration
- [ ] Type safety for widget props
- [ ] Runtime prop validation (dev mode)
- [ ] Widget metadata storage
- [ ] Widget categorization
- [ ] Lazy loading configuration
- [ ] Widget aliases support

## Widget Wrapper
- [ ] Error boundary for each widget
- [ ] Loading state handling
- [ ] Widget-level error display
- [ ] Widget ID tracking
- [ ] Performance monitoring hooks
- [ ] Debug mode information

**Note:** Widgets wrap shadcn/ui components which are built on Radix UI primitives. Accessibility (ARIA, keyboard nav, focus management) is handled by Radix UI automatically.

## Dependencies
- Depends on: #001 (Widget taxonomy)
- Depends on: #002 (Configuration schema)
- Depends on: #006 (Repository structure)
- Depends on: #014 (Widget Registry POC - validates architecture)
- References: WIDGET-ARCHITECTURE.md (3-layer architecture)
- References: WIDGET-COMPONENT-MAPPING.md (component mapping)

## Technical Notes
- Use React.lazy for code splitting
- Implement Suspense boundaries
- Validate props in development mode only
- Support HOC patterns for widget enhancement
- Enable widget composition
- Support widget inheritance patterns

## Widget Loading Strategy
```typescript
// Static registration (bundled) - shadcn-based widgets
import { TextInputWidget } from '@/widgets/TextInputWidget'
import { SelectWidget } from '@/widgets/SelectWidget'

registry.register('TextInput', TextInputWidget);
registry.register('Select', SelectWidget);

// Lazy registration (code-split) - for heavy widgets
registry.register('Chart', React.lazy(() => import('./ChartWidget')), {
  lazy: true
});
```

**Widget Architecture:**
```
Radix UI Primitive → shadcn Component → OpenPortal Widget → Registry
Example: @radix-ui/react-label → Input → TextInputWidget → widgetRegistry.get('TextInput')
```

## Error Handling
- [ ] Graceful degradation for missing widgets
- [ ] Fallback widget for unknown types
- [ ] Error boundary per widget instance
- [ ] Error reporting to monitoring
- [ ] Development mode error details

## Testing Requirements
- [ ] Unit tests for registry operations
- [ ] Test widget registration
- [ ] Test widget retrieval
- [ ] Test error boundaries
- [ ] Test lazy loading
- [ ] Test prop validation
- [ ] Performance benchmarks

## Developer Experience
- [ ] TypeScript support for widget props
- [ ] Clear error messages
- [ ] DevTools integration
- [ ] Widget inspector in dev mode
- [ ] Hot reload support

## Documentation
- [ ] Widget registry API documentation
- [ ] Widget creation guide
- [ ] Widget registration patterns
- [ ] Error handling guide
- [ ] Performance best practices

## Deliverables
- Widget registry implementation (extends ISSUE-014 POC)
- Widget wrapper component with error boundaries
- Widget renderer component (dynamic rendering from config)
- Registry tests
- Documentation
- Example widgets (TextInputWidget already implemented in ISSUE-014)

## References
- **ISSUE-014:** TextInputWidget POC validates architecture
- **WIDGET-ARCHITECTURE.md:** Complete 3-layer architecture documentation
- **WIDGET-COMPONENT-MAPPING.md:** shadcn component mappings for all MVP widgets
- **ADR-012:** Technology Stack Revision rationale
