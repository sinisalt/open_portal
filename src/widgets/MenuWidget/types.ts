/**
 * MenuWidget Type Definitions
 *
 * Type definitions for the MenuWidget component, enabling configuration-driven
 * menu rendering across top, side, and footer positions.
 */

import type { MenuItem } from '@/types/menu.types';
import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Menu variant types
 */
export type MenuVariant = 'top' | 'side' | 'footer';

/**
 * Menu position types
 */
export type MenuPosition = 'fixed' | 'static' | 'sticky';

/**
 * Menu theme types
 */
export type MenuTheme = 'light' | 'dark' | 'auto';

/**
 * MenuWidget configuration interface
 */
export interface MenuWidgetConfig extends BaseWidgetConfig {
  /** Widget type (Menu, TopMenu, Sidebar, SideMenu, FooterMenu) */
  type: 'Menu' | 'TopMenu' | 'Sidebar' | 'SideMenu' | 'FooterMenu';

  /** Menu style variant */
  variant?: MenuVariant;

  /** CSS position */
  position?: MenuPosition;

  /** Custom menu items (overrides bootstrap menu) */
  items?: MenuItem[];

  /** Data binding for dynamic menu items */
  itemsBinding?: string;

  /** Enable sidebar collapse (side menu only) */
  collapsible?: boolean;

  /** Default collapsed state (side menu only) */
  defaultCollapsed?: boolean;

  /** Show item icons */
  showIcons?: boolean;

  /** Show notification badges */
  showBadges?: boolean;

  /** Menu theme */
  theme?: MenuTheme;

  /** Number of columns (footer menu only) */
  columns?: number;

  /** Additional CSS classes */
  className?: string;
}
