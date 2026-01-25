# MenuWidget

Configuration-driven menu widget that integrates with the widget registry system. Supports top, side, and footer menu variants with dynamic binding and custom items.

## Features

- ✅ **Multiple Variants**: Top menu, side menu, and footer menu
- ✅ **Bootstrap Integration**: Automatically uses menu from bootstrap API
- ✅ **Custom Items**: Override bootstrap menu with custom items
- ✅ **Dynamic Bindings**: Bind menu items to datasources for dynamic menus
- ✅ **Event Handling**: Support for `onItemClick` events
- ✅ **Collapsible Sidebar**: Optional collapsible sidebar with toggle
- ✅ **Responsive**: All menu variants are responsive by design
- ✅ **Accessibility**: Built on accessible menu components

## Widget Types

The MenuWidget is registered under multiple type names:

- `Menu` - Generic menu widget
- `TopMenu` - Horizontal top navigation menu
- `Sidebar` - Vertical sidebar menu
- `SideMenu` - Alias for Sidebar
- `FooterMenu` - Footer navigation menu

## Configuration

### Basic Usage

#### Top Menu (Bootstrap)

Uses the default bootstrap menu from the backend API:

```json
{
  "id": "app-menu",
  "type": "Menu",
  "variant": "top"
}
```

#### Top Menu (Custom Items)

Provides custom menu items:

```json
{
  "id": "app-menu",
  "type": "TopMenu",
  "variant": "top",
  "items": [
    {
      "id": "home",
      "label": "Home",
      "route": "/",
      "icon": "home"
    },
    {
      "id": "about",
      "label": "About",
      "route": "/about",
      "icon": "info"
    }
  ]
}
```

#### Side Menu (Collapsible)

```json
{
  "id": "sidebar",
  "type": "Sidebar",
  "variant": "side",
  "collapsible": true,
  "defaultCollapsed": false,
  "showIcons": true
}
```

#### Footer Menu

```json
{
  "id": "footer-nav",
  "type": "FooterMenu",
  "variant": "footer",
  "columns": 1,
  "items": [
    {
      "id": "privacy",
      "label": "Privacy Policy",
      "route": "/privacy"
    },
    {
      "id": "terms",
      "label": "Terms of Service",
      "route": "/terms"
    }
  ]
}
```

### Dynamic Menu from Datasource

Bind menu items to a datasource for dynamic menus:

```json
{
  "id": "dynamic-menu",
  "type": "Menu",
  "variant": "side",
  "itemsBinding": "menuItems",
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

## Configuration Options

### MenuWidgetConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | Required | Unique widget identifier |
| `type` | `'Menu' \| 'TopMenu' \| 'Sidebar' \| 'SideMenu' \| 'FooterMenu'` | Required | Widget type |
| `variant` | `'top' \| 'side' \| 'footer'` | `'top'` | Menu style variant |
| `position` | `'fixed' \| 'static' \| 'sticky'` | - | CSS position (not yet implemented) |
| `items` | `MenuItem[]` | - | Custom menu items (overrides bootstrap) |
| `itemsBinding` | `string` | - | Binding key for dynamic menu items |
| `collapsible` | `boolean` | `false` | Enable sidebar collapse (side menu only) |
| `defaultCollapsed` | `boolean` | `false` | Default collapsed state (side menu only) |
| `showIcons` | `boolean` | `true` | Show item icons (not yet implemented) |
| `showBadges` | `boolean` | `true` | Show notification badges (not yet implemented) |
| `theme` | `'light' \| 'dark' \| 'auto'` | - | Menu theme (not yet implemented) |
| `columns` | `number` | `1` | Number of columns (footer menu only) |
| `className` | `string` | - | Additional CSS classes |

### MenuItem

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique item identifier |
| `label` | `string` | Display label |
| `route` | `string` | Navigation route |
| `icon` | `string` | Icon name (optional) |
| `children` | `MenuItem[]` | Submenu items (optional) |
| `badge` | `object` | Badge configuration (optional) |
| `divider` | `boolean` | Show divider after item (optional) |
| `external` | `boolean` | Open in new tab (optional) |
| `disabled` | `boolean` | Disable item (optional) |
| `permissions` | `string[]` | Required permissions (optional) |

## Events

### onItemClick

Fired when a menu item is clicked:

```typescript
events: {
  onItemClick: (item: MenuItem) => {
    console.log('Menu item clicked:', item);
    // Navigate, trigger actions, etc.
  }
}
```

## Usage Examples

### In Page Configuration

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
          "id": "top-menu",
          "type": "Menu",
          "variant": "top"
        }
      ]
    },
    {
      "id": "main",
      "type": "Grid",
      "widgets": [
        {
          "id": "sidebar",
          "type": "Sidebar",
          "variant": "side",
          "collapsible": true
        },
        {
          "id": "content",
          "type": "Section"
        }
      ]
    }
  ]
}
```

### With WidgetRenderer

```typescript
import { WidgetRenderer } from '@/core/renderer/WidgetRenderer';

function MyPage() {
  const menuConfig = {
    id: 'nav',
    type: 'Menu',
    variant: 'top',
  };

  const handleItemClick = (item) => {
    console.log('Clicked:', item.label);
  };

  return (
    <WidgetRenderer
      config={menuConfig}
      events={{ onItemClick: handleItemClick }}
    />
  );
}
```

### Direct Usage

```typescript
import { MenuWidget } from '@/widgets/MenuWidget';

function MyPage() {
  const config = {
    id: 'nav',
    type: 'Menu',
    variant: 'top',
    items: [
      { id: 'home', label: 'Home', route: '/' },
      { id: 'about', label: 'About', route: '/about' },
    ],
  };

  return <MenuWidget config={config} />;
}
```

## Item Priority

When multiple sources are available, items are selected in this order:

1. **Custom items** from `config.items`
2. **Dynamic items** from `bindings[itemsBinding]`
3. **Bootstrap items** from `useMenu` hook (default)

## State Management

The MenuWidget integrates with the global menu state via the `useMenu` hook:

- `activeItemId` - Currently active menu item (auto-synced with route)
- `sidebarCollapsed` - Sidebar collapsed state (controlled by MenuContext)
- `expandedGroupIds` - Expanded menu groups (for nested menus)
- `toggleSidebar` - Function to toggle sidebar collapse

## Demo

Visit `/menu-widget-demo` to see the MenuWidget in action with all variants and configurations.

## Testing

The MenuWidget has comprehensive unit tests covering:

- ✅ Rendering all variants (top, side, footer)
- ✅ Bootstrap menu integration
- ✅ Custom menu items
- ✅ Dynamic bindings
- ✅ Event handling
- ✅ Collapsed state management
- ✅ Unknown variant fallback

Run tests:

```bash
npm test -- MenuWidget
```

## Architecture

The MenuWidget follows the 3-layer widget architecture:

1. **Layer 3**: MenuWidget (configuration contract)
2. **Layer 2**: Menu components (TopMenu, SideMenu, FooterMenu)
3. **Layer 1**: shadcn/ui and Radix UI primitives

## Future Enhancements

- [ ] Theme support (light/dark/auto)
- [ ] Icon display configuration
- [ ] Badge display configuration
- [ ] Position control (fixed/sticky)
- [ ] Visibility policies
- [ ] Custom event actions
- [ ] Menu search/filter

## Related

- Issue #041: Menu Widget System
- Issue #040: Menu State Management
- Issue #042: Menu Components
- `useMenu` hook
- `MenuContext`
- `TopMenu`, `SideMenu`, `FooterMenu` components
