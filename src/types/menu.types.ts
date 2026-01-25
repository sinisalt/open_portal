/**
 * Menu Component Types
 *
 * Type definitions for menu components and their configurations
 */

import type { MenuItem as BootstrapMenuItem } from './bootstrap.types';

/**
 * Extended MenuItem with additional UI properties
 */
export interface MenuItem extends BootstrapMenuItem {
  /** Badge configuration */
  badge?: {
    text: string;
    variant?: 'default' | 'primary' | 'warning' | 'danger';
  };

  /** Show divider after this item */
  divider?: boolean;

  /** Open link in new tab */
  external?: boolean;

  /** Whether this item is currently active */
  active?: boolean;

  /** Whether this item is disabled */
  disabled?: boolean;
}

/**
 * Top menu component props
 */
export interface TopMenuProps {
  /** Menu items to render */
  items: MenuItem[];

  /** ID of the currently active menu item */
  activeItemId?: string;

  /** Callback when menu item is clicked */
  onItemClick?: (item: MenuItem) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Side menu component props
 */
export interface SideMenuProps {
  /** Menu items to render */
  items: MenuItem[];

  /** ID of the currently active menu item */
  activeItemId?: string;

  /** Whether the sidebar is collapsed (icon-only mode) */
  collapsed?: boolean;

  /** Callback to toggle collapsed state */
  onToggleCollapse?: () => void;

  /** Callback when menu item is clicked */
  onItemClick?: (item: MenuItem) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Footer menu component props
 */
export interface FooterMenuProps {
  /** Menu items to render */
  items: MenuItem[];

  /** Number of columns (1-4) */
  columns?: number;

  /** Callback when menu item is clicked */
  onItemClick?: (item: MenuItem) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * User information for header
 */
export interface HeaderUser {
  /** User's full name */
  name: string;

  /** User's email address */
  email: string;

  /** Optional avatar URL */
  avatar?: string;
}

/**
 * Header component props
 */
export interface HeaderProps {
  /** Logo component or image URL */
  logo?: React.ReactNode;

  /** Company name to display */
  companyName?: string;

  /** Top menu items */
  topMenuItems?: MenuItem[];

  /** User information */
  user?: HeaderUser;

  /** Callback for user menu actions */
  onUserMenuClick?: (action: string) => void;

  /** Callback for mobile menu toggle */
  onMobileMenuToggle?: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Menu state for managing menu interactions
 */
export interface MenuState {
  /** Currently active menu item ID */
  activeItemId: string | null;

  /** IDs of expanded menu groups (for side menu) */
  expandedGroupIds: string[];

  /** Whether sidebar is collapsed */
  sidebarCollapsed: boolean;

  /** Whether mobile menu is open */
  mobileMenuOpen: boolean;
}

/**
 * Menu actions for state updates
 */
export interface MenuActions {
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
}
