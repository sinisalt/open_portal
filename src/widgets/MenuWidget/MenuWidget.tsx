/**
 * MenuWidget Component
 *
 * Configuration-driven menu widget that integrates with the widget registry.
 * Supports top, side, and footer menu variants with dynamic binding and custom items.
 */

import { FooterMenu } from '@/components/menus/FooterMenu/FooterMenu';
import { SideMenu } from '@/components/menus/SideMenu/SideMenu';
import { TopMenu } from '@/components/menus/TopMenu/TopMenu';
import { useMenu } from '@/hooks/useMenu';
import type { MenuItem } from '@/types/menu.types';
import type { WidgetProps } from '@/types/widget.types';
import type { MenuWidgetConfig } from './types';

/**
 * MenuWidget Component
 *
 * Renders menu components based on configuration.
 * Automatically uses bootstrap menu from useMenu hook when items are not provided.
 * Supports custom items and dynamic bindings.
 *
 * @example
 * ```tsx
 * // Default bootstrap menu
 * <MenuWidget config={{ id: 'nav', type: 'Menu', variant: 'top' }} />
 *
 * // Custom menu items
 * <MenuWidget
 *   config={{
 *     id: 'nav',
 *     type: 'Menu',
 *     variant: 'top',
 *     items: [{ id: '1', label: 'Home', route: '/' }]
 *   }}
 * />
 *
 * // Dynamic menu from binding
 * <MenuWidget
 *   config={{
 *     id: 'nav',
 *     type: 'Menu',
 *     variant: 'side',
 *     itemsBinding: 'menuItems'
 *   }}
 *   bindings={{ menuItems: [...] }}
 * />
 * ```
 */
export function MenuWidget({ config, bindings, events }: WidgetProps<MenuWidgetConfig>) {
  const {
    variant = 'top',
    items: configItems,
    itemsBinding,
    collapsible,
    defaultCollapsed,
    columns,
    className,
  } = config;

  // Get menu state from hook
  const {
    items: bootstrapItems,
    activeItemId,
    sidebarCollapsed,
    toggleSidebar,
  } = useMenu({
    type: variant,
    autoSyncActiveItem: true,
  });

  // Determine which items to use:
  // 1. Custom items from config (if provided)
  // 2. Dynamic items from bindings (if itemsBinding is set)
  // 3. Bootstrap items from useMenu hook (default)
  let items: MenuItem[];
  if (configItems && configItems.length > 0) {
    items = configItems;
  } else if (itemsBinding && bindings?.[itemsBinding]) {
    items = bindings[itemsBinding] as MenuItem[];
  } else {
    items = bootstrapItems;
  }

  /**
   * Handle menu item click
   * Fires the onItemClick event if provided
   */
  const handleItemClick = (item: MenuItem) => {
    if (events?.onItemClick) {
      events.onItemClick(item);
    }
  };

  /**
   * Render appropriate menu variant
   */
  switch (variant) {
    case 'top':
      return (
        <TopMenu
          items={items}
          activeItemId={activeItemId ?? undefined}
          onItemClick={handleItemClick}
          className={className}
        />
      );

    case 'side':
      return (
        <SideMenu
          items={items}
          activeItemId={activeItemId ?? undefined}
          collapsed={sidebarCollapsed ?? defaultCollapsed ?? false}
          onToggleCollapse={collapsible ? toggleSidebar : undefined}
          onItemClick={handleItemClick}
          className={className}
        />
      );

    case 'footer':
      return (
        <FooterMenu
          items={items}
          columns={columns}
          onItemClick={handleItemClick}
          className={className}
        />
      );

    default:
      // Fallback to top menu for unknown variants
      console.warn(`Unknown menu variant: ${variant}. Falling back to 'top' menu.`);
      return (
        <TopMenu
          items={items}
          activeItemId={activeItemId ?? undefined}
          onItemClick={handleItemClick}
          className={className}
        />
      );
  }
}

MenuWidget.displayName = 'MenuWidget';
