# Issue #041: Menu State Management and Bootstrap Integration

**Phase:** Phase 1.4 - Navigation & Menus  
**Weeks:** 11-12  
**Component:** Frontend  
**Estimated Effort:** 4 days  
**Priority:** High  
**Labels:** phase-1, frontend, menus, state-management, integration

**Created:** January 25, 2026

## Description

Implement menu state management system and integrate menu components with the Bootstrap API to enable dynamic, permission-filtered, server-driven menu rendering. This issue focuses on the state management, data fetching, and integration layers that connect the menu components (from Issue #040) with the backend configuration APIs.

The system must support:
- Fetching menu configuration from `/ui/bootstrap` API
- Managing menu state (expanded/collapsed, active items)
- Dynamic menu refresh on navigation or action execution
- Permission-based filtering (client-side validation)
- Menu persistence (remember collapsed state, expanded groups)
- Multiple menu instances (top, side, footer)

## Acceptance Criteria

### Bootstrap Integration
- [ ] Fetch menu configuration from `/ui/bootstrap` endpoint
- [ ] Parse menu structure from API response
- [ ] Handle menu loading states
- [ ] Handle menu errors gracefully
- [ ] Cache menu configuration (session storage)
- [ ] Detect menu version changes (from API)

### Menu State Management
- [ ] Create menu state context/store (TanStack Store)
- [ ] Track active menu item (current route)
- [ ] Track expanded submenu groups
- [ ] Track sidebar collapsed state
- [ ] Track mobile menu open/closed
- [ ] Persist state to localStorage
- [ ] Restore state on app load

### Dynamic Menu Refresh
- [ ] Refresh menu on page navigation
- [ ] Refresh menu on action execution (when specified)
- [ ] Handle menu updates without full page reload
- [ ] Animate menu changes smoothly
- [ ] Maintain scroll position during refresh

### Permission Filtering
- [ ] Client-side permission validation (defense in depth)
- [ ] Filter menu items by user permissions
- [ ] Hide unauthorized items
- [ ] Handle dynamic permission changes
- [ ] Show empty state when no items visible

### Menu Navigation Handlers
- [ ] Handle menu item click events
- [ ] Navigate to routes (TanStack Router)
- [ ] Handle external links (open in new tab)
- [ ] Handle action-based menu items
- [ ] Track navigation history

### Multi-Menu Support
- [ ] Support multiple menu instances (top, side, footer)
- [ ] Separate state for each menu type
- [ ] Coordinate active item across menus
- [ ] Handle menu-specific configurations

## Use Cases

1. **App loads, fetches menu**: Bootstrap API called → menu rendered from config
2. **User clicks menu item**: Click "Dashboard" → navigate to /dashboard → update active state
3. **User expands submenu**: Click "Reports" → expand submenu → persist state
4. **User collapses sidebar**: Click collapse icon → sidebar width changes → persist preference
5. **Menu refreshes on navigation**: Navigate to /profile → API returns updated menu → menu re-renders
6. **Action triggers menu refresh**: Execute "mark_as_read" action → action config says refresh menu → menu updates
7. **Permission changes**: User role upgraded → menu re-fetched → new items appear

## Technical Implementation

### State Management Architecture

Use **TanStack Store** for menu state (consistent with project architecture):

```typescript
// /src/stores/menuStore.ts
import { Store } from '@tanstack/store';

interface MenuState {
  // Menu configuration
  topMenu: MenuItem[];
  sideMenu: MenuItem[];
  footerMenu: MenuItem[];
  
  // UI state
  activeItemId: string | null;
  expandedGroupIds: string[];
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  
  // Loading state
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const menuStore = new Store<MenuState>({
  topMenu: [],
  sideMenu: [],
  footerMenu: [],
  activeItemId: null,
  expandedGroupIds: [],
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  loading: false,
  error: null,
  lastFetchedAt: null,
});

// Actions
export const menuActions = {
  setMenus(topMenu: MenuItem[], sideMenu: MenuItem[], footerMenu: MenuItem[]) {
    menuStore.setState(state => ({
      ...state,
      topMenu,
      sideMenu,
      footerMenu,
      loading: false,
      lastFetchedAt: Date.now(),
    }));
  },
  
  setActiveItem(itemId: string) {
    menuStore.setState(state => ({
      ...state,
      activeItemId: itemId,
    }));
  },
  
  toggleGroup(groupId: string) {
    menuStore.setState(state => {
      const expanded = state.expandedGroupIds.includes(groupId);
      return {
        ...state,
        expandedGroupIds: expanded
          ? state.expandedGroupIds.filter(id => id !== groupId)
          : [...state.expandedGroupIds, groupId],
      };
    });
  },
  
  toggleSidebar() {
    menuStore.setState(state => ({
      ...state,
      sidebarCollapsed: !state.sidebarCollapsed,
    }));
  },
  
  toggleMobileMenu() {
    menuStore.setState(state => ({
      ...state,
      mobileMenuOpen: !state.mobileMenuOpen,
    }));
  },
};
```

### Bootstrap Integration

```typescript
// /src/services/menuService.ts
import { httpClient } from './httpClient';
import { menuActions } from '@/stores/menuStore';

export class MenuService {
  /**
   * Fetch menu configuration from bootstrap API
   */
  async fetchMenus(): Promise<void> {
    try {
      const response = await httpClient.get('/ui/bootstrap');
      const { menu } = response.data;
      
      // Parse menu structure (top, side, footer)
      const topMenu = this.extractTopMenu(menu);
      const sideMenu = this.extractSideMenu(menu);
      const footerMenu = this.extractFooterMenu(menu);
      
      // Update store
      menuActions.setMenus(topMenu, sideMenu, footerMenu);
      
      // Cache in session storage
      this.cacheMenus(menu);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      menuStore.setState(state => ({
        ...state,
        loading: false,
        error: 'Failed to load menu',
      }));
    }
  }
  
  /**
   * Refresh menu from API
   */
  async refreshMenus(): Promise<void> {
    return this.fetchMenus();
  }
  
  /**
   * Extract top menu items from menu config
   */
  private extractTopMenu(menu: MenuConfig): MenuItem[] {
    return menu.items.filter(item => 
      item.position === 'top' || !item.position
    );
  }
  
  /**
   * Extract side menu items from menu config
   */
  private extractSideMenu(menu: MenuConfig): MenuItem[] {
    return menu.items.filter(item => 
      item.position === 'side'
    );
  }
  
  /**
   * Extract footer menu items from menu config
   */
  private extractFooterMenu(menu: MenuConfig): MenuItem[] {
    return menu.items.filter(item => 
      item.position === 'footer'
    );
  }
  
  /**
   * Cache menus in session storage
   */
  private cacheMenus(menu: MenuConfig): void {
    sessionStorage.setItem('menu_config', JSON.stringify(menu));
    sessionStorage.setItem('menu_cached_at', Date.now().toString());
  }
  
  /**
   * Load cached menus from session storage
   */
  loadCachedMenus(): MenuConfig | null {
    const cached = sessionStorage.getItem('menu_config');
    if (!cached) return null;
    
    const cachedAt = sessionStorage.getItem('menu_cached_at');
    const age = Date.now() - Number.parseInt(cachedAt || '0', 10);
    
    // Cache valid for 1 hour
    if (age > 3600000) {
      sessionStorage.removeItem('menu_config');
      sessionStorage.removeItem('menu_cached_at');
      return null;
    }
    
    return JSON.parse(cached);
  }
}

export const menuService = new MenuService();
```

### React Hook for Menu Integration

```typescript
// /src/hooks/useMenu.ts
import { useStore } from '@tanstack/react-store';
import { useEffect } from 'react';
import { menuStore, menuActions } from '@/stores/menuStore';
import { menuService } from '@/services/menuService';
import { useAuth } from './useAuth';

export function useMenu(menuType: 'top' | 'side' | 'footer') {
  const { user, permissions } = useAuth();
  const state = useStore(menuStore);
  
  // Fetch menus on mount
  useEffect(() => {
    if (!state.lastFetchedAt) {
      menuService.fetchMenus();
    }
  }, [state.lastFetchedAt]);
  
  // Get menu items for specific type
  const items = menuType === 'top' 
    ? state.topMenu 
    : menuType === 'side' 
    ? state.sideMenu 
    : state.footerMenu;
  
  // Filter by permissions (client-side validation)
  const filteredItems = filterByPermissions(items, permissions);
  
  return {
    items: filteredItems,
    activeItemId: state.activeItemId,
    expandedGroupIds: state.expandedGroupIds,
    collapsed: state.sidebarCollapsed,
    loading: state.loading,
    error: state.error,
    
    // Actions
    setActiveItem: menuActions.setActiveItem,
    toggleGroup: menuActions.toggleGroup,
    toggleSidebar: menuActions.toggleSidebar,
    refreshMenus: menuService.refreshMenus,
  };
}

function filterByPermissions(items: MenuItem[], permissions: string[]): MenuItem[] {
  return items.filter(item => {
    // No permissions required
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }
    
    // Check if user has any required permission
    const hasPermission = item.permissions.some(perm => permissions.includes(perm));
    if (!hasPermission) {
      return false;
    }
    
    // Recursively filter children
    if (item.children) {
      item.children = filterByPermissions(item.children, permissions);
    }
    
    return true;
  });
}
```

### Menu Component Integration

```typescript
// /src/components/menus/TopMenu/TopMenu.tsx (updated)
import { useMenu } from '@/hooks/useMenu';
import { useNavigate } from '@tanstack/react-router';

export function TopMenu() {
  const { items, activeItemId, setActiveItem } = useMenu('top');
  const navigate = useNavigate();
  
  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      setActiveItem(item.id);
      navigate({ to: item.path });
    }
  };
  
  return (
    <TopMenuComponent 
      items={items} 
      activeItemId={activeItemId}
      onItemClick={handleItemClick}
    />
  );
}
```

### State Persistence

```typescript
// /src/utils/menuPersistence.ts
const STORAGE_KEY = 'menu_ui_state';

export interface PersistedMenuState {
  sidebarCollapsed: boolean;
  expandedGroupIds: string[];
}

export function saveMenuState(state: PersistedMenuState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadMenuState(): PersistedMenuState | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearMenuState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

### Dynamic Menu Refresh

```typescript
// /src/utils/menuRefresh.ts
import { menuService } from '@/services/menuService';

/**
 * Check if action requires menu refresh
 */
export function shouldRefreshMenu(actionConfig: ActionConfig): boolean {
  return actionConfig.refreshMenu === true;
}

/**
 * Handle menu refresh after action execution
 */
export async function handlePostActionMenuRefresh(
  actionConfig: ActionConfig
): Promise<void> {
  if (shouldRefreshMenu(actionConfig)) {
    await menuService.refreshMenus();
  }
}
```

## Dependencies

- **Depends on:**
  - #010 (Bootstrap API) - menu data source
  - #011 (User Context) - user permissions
  - #013 (Route Resolver) - navigation
  - #040 (Menu Components) - UI components
  
- **Blocks:**
  - #042 (Menu Widget System) - needs state management

- **npm packages:**
  - @tanstack/react-store (already installed)
  - @tanstack/react-router (already installed)

## Deliverables

1. **Menu Store**
   - menuStore.ts (TanStack Store)
   - menuActions.ts (action creators)
   - menuSelectors.ts (state selectors)
   - types.ts (TypeScript interfaces)

2. **Menu Service**
   - menuService.ts (API integration)
   - menuCache.ts (caching logic)
   - menuPersistence.ts (localStorage)

3. **React Hooks**
   - useMenu.ts (main hook)
   - useMenuState.ts (state hook)
   - useMenuNavigation.ts (navigation hook)

4. **Integration Layer**
   - menuRefresh.ts (dynamic refresh)
   - menuFiltering.ts (permission filtering)
   - menuTracking.ts (analytics)

5. **Tests**
   - menuStore.test.ts
   - menuService.test.ts
   - useMenu.test.ts
   - integration.test.tsx

6. **Documentation**
   - Menu state architecture
   - API integration guide
   - Hooks usage guide
   - Troubleshooting guide

## Testing Requirements

### Unit Tests

```typescript
describe('menuStore', () => {
  it('initializes with empty menus', () => {});
  it('updates menus from API', () => {});
  it('tracks active item', () => {});
  it('toggles expanded groups', () => {});
  it('toggles sidebar collapsed', () => {});
});

describe('menuService', () => {
  it('fetches menus from API', () => {});
  it('parses menu structure', () => {});
  it('caches menus in session storage', () => {});
  it('loads cached menus', () => {});
  it('handles API errors', () => {});
});

describe('useMenu', () => {
  it('loads menus on mount', () => {});
  it('filters items by permissions', () => {});
  it('updates active item', () => {});
  it('toggles groups', () => {});
  it('refreshes on demand', () => {});
});
```

### Integration Tests

```typescript
describe('Menu Integration', () => {
  it('fetches and renders menu from API', async () => {});
  it('navigates when item clicked', async () => {});
  it('updates active item on navigation', async () => {});
  it('refreshes menu after action', async () => {});
  it('persists sidebar state', async () => {});
});
```

## Performance Considerations

- Cache menu configuration in session storage
- Debounce menu refresh calls (max 1 per second)
- Memoize filtered menu items
- Use shallow comparison for state updates
- Lazy load menu icons
- Virtualize long menu lists (if needed)

## Security Considerations

- Server-side permission filtering is authoritative
- Client-side filtering is defense in depth
- Never trust client-side menu visibility
- Always validate permissions on backend
- Sanitize menu item labels (XSS prevention)

## Migration Path

1. Phase 1: Implement basic state management
2. Phase 2: Add bootstrap integration
3. Phase 3: Add dynamic refresh
4. Phase 4: Add persistence
5. Phase 5: Optimize performance

## Notes

- Menu state is session-scoped (cleared on logout)
- UI preferences (collapsed state) persisted in localStorage
- Menu refresh is opt-in via action configuration
- Permission filtering happens on both server and client
- Mobile menu state is ephemeral (not persisted)

## Success Criteria

✅ Menus load from bootstrap API  
✅ Menu state managed in TanStack Store  
✅ Active item tracked and highlighted  
✅ Sidebar collapse state persisted  
✅ Menu refreshes dynamically on navigation  
✅ Menu refreshes after actions (when specified)  
✅ Permission filtering works client-side  
✅ Navigation works (TanStack Router)  
✅ Tests pass (>80% coverage)  
✅ No performance regressions
