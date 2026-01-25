# Issue #041: Menu Widget System - Configuration-Driven Menus

**Phase:** Phase 1.4 - Navigation & Menus  
**Weeks:** 12  
**Component:** Frontend  
**Estimated Effort:** 3 days  
**Priority:** Medium  
**Labels:** phase-1, frontend, widgets, menus, configuration

**Created:** January 25, 2026

## Description

Implement menu widgets that integrate with the widget registry system, enabling menus to be defined and configured through the page configuration JSON (same pattern as other widgets). This makes menus configuration-driven and allows them to be embedded in pages, not just in the global layout.

This issue completes the menu management trinity:
- Issue #042: Base menu components (UI layer)
- Issue #040: State management and API integration (data layer)
- Issue #041: Widget integration (configuration layer) ✅ This issue

## Acceptance Criteria

### Widget Registry Integration
- [ ] Create MenuWidget (configuration-driven top menu)
- [ ] Create SidebarWidget (configuration-driven side menu)
- [ ] Create FooterMenuWidget (configuration-driven footer menu)
- [ ] Register widgets in widget registry
- [ ] Support widget configuration contracts
- [ ] Integrate with widget renderer

### Configuration Support
- [ ] Define MenuWidget configuration schema
- [ ] Support menu position (top, side, footer)
- [ ] Support menu items override (page-specific menus)
- [ ] Support menu bindings (dynamic items)
- [ ] Support menu events (onItemClick)
- [ ] Support visibility policies

### Widget Features
- [ ] Render from JSON configuration
- [ ] Use bootstrap menu as default
- [ ] Override with custom items (when provided)
- [ ] Bind to datasources (dynamic menus)
- [ ] Handle widget errors gracefully
- [ ] Support all menu variants

### Integration
- [ ] Work with page configuration loader
- [ ] Work with widget renderer
- [ ] Work with action engine
- [ ] Inherit global menu state
- [ ] Support local menu state overrides

## Use Cases

1. **Global menu in layout**: Layout config includes `MenuWidget` → renders app-wide menu
2. **Page-specific menu**: Page config overrides menu items → shows contextual menu
3. **Dynamic menu from datasource**: Menu items bound to datasource → updates when data changes
4. **Conditional menu items**: Menu items with visibility policies → shown/hidden based on context
5. **Embedded menu widget**: Menu widget in page grid → menu as regular widget in layout

## Technical Implementation

### Widget Configuration Schema

```typescript
// /src/widgets/MenuWidget/types.ts
import type { WidgetConfig } from '@/types/widget';

interface MenuWidgetConfig extends WidgetConfig {
  type: 'Menu' | 'Sidebar' | 'FooterMenu';
  
  // Menu configuration
  variant?: 'top' | 'side' | 'footer';  // Menu style
  position?: 'fixed' | 'static' | 'sticky';  // CSS position
  
  // Menu items (override bootstrap menu)
  items?: MenuItem[];
  
  // Data binding (dynamic menu)
  itemsBinding?: string;  // e.g., "datasources.menuItems"
  
  // Behavior
  collapsible?: boolean;  // Side menu only
  defaultCollapsed?: boolean;  // Side menu only
  showIcons?: boolean;  // Show item icons
  showBadges?: boolean;  // Show notification badges
  
  // Appearance
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  order?: number;
  permissions?: string[];
  children?: MenuItem[];
  badge?: {
    text: string;
    variant: 'default' | 'primary' | 'warning' | 'danger';
  };
  divider?: boolean;
  external?: boolean;
}
```

### MenuWidget Implementation

```typescript
// /src/widgets/MenuWidget/MenuWidget.tsx
import { useMenu } from '@/hooks/useMenu';
import { TopMenu } from '@/components/menus/TopMenu/TopMenu';
import { SideMenu } from '@/components/menus/SideMenu/SideMenu';
import { FooterMenu } from '@/components/menus/FooterMenu/FooterMenu';
import type { WidgetProps } from '@/types/widget';
import type { MenuWidgetConfig } from './types';

export function MenuWidget({ config, bindings, events }: WidgetProps<MenuWidgetConfig>) {
  const { variant = 'top', items: configItems, itemsBinding, collapsible, defaultCollapsed } = config;
  
  // Get menu from state (bootstrap API)
  const { 
    items: bootstrapItems, 
    activeItemId, 
    collapsed, 
    toggleSidebar 
  } = useMenu(variant);
  
  // Use configured items if provided, otherwise use bootstrap items
  const items = configItems || (itemsBinding ? bindings?.[itemsBinding] : bootstrapItems);
  
  // Handle item click
  const handleItemClick = (item: MenuItem) => {
    events?.onItemClick?.(item);
  };
  
  // Render appropriate menu variant
  switch (variant) {
    case 'top':
      return (
        <TopMenu
          items={items}
          activeItemId={activeItemId}
          onItemClick={handleItemClick}
          className={config.className}
        />
      );
      
    case 'side':
      return (
        <SideMenu
          items={items}
          activeItemId={activeItemId}
          collapsed={collapsed ?? defaultCollapsed}
          onToggleCollapse={collapsible ? toggleSidebar : undefined}
          onItemClick={handleItemClick}
          className={config.className}
        />
      );
      
    case 'footer':
      return (
        <FooterMenu
          items={items}
          onItemClick={handleItemClick}
          className={config.className}
        />
      );
      
    default:
      return null;
  }
}
```

### Widget Registration

```typescript
// /src/widgets/index.ts
import { widgetRegistry } from '@/core/registry/WidgetRegistry';
import { MenuWidget } from './MenuWidget/MenuWidget';

// Register menu widgets
widgetRegistry.register('Menu', MenuWidget);
widgetRegistry.register('TopMenu', MenuWidget);  // Alias
widgetRegistry.register('Sidebar', MenuWidget);
widgetRegistry.register('SideMenu', MenuWidget);  // Alias
widgetRegistry.register('FooterMenu', MenuWidget);
```

### Example Configuration

#### Global Layout with Menu

```json
{
  "id": "app-layout",
  "type": "Page",
  "title": "OpenPortal",
  "widgets": [
    {
      "id": "app-header",
      "type": "Section",
      "widgets": [
        {
          "id": "logo",
          "type": "Image",
          "config": {
            "src": "{{branding.logos.primary}}",
            "alt": "Company Logo",
            "width": 120
          }
        },
        {
          "id": "top-menu",
          "type": "Menu",
          "config": {
            "variant": "top"
          }
        }
      ]
    },
    {
      "id": "app-body",
      "type": "Grid",
      "config": {
        "columns": 12,
        "gap": 0
      },
      "widgets": [
        {
          "id": "sidebar",
          "type": "Sidebar",
          "config": {
            "variant": "side",
            "collapsible": true,
            "defaultCollapsed": false,
            "showIcons": true
          },
          "layout": {
            "span": 2
          }
        },
        {
          "id": "main-content",
          "type": "Section",
          "layout": {
            "span": 10
          },
          "widgets": []
        }
      ]
    },
    {
      "id": "app-footer",
      "type": "Section",
      "widgets": [
        {
          "id": "footer-menu",
          "type": "FooterMenu",
          "config": {
            "variant": "footer"
          }
        }
      ]
    }
  ]
}
```

#### Page with Custom Menu Items

```json
{
  "id": "admin-page",
  "type": "Page",
  "title": "Admin Dashboard",
  "widgets": [
    {
      "id": "admin-menu",
      "type": "Menu",
      "config": {
        "variant": "top",
        "items": [
          {
            "id": "users",
            "label": "Users",
            "icon": "users",
            "path": "/admin/users"
          },
          {
            "id": "settings",
            "label": "Settings",
            "icon": "settings",
            "path": "/admin/settings"
          },
          {
            "id": "logs",
            "label": "Logs",
            "icon": "file-text",
            "path": "/admin/logs"
          }
        ]
      }
    }
  ]
}
```

#### Dynamic Menu from Datasource

```json
{
  "id": "dynamic-menu",
  "type": "Menu",
  "config": {
    "variant": "side",
    "itemsBinding": "menuItems"
  },
  "bindings": {
    "menuItems": {
      "datasource": "user-menu",
      "path": "items"
    }
  },
  "datasources": {
    "user-menu": {
      "kind": "http",
      "config": {
        "url": "/api/user/menu",
        "method": "GET"
      }
    }
  }
}
```

#### Menu with Visibility Policy

```json
{
  "id": "admin-menu",
  "type": "Menu",
  "config": {
    "variant": "top",
    "items": [
      {
        "id": "admin",
        "label": "Admin",
        "icon": "shield",
        "children": [
          {
            "id": "users",
            "label": "Users",
            "path": "/admin/users"
          }
        ]
      }
    ]
  },
  "visibility": {
    "permissions": ["admin.access"]
  }
}
```

### Widget Tests

```typescript
// /src/widgets/MenuWidget/MenuWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { MenuWidget } from './MenuWidget';
import type { MenuWidgetConfig } from './types';

describe('MenuWidget', () => {
  it('renders top menu variant', () => {
    const config: MenuWidgetConfig = {
      id: 'menu',
      type: 'Menu',
      variant: 'top',
      items: [
        { id: 'home', label: 'Home', path: '/' },
        { id: 'about', label: 'About', path: '/about' },
      ],
    };
    
    render(<MenuWidget config={config} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });
  
  it('renders side menu variant', () => {
    const config: MenuWidgetConfig = {
      id: 'sidebar',
      type: 'Sidebar',
      variant: 'side',
      collapsible: true,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
      ],
    };
    
    render(<MenuWidget config={config} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
  
  it('uses bootstrap menu when items not provided', () => {
    const config: MenuWidgetConfig = {
      id: 'menu',
      type: 'Menu',
      variant: 'top',
    };
    
    // Mock useMenu hook to return bootstrap items
    const { container } = render(<MenuWidget config={config} />);
    
    // Assert bootstrap menu items rendered
    expect(container).toMatchSnapshot();
  });
  
  it('binds to datasource for dynamic items', () => {
    const config: MenuWidgetConfig = {
      id: 'menu',
      type: 'Menu',
      variant: 'top',
      itemsBinding: 'menuItems',
    };
    
    const bindings = {
      menuItems: [
        { id: 'dynamic1', label: 'Dynamic Item 1', path: '/item1' },
        { id: 'dynamic2', label: 'Dynamic Item 2', path: '/item2' },
      ],
    };
    
    render(<MenuWidget config={config} bindings={bindings} />);
    
    expect(screen.getByText('Dynamic Item 1')).toBeInTheDocument();
    expect(screen.getByText('Dynamic Item 2')).toBeInTheDocument();
  });
  
  it('handles item click event', () => {
    const config: MenuWidgetConfig = {
      id: 'menu',
      type: 'Menu',
      variant: 'top',
      items: [
        { id: 'home', label: 'Home', path: '/' },
      ],
    };
    
    const onItemClick = jest.fn();
    const events = { onItemClick };
    
    render(<MenuWidget config={config} events={events} />);
    
    screen.getByText('Home').click();
    
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'home', label: 'Home' })
    );
  });
});
```

## Dependencies

- **Depends on:**
  - #015 (Widget Registry) - widget registration
  - #042 (Menu Components) - UI components
  - #040 (Menu State) - state management
  
- **npm packages:**
  - None (uses existing dependencies)

## Deliverables

1. **MenuWidget Component**
   - MenuWidget.tsx (main widget)
   - types.ts (TypeScript interfaces)
   - MenuWidget.test.tsx (tests)
   - index.ts (exports)

2. **Widget Registration**
   - Update widgets/index.ts
   - Register Menu variants

3. **Configuration Schema**
   - JSON schema definition
   - TypeScript types
   - Validation rules

4. **Tests**
   - Unit tests (MenuWidget)
   - Integration tests (with registry)
   - Configuration validation tests

5. **Documentation**
   - Widget configuration guide
   - Usage examples
   - Best practices
   - Migration guide

## Testing Requirements

### Unit Tests
- Widget renders with config
- Widget uses bootstrap menu
- Widget uses custom items
- Widget binds to datasource
- Widget handles events
- Widget respects visibility

### Integration Tests
- Widget registered in registry
- Widget rendered by renderer
- Widget loads from page config
- Widget integrates with state
- Widget triggers navigation

### Configuration Tests
- Valid configs accepted
- Invalid configs rejected
- Schema validation works
- Default values applied

## Performance Considerations

- Menu widgets should not re-render unnecessarily
- Use memo for menu items
- Lazy load menu icons
- Debounce state updates
- Share menu state across widgets

## Documentation

### Widget Configuration Guide

```markdown
# Menu Widget

The Menu widget enables configuration-driven menu rendering.

## Configuration

### Top Menu
\`\`\`json
{
  "type": "Menu",
  "config": {
    "variant": "top",
    "items": [...]
  }
}
\`\`\`

### Side Menu
\`\`\`json
{
  "type": "Sidebar",
  "config": {
    "variant": "side",
    "collapsible": true,
    "showIcons": true
  }
}
\`\`\`

### Footer Menu
\`\`\`json
{
  "type": "FooterMenu",
  "config": {
    "variant": "footer",
    "items": [...]
  }
}
\`\`\`

## Bindings

- `itemsBinding`: Dynamic menu items from datasource

## Events

- `onItemClick`: Fired when menu item clicked

## Examples

See configuration examples above.
```

## Migration Path

1. Phase 1: Implement base MenuWidget
2. Phase 2: Add dynamic bindings
3. Phase 3: Add visibility policies
4. Phase 4: Add advanced features

## Notes

- Menu widgets inherit global menu state by default
- Custom items override bootstrap menu
- Datasource bindings provide dynamic menus
- Visibility policies control widget rendering
- Menu widgets work like any other widget

## Success Criteria

✅ MenuWidget registered in registry  
✅ Renders from JSON configuration  
✅ Uses bootstrap menu as default  
✅ Supports custom menu items  
✅ Supports datasource bindings  
✅ Handles click events  
✅ Respects visibility policies  
✅ Tests pass (>80% coverage)  
✅ Documentation complete  
✅ Works with widget renderer
