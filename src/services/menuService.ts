/**
 * Menu Service
 *
 * Service for extracting and processing menu data from bootstrap API response
 */

import type { MenuItem as BootstrapMenuItem, BootstrapResponse } from '@/types/bootstrap.types';
import type { MenuItem } from '@/types/menu.types';

/**
 * Menu position in the UI
 */
export type MenuPosition = 'top' | 'side' | 'footer';

/**
 * Menu configuration extracted from bootstrap
 */
export interface MenuConfig {
  top: MenuItem[];
  side: MenuItem[];
  footer: MenuItem[];
}

/**
 * Convert bootstrap MenuItem to extended MenuItem with UI properties
 */
function convertMenuItem(item: BootstrapMenuItem): MenuItem {
  return {
    ...item,
    // Bootstrap already has: id, label, icon, route, order, permission, children
    // Add UI-specific properties with defaults
    badge: undefined,
    divider: false,
    external: false,
    active: false,
    disabled: false,
  };
}

/**
 * Extract menu items by position from bootstrap menu array
 *
 * @param menu - Menu items from bootstrap
 * @param position - Menu position (top, side, footer)
 * @returns Filtered and converted menu items
 */
function extractMenuByPosition(menu: BootstrapMenuItem[], position: MenuPosition): MenuItem[] {
  // If bootstrap menu items don't have a position property,
  // we'll use a simple convention:
  // - Items without children go to top menu
  // - Items with children go to side menu
  // - Footer menu would need to be explicitly marked (future enhancement)

  // For now, let's check if items have a 'position' property (custom)
  // If not, use the fallback logic above

  const items = menu
    .filter(item => {
      // Check if item has a position metadata (custom extension)
      const extendedItem = item as BootstrapMenuItem & { position?: string };
      if (extendedItem.position) {
        return extendedItem.position === position;
      }

      // Fallback logic based on structure
      if (position === 'top') {
        // Top menu: simple items or items that are explicitly top-level navigation
        return !item.children || item.children.length === 0;
      }
      if (position === 'side') {
        // Side menu: items with children (expandable groups)
        return item.children && item.children.length > 0;
      }
      // Footer menu: would need explicit marking
      return false;
    })
    .map(convertMenuItem);

  // Sort by order
  return items.sort((a, b) => a.order - b.order);
}

/**
 * Extract top menu items from bootstrap response
 *
 * Top menu typically contains:
 * - Simple navigation links
 * - Items without children (or with simple dropdowns)
 *
 * @param bootstrap - Bootstrap response data
 * @returns Top menu items
 */
export function extractTopMenu(bootstrap: BootstrapResponse | null): MenuItem[] {
  if (!bootstrap || !bootstrap.menu) {
    return [];
  }

  return extractMenuByPosition(bootstrap.menu, 'top');
}

/**
 * Extract side menu items from bootstrap response
 *
 * Side menu typically contains:
 * - Main navigation with icons
 * - Expandable groups with children
 *
 * @param bootstrap - Bootstrap response data
 * @returns Side menu items
 */
export function extractSideMenu(bootstrap: BootstrapResponse | null): MenuItem[] {
  if (!bootstrap || !bootstrap.menu) {
    return [];
  }

  return extractMenuByPosition(bootstrap.menu, 'side');
}

/**
 * Extract footer menu items from bootstrap response
 *
 * Footer menu typically contains:
 * - Simple footer links (Privacy, Terms, Help, etc.)
 * - Secondary navigation
 *
 * @param bootstrap - Bootstrap response data
 * @returns Footer menu items
 */
export function extractFooterMenu(bootstrap: BootstrapResponse | null): MenuItem[] {
  if (!bootstrap || !bootstrap.menu) {
    return [];
  }

  return extractMenuByPosition(bootstrap.menu, 'footer');
}

/**
 * Extract all menus from bootstrap response
 *
 * @param bootstrap - Bootstrap response data
 * @returns All menu configurations
 */
export function extractMenus(bootstrap: BootstrapResponse | null): MenuConfig {
  return {
    top: extractTopMenu(bootstrap),
    side: extractSideMenu(bootstrap),
    footer: extractFooterMenu(bootstrap),
  };
}

/**
 * Filter menu items by user permissions
 *
 * Recursively filters menu items and their children based on user permissions.
 * Items without permission requirements are always included.
 *
 * @param items - Menu items to filter
 * @param permissions - User's permissions
 * @returns Filtered menu items
 */
export function filterMenuByPermissions(items: MenuItem[], permissions: string[]): MenuItem[] {
  return items
    .filter(item => {
      // No permission required - include item
      if (!item.permission) {
        return true;
      }

      // Check if user has required permission
      return permissions.includes(item.permission);
    })
    .map(item => {
      // Recursively filter children if present
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterMenuByPermissions(item.children, permissions),
        };
      }
      return item;
    })
    .filter(item => {
      // Remove items that have children but all were filtered out
      if (item.children !== undefined && item.children.length === 0) {
        // Only keep if the item itself has a route (clickable parent)
        return Boolean(item.route);
      }
      return true;
    });
}

/**
 * Find menu item by ID
 *
 * Recursively searches for a menu item by ID
 *
 * @param items - Menu items to search
 * @param id - Item ID to find
 * @returns Found menu item or null
 */
export function findMenuItemById(items: MenuItem[], id: string): MenuItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }

    if (item.children && item.children.length > 0) {
      const found = findMenuItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Find menu item by route
 *
 * Recursively searches for a menu item by route
 *
 * @param items - Menu items to search
 * @param route - Route to find
 * @returns Found menu item or null
 */
export function findMenuItemByRoute(items: MenuItem[], route: string): MenuItem | null {
  for (const item of items) {
    if (item.route === route) {
      return item;
    }

    if (item.children && item.children.length > 0) {
      const found = findMenuItemByRoute(item.children, route);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Get all parent group IDs for a menu item
 *
 * Finds all parent groups that should be expanded to show the item
 *
 * @param items - Menu items to search
 * @param itemId - Target item ID
 * @param parentIds - Accumulated parent IDs (internal)
 * @returns Array of parent group IDs
 */
export function getParentGroupIds(
  items: MenuItem[],
  itemId: string,
  parentIds: string[] = []
): string[] {
  for (const item of items) {
    if (item.id === itemId) {
      return parentIds;
    }

    if (item.children && item.children.length > 0) {
      const found = getParentGroupIds(item.children, itemId, [...parentIds, item.id]);
      if (found.length > parentIds.length || item.children.some(child => child.id === itemId)) {
        return found;
      }
    }
  }

  return [];
}
