/**
 * Menu Context
 *
 * React Context for managing menu state across the application
 */

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { MenuItem } from '@/types/menu.types';

/**
 * Menu state interface
 */
interface MenuState {
  /** Top menu items */
  topMenu: MenuItem[];
  /** Side menu items */
  sideMenu: MenuItem[];
  /** Footer menu items */
  footerMenu: MenuItem[];
  /** Currently active menu item ID */
  activeItemId: string | null;
  /** IDs of expanded menu groups (for side menu) */
  expandedGroupIds: string[];
  /** Whether sidebar is collapsed (icon-only mode) */
  sidebarCollapsed: boolean;
  /** Whether mobile menu is open */
  mobileMenuOpen: boolean;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * Menu actions interface
 */
interface MenuActions {
  /** Set menu items from bootstrap data */
  setMenus: (menus: { top: MenuItem[]; side: MenuItem[]; footer: MenuItem[] }) => void;
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
  /** Clear all menus */
  clearMenus: () => void;
}

/**
 * Menu context value
 */
interface MenuContextValue extends MenuState, MenuActions {}

/**
 * Local storage keys
 */
const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: 'menu_sidebar_collapsed',
  EXPANDED_GROUPS: 'menu_expanded_groups',
};

/**
 * Menu Context
 */
const MenuContext = createContext<MenuContextValue | undefined>(undefined);

/**
 * Load persisted UI state from localStorage
 */
function loadPersistedState(): Pick<MenuState, 'sidebarCollapsed' | 'expandedGroupIds'> {
  try {
    const collapsed = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    const expandedGroups = localStorage.getItem(STORAGE_KEYS.EXPANDED_GROUPS);

    return {
      sidebarCollapsed: collapsed === 'true',
      expandedGroupIds: expandedGroups ? JSON.parse(expandedGroups) : [],
    };
  } catch (error) {
    console.warn('Failed to load persisted menu state:', error);
    return {
      sidebarCollapsed: false,
      expandedGroupIds: [],
    };
  }
}

/**
 * Save UI state to localStorage
 */
function savePersistedState(collapsed: boolean, expandedGroupIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed.toString());
    localStorage.setItem(STORAGE_KEYS.EXPANDED_GROUPS, JSON.stringify(expandedGroupIds));
  } catch (error) {
    console.warn('Failed to save menu state:', error);
  }
}

/**
 * Menu Provider Props
 */
interface MenuProviderProps {
  children: React.ReactNode;
}

/**
 * Menu Provider Component
 *
 * Provides menu state and actions to all child components
 */
export function MenuProvider({ children }: MenuProviderProps) {
  // Load persisted UI preferences
  const persistedState = loadPersistedState();

  // Menu state
  const [state, setState] = useState<MenuState>({
    topMenu: [],
    sideMenu: [],
    footerMenu: [],
    activeItemId: null,
    expandedGroupIds: persistedState.expandedGroupIds,
    sidebarCollapsed: persistedState.sidebarCollapsed,
    mobileMenuOpen: false,
    loading: false,
    error: null,
  });

  // Persist UI state changes
  useEffect(() => {
    savePersistedState(state.sidebarCollapsed, state.expandedGroupIds);
  }, [state.sidebarCollapsed, state.expandedGroupIds]);

  /**
   * Set menu items from bootstrap data
   */
  const setMenus = useCallback(
    (menus: { top: MenuItem[]; side: MenuItem[]; footer: MenuItem[] }) => {
      setState(prev => ({
        ...prev,
        topMenu: menus.top,
        sideMenu: menus.side,
        footerMenu: menus.footer,
        loading: false,
        error: null,
      }));
    },
    []
  );

  /**
   * Set active menu item
   */
  const setActiveItem = useCallback((itemId: string | null) => {
    setState(prev => ({
      ...prev,
      activeItemId: itemId,
    }));
  }, []);

  /**
   * Toggle expanded state of a menu group
   */
  const toggleGroup = useCallback((groupId: string) => {
    setState(prev => {
      const isExpanded = prev.expandedGroupIds.includes(groupId);
      return {
        ...prev,
        expandedGroupIds: isExpanded
          ? prev.expandedGroupIds.filter(id => id !== groupId)
          : [...prev.expandedGroupIds, groupId],
      };
    });
  }, []);

  /**
   * Toggle sidebar collapsed state
   */
  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed,
    }));
  }, []);

  /**
   * Toggle mobile menu open state
   */
  const toggleMobileMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      mobileMenuOpen: !prev.mobileMenuOpen,
    }));
  }, []);

  /**
   * Expand all groups
   */
  const expandAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      expandedGroupIds: prev.sideMenu
        .filter(item => item.children && item.children.length > 0)
        .map(item => item.id),
    }));
  }, []);

  /**
   * Collapse all groups
   */
  const collapseAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      expandedGroupIds: [],
    }));
  }, []);

  /**
   * Clear all menus
   */
  const clearMenus = useCallback(() => {
    setState(prev => ({
      ...prev,
      topMenu: [],
      sideMenu: [],
      footerMenu: [],
      activeItemId: null,
      loading: false,
      error: null,
    }));
  }, []);

  const value: MenuContextValue = {
    ...state,
    setMenus,
    setActiveItem,
    toggleGroup,
    toggleSidebar,
    toggleMobileMenu,
    expandAll,
    collapseAll,
    clearMenus,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

/**
 * Hook to use menu context
 *
 * @throws Error if used outside MenuProvider
 */
export function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
}
