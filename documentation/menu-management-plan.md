# Menu Management Implementation Plan

**Created:** January 25, 2026  
**Status:** Planning Complete - Ready for Implementation  
**Issues:** #030, #031, #032  
**Estimated Effort:** 12 days

## Overview

This document outlines the comprehensive menu management solution for OpenPortal, addressing the requirement for dynamic, configuration-driven navigation with support for three menu types: top menu, side menu, and footer menu.

## Background

The platform already has backend support for menus:
- ✅ Menu configuration stored in database (`menu_configs` table)
- ✅ Menu API endpoint (`/ui/bootstrap` returns menu structure)
- ✅ Role-based menu configurations
- ✅ Permission-based server-side filtering
- ✅ JSON schema definitions for menu items

**What was missing:** Frontend implementation to render and manage these menus dynamically.

## Solution Architecture

The solution is implemented across three issues, each addressing a specific layer:

### Layer 1: Presentation (ISSUE-030) - Menu Components
**Effort:** 5 days

Build the UI components for rendering menus:
- **TopMenu:** Horizontal navigation bar with dropdown submenus
- **SideMenu:** Vertical sidebar with icons, text, collapsible groups
- **FooterMenu:** Horizontal footer navigation
- **Header:** Unified header with logo, branding, and top menu

**Technology:**
- React + TypeScript
- shadcn/ui components (navigation-menu, dropdown-menu, sheet)
- Tailwind CSS for styling
- Lucide React for icons
- Responsive design (mobile drawer)

### Layer 2: State & Integration (ISSUE-031) - Menu State Management
**Effort:** 4 days

Implement state management and API integration:
- **TanStack Store:** Menu state (active item, expanded groups, collapsed state)
- **Bootstrap API:** Fetch menu configuration from `/ui/bootstrap`
- **Dynamic Refresh:** Update menus on navigation or action execution
- **Persistence:** Save UI preferences to localStorage
- **Multi-Menu:** Support multiple menu instances (top, side, footer)

**Technology:**
- TanStack Store for state
- TanStack Router for navigation
- Session storage for menu caching
- LocalStorage for UI preferences

### Layer 3: Configuration (ISSUE-032) - Menu Widget System
**Effort:** 3 days

Create menu widgets for the widget registry:
- **MenuWidget:** Configuration-driven menu rendering
- **Widget Registry:** Register menu widgets
- **Configuration Schema:** Define menu widget contracts
- **Dynamic Bindings:** Support datasource-driven menus
- **Visibility Policies:** Show/hide menus based on permissions

**Technology:**
- Widget registry integration
- Configuration contracts
- Datasource bindings
- Visibility policies

## Menu Types

### 1. Top Menu (Horizontal Navigation)
- **Position:** Top of page, horizontal
- **Style:** Text-based menu items
- **Submenus:** Dropdown on hover/click (one level minimum)
- **Mobile:** Hamburger menu icon, opens drawer
- **Use Cases:** Main navigation, global actions

**Example:**
```
[Logo] [Dashboard] [Reports ▾] [Settings ▾]        [User ▾]
```

### 2. Side Menu (Vertical Sidebar)
- **Position:** Left side, vertical
- **Style:** Icons + text for main items, text-only for submenus
- **Collapsible:** Can collapse to icon-only mode
- **Expandable Groups:** Click to expand/collapse submenu groups
- **Mobile:** Hidden by default, accessible via hamburger
- **Use Cases:** Primary navigation, hierarchical menu structure

**Example (Expanded):**
```
┌─────────────────┐
│ 📊 Dashboard    │
│ 📈 Reports ▾    │
│   ├ Sales       │
│   └ Analytics   │
│ ⚙️  Settings    │
└─────────────────┘
```

**Example (Collapsed):**
```
┌─────┐
│ 📊  │
│ 📈  │
│ ⚙️   │
└─────┘
```

### 3. Footer Menu (Horizontal Footer Links)
- **Position:** Bottom of page, horizontal
- **Style:** Simple text links
- **Columns:** Support 1-4 columns
- **Mobile:** Stack vertically in single column
- **Use Cases:** Secondary navigation, footer links (Privacy, Terms, etc.)

**Example:**
```
About Us  |  Contact  |  Privacy  |  Terms
```

### 4. Logo/Branding
- **Position:** Top left corner
- **Integration:** Header component integrates with top menu
- **Branding Service:** Logo fetched from `/ui/branding` API
- **Responsive:** Scales on mobile

## Key Features

### 1. Dynamic Menu Loading
- Menus fetched from `/ui/bootstrap` API on app load
- Cached in session storage for performance
- Refreshed on navigation (when page config specifies)
- Refreshed after actions (when action config specifies)

### 2. Permission-Based Filtering
- **Server-side (authoritative):** Backend filters menu by user permissions
- **Client-side (defense in depth):** Frontend validates permissions again
- **Dynamic updates:** Menu updates when permissions change
- **Empty states:** Graceful handling when no items visible

### 3. Responsive Design
- **Desktop (≥1024px):** Full menus, side menu expanded
- **Tablet (768-1023px):** Condensed menus, side menu collapsible
- **Mobile (<768px):** Hamburger menu, drawer navigation

### 4. State Persistence
- **Session Storage:** Menu configuration cached
- **Local Storage:** UI preferences (sidebar collapsed state, expanded groups)
- **State Sync:** All menu instances share active item state

### 5. Accessibility
- **Keyboard Navigation:** Arrow keys, Tab, Enter, Escape
- **ARIA Attributes:** Proper roles, labels, states
- **Focus Management:** Logical focus order
- **Screen Reader:** Full screen reader support

## Configuration Examples

### Global Layout with Menus
```json
{
  "id": "app-layout",
  "type": "Page",
  "widgets": [
    {
      "id": "header",
      "type": "Section",
      "widgets": [
        {
          "id": "logo",
          "type": "Image",
          "config": { "src": "{{branding.logos.primary}}" }
        },
        {
          "id": "top-menu",
          "type": "Menu",
          "config": { "variant": "top" }
        }
      ]
    },
    {
      "id": "body",
      "type": "Grid",
      "widgets": [
        {
          "id": "sidebar",
          "type": "Sidebar",
          "config": {
            "variant": "side",
            "collapsible": true,
            "showIcons": true
          }
        },
        {
          "id": "content",
          "type": "Section",
          "widgets": []
        }
      ]
    },
    {
      "id": "footer",
      "type": "Section",
      "widgets": [
        {
          "id": "footer-menu",
          "type": "FooterMenu",
          "config": { "variant": "footer" }
        }
      ]
    }
  ]
}
```

### Page-Specific Menu Override
```json
{
  "id": "admin-page",
  "type": "Page",
  "widgets": [
    {
      "id": "admin-menu",
      "type": "Menu",
      "config": {
        "variant": "top",
        "items": [
          { "id": "users", "label": "Users", "path": "/admin/users" },
          { "id": "settings", "label": "Settings", "path": "/admin/settings" }
        ]
      }
    }
  ]
}
```

### Dynamic Menu from Datasource
```json
{
  "id": "dynamic-menu",
  "type": "Sidebar",
  "config": {
    "variant": "side",
    "itemsBinding": "menuItems"
  },
  "bindings": {
    "menuItems": {
      "datasource": "custom-menu",
      "path": "items"
    }
  },
  "datasources": {
    "custom-menu": {
      "kind": "http",
      "config": {
        "url": "/api/user/menu",
        "method": "GET"
      }
    }
  }
}
```

## Implementation Timeline

### Week 10 (5 days) - ISSUE-030
- Day 1-2: TopMenu component (horizontal navigation with dropdowns)
- Day 2-3: SideMenu component (vertical sidebar with icons, collapsible)
- Day 3-4: FooterMenu component, Header component
- Day 4-5: Responsive behavior, mobile drawer, tests

### Week 11 (4 days) - ISSUE-031
- Day 1-2: Menu state management (TanStack Store), Bootstrap API integration
- Day 2-3: Dynamic menu refresh, navigation handlers
- Day 3-4: Permission filtering, state persistence, tests

### Week 12 (3 days) - ISSUE-032
- Day 1-2: MenuWidget implementation, widget registry integration
- Day 2-3: Configuration schema, dynamic bindings, tests, documentation

**Total:** 12 days

## Dependencies

### External Dependencies
- shadcn/ui: navigation-menu, dropdown-menu, sheet, separator, avatar, button
- lucide-react: Icons (already used)
- TanStack Store: State management (already used)
- TanStack Router: Navigation (already used)

### Internal Dependencies
- ✅ ISSUE-010: Bootstrap API (menu data)
- ✅ ISSUE-011: User Context (permissions)
- ✅ ISSUE-012: Branding Service (logo)
- ✅ ISSUE-013: Route Resolver (navigation)
- ✅ ISSUE-015: Widget Registry (widget registration)

## Success Criteria

### Functional
- ✅ Top menu renders with dropdowns
- ✅ Side menu renders with icons and collapsible groups
- ✅ Footer menu renders
- ✅ Menus load from bootstrap API
- ✅ Active item highlighted
- ✅ Navigation works (click → route change)
- ✅ Dynamic refresh works
- ✅ Permission filtering works
- ✅ Responsive behavior works

### Non-Functional
- ✅ Performance: <100ms render time
- ✅ Accessibility: WCAG 2.1 AA compliance
- ✅ Test Coverage: >80%
- ✅ Dark Mode: Fully supported
- ✅ Mobile: Seamless experience

## Testing Strategy

### Unit Tests
- Menu components render correctly
- State management works
- API integration works
- Permission filtering works
- Navigation handlers work

### Integration Tests
- Menus integrate with bootstrap API
- Menus integrate with router
- Menus integrate with widget registry
- State persists across sessions

### E2E Tests
- User navigates via menus
- User collapses/expands sidebar
- Mobile menu drawer works
- Menu updates dynamically

## Documentation Deliverables

1. **Component Documentation**
   - TopMenu, SideMenu, FooterMenu, Header
   - Props, events, configuration
   - Usage examples

2. **State Management Guide**
   - TanStack Store setup
   - State structure
   - Actions and selectors

3. **Integration Guide**
   - Bootstrap API integration
   - Widget registry integration
   - Configuration examples

4. **Migration Guide**
   - How to add menus to existing pages
   - How to customize menu items
   - How to create dynamic menus

## Notes

- Backend menu API already exists and is tested
- Menu configuration follows existing JSON schema
- Solution aligns with configuration-driven architecture
- All three menu types (top, side, footer) supported
- Logo/branding integration included
- Responsive design is built-in
- Accessibility is non-negotiable

## Next Steps

1. ✅ Create issue files (ISSUE-030, ISSUE-031, ISSUE-032) - **DONE**
2. ✅ Update roadmap with Phase 1.4 - **DONE**
3. ✅ Update issues README - **DONE**
4. ⏳ Assign issues to team members
5. ⏳ Begin implementation (Week 10)

---

**Contact:** For questions about menu management implementation, refer to:
- Issue files: `.github/issues/040-*.md`, `041-*.md`, `042-*.md`
- Roadmap: `documentation/roadmap.md` (Phase 1.4)
- API docs: `documentation/api-specification.md` (Bootstrap API)
- Schema: `documentation/json-schemas.md` (MenuItem type)
