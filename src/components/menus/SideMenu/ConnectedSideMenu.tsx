/**
 * ConnectedSideMenu Component
 *
 * SideMenu component connected to menu state via useMenu hook.
 * Automatically loads menus from bootstrap and handles navigation.
 */

import { useNavigate } from '@tanstack/react-router';
import { useSideMenu } from '@/hooks/useMenu';
import type { MenuItem } from '@/types/menu.types';
import { SideMenu } from './SideMenu';

/**
 * Connected SideMenu Props
 */
interface ConnectedSideMenuProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Connected SideMenu Component
 *
 * Integrates SideMenu component with:
 * - Menu state management for side menu items
 * - Router for navigation
 * - Collapsed state persistence
 * - Active item tracking
 */
export function ConnectedSideMenu({ className }: ConnectedSideMenuProps) {
  const navigate = useNavigate();

  // Get side menu items with state management
  const { items, activeItemId, sidebarCollapsed, toggleSidebar, setActiveItem } = useSideMenu();

  /**
   * Handle menu item click - navigate to route
   */
  const handleItemClick = (item: MenuItem) => {
    if (item.external) {
      // Open external links in new tab
      window.open(item.route, '_blank', 'noopener,noreferrer');
    } else {
      // Navigate to internal route
      navigate({ to: item.route });
      setActiveItem(item.id);
    }
  };

  return (
    <SideMenu
      items={items}
      activeItemId={activeItemId}
      collapsed={sidebarCollapsed}
      onToggleCollapse={toggleSidebar}
      onItemClick={handleItemClick}
      className={className}
    />
  );
}
