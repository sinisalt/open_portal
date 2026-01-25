/**
 * useMenu Hook
 *
 * React hook for managing menu state and integration with bootstrap data
 */

import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useMenuContext } from '@/contexts/MenuContext';
import { useBootstrap } from '@/hooks/useBootstrap';
import {
  extractMenus,
  filterMenuByPermissions,
  findMenuItemByRoute,
  getParentGroupIds,
} from '@/services/menuService';
import type { MenuItem } from '@/types/menu.types';

/**
 * Menu type selector
 */
export type MenuType = 'top' | 'side' | 'footer';

/**
 * Hook options
 */
interface UseMenuOptions {
  /** Menu type to retrieve */
  type?: MenuType;
  /** Auto-sync active item with current route */
  autoSyncActiveItem?: boolean;
}

/**
 * Hook return value
 */
interface UseMenuReturn {
  /** Menu items for the specified type */
  items: MenuItem[];
  /** Currently active menu item ID */
  activeItemId: string | null;
  /** IDs of expanded menu groups */
  expandedGroupIds: string[];
  /** Whether sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** Whether mobile menu is open */
  mobileMenuOpen: boolean;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;

  // Actions
  /** Set active menu item */
  setActiveItem: (itemId: string | null) => void;
  /** Toggle expanded state of a menu group */
  toggleGroup: (groupId: string) => void;
  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void;
  /** Toggle mobile menu open state */
  toggleMobileMenu: () => void;
  /** Expand all groups */
  expandAll: () => void;
  /** Collapse all groups */
  collapseAll: () => void;
  /** Refresh menus from bootstrap */
  refresh: () => Promise<void>;
}

/**
 * Menu hook
 *
 * Provides menu state and actions for a specific menu type.
 * Automatically loads menus from bootstrap data and filters by permissions.
 *
 * @param options - Hook options
 * @returns Menu state and actions
 *
 * @example
 * ```tsx
 * function TopNavigation() {
 *   const { items, activeItemId, setActiveItem } = useMenu({ type: 'top' });
 *
 *   return (
 *     <nav>
 *       {items.map(item => (
 *         <NavItem
 *           key={item.id}
 *           item={item}
 *           active={item.id === activeItemId}
 *           onClick={() => setActiveItem(item.id)}
 *         />
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useMenu(options: UseMenuOptions = {}): UseMenuReturn {
  const { type, autoSyncActiveItem = true } = options;

  // Get menu context
  const menuContext = useMenuContext();

  // Get bootstrap data
  const { data: bootstrap, permissions, refresh: refreshBootstrap } = useBootstrap();

  // Get router for active route detection
  const router = useRouter();

  /**
   * Load and filter menus from bootstrap data
   */
  useEffect(() => {
    if (bootstrap?.menu) {
      // Extract menus from bootstrap
      const menus = extractMenus(bootstrap);

      // Filter by permissions
      const filteredMenus = {
        top: filterMenuByPermissions(menus.top, permissions),
        side: filterMenuByPermissions(menus.side, permissions),
        footer: filterMenuByPermissions(menus.footer, permissions),
      };

      // Update menu context
      menuContext.setMenus(filteredMenus);
    }
  }, [bootstrap, permissions, menuContext]);

  /**
   * Auto-sync active item with current route
   */
  useEffect(() => {
    if (!autoSyncActiveItem) {
      return;
    }

    const currentPath = router.state.location.pathname;

    // Find menu item matching current route
    const allItems = [...menuContext.topMenu, ...menuContext.sideMenu, ...menuContext.footerMenu];
    const activeItem = findMenuItemByRoute(allItems, currentPath);

    if (activeItem) {
      // Set active item
      menuContext.setActiveItem(activeItem.id);

      // Auto-expand parent groups in side menu
      if (type === 'side' || !type) {
        const parentIds = getParentGroupIds(menuContext.sideMenu, activeItem.id);
        // Expand all parent groups
        for (const parentId of parentIds) {
          if (!menuContext.expandedGroupIds.includes(parentId)) {
            menuContext.toggleGroup(parentId);
          }
        }
      }
    }
  }, [router.state.location.pathname, menuContext, type, autoSyncActiveItem]);

  /**
   * Refresh menus from bootstrap
   */
  const refresh = async () => {
    await refreshBootstrap();
  };

  // Get items for specified menu type
  const items =
    type === 'top'
      ? menuContext.topMenu
      : type === 'side'
        ? menuContext.sideMenu
        : type === 'footer'
          ? menuContext.footerMenu
          : // If no type specified, return all items
            [...menuContext.topMenu, ...menuContext.sideMenu, ...menuContext.footerMenu];

  return {
    items,
    activeItemId: menuContext.activeItemId,
    expandedGroupIds: menuContext.expandedGroupIds,
    sidebarCollapsed: menuContext.sidebarCollapsed,
    mobileMenuOpen: menuContext.mobileMenuOpen,
    loading: menuContext.loading,
    error: menuContext.error,

    // Actions
    setActiveItem: menuContext.setActiveItem,
    toggleGroup: menuContext.toggleGroup,
    toggleSidebar: menuContext.toggleSidebar,
    toggleMobileMenu: menuContext.toggleMobileMenu,
    expandAll: menuContext.expandAll,
    collapseAll: menuContext.collapseAll,
    refresh,
  };
}

/**
 * Hook for top menu
 *
 * Convenience hook for top menu that auto-syncs with route
 */
export function useTopMenu() {
  return useMenu({ type: 'top', autoSyncActiveItem: true });
}

/**
 * Hook for side menu
 *
 * Convenience hook for side menu that auto-syncs with route
 */
export function useSideMenu() {
  return useMenu({ type: 'side', autoSyncActiveItem: true });
}

/**
 * Hook for footer menu
 *
 * Convenience hook for footer menu
 */
export function useFooterMenu() {
  return useMenu({ type: 'footer', autoSyncActiveItem: false });
}
