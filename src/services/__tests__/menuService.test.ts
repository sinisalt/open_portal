/**
 * Menu Service Tests
 */

import type { MenuItem as BootstrapMenuItem, BootstrapResponse } from '@/types/bootstrap.types';
import type { MenuItem } from '@/types/menu.types';
import {
  extractFooterMenu,
  extractMenus,
  extractSideMenu,
  extractTopMenu,
  filterMenuByPermissions,
  findMenuItemById,
  findMenuItemByRoute,
  getParentGroupIds,
} from '../menuService';

describe('menuService', () => {
  const mockBootstrap: BootstrapResponse = {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatar: undefined,
      roles: ['user'],
    },
    permissions: ['read', 'write'],
    tenant: {
      id: 'tenant1',
      name: 'Test Tenant',
      brandingVersion: '1.0',
    },
    menu: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
        order: 1,
      } as BootstrapMenuItem,
      {
        id: 'reports',
        label: 'Reports',
        icon: 'chart',
        route: '/reports',
        order: 2,
        children: [
          {
            id: 'sales-report',
            label: 'Sales Report',
            route: '/reports/sales',
            order: 1,
          } as BootstrapMenuItem,
          {
            id: 'inventory-report',
            label: 'Inventory Report',
            route: '/reports/inventory',
            order: 2,
            permission: 'admin',
          } as BootstrapMenuItem,
        ],
      } as BootstrapMenuItem,
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        route: '/settings',
        order: 3,
        permission: 'write',
      } as BootstrapMenuItem,
    ],
    defaults: {
      homePage: '/dashboard',
      theme: 'light',
    },
    featureFlags: {},
  };

  describe('extractTopMenu', () => {
    it('extracts top menu items (items without children)', () => {
      const topMenu = extractTopMenu(mockBootstrap);

      // Items without children go to top menu
      expect(topMenu.some(item => item.id === 'dashboard')).toBe(true);
      expect(topMenu.some(item => item.id === 'settings')).toBe(true);
    });

    it('returns empty array when bootstrap is null', () => {
      const topMenu = extractTopMenu(null);
      expect(topMenu).toEqual([]);
    });

    it('sorts items by order', () => {
      const topMenu = extractTopMenu(mockBootstrap);
      expect(topMenu[0].id).toBe('dashboard');
    });
  });

  describe('extractSideMenu', () => {
    it('extracts side menu items (items with children)', () => {
      const sideMenu = extractSideMenu(mockBootstrap);

      // Items with children go to side menu
      expect(sideMenu.some(item => item.id === 'reports')).toBe(true);
    });

    it('returns empty array when bootstrap is null', () => {
      const sideMenu = extractSideMenu(null);
      expect(sideMenu).toEqual([]);
    });
  });

  describe('extractFooterMenu', () => {
    it('returns empty array for default bootstrap (no footer items)', () => {
      const footerMenu = extractFooterMenu(mockBootstrap);
      expect(footerMenu).toEqual([]);
    });

    it('returns empty array when bootstrap is null', () => {
      const footerMenu = extractFooterMenu(null);
      expect(footerMenu).toEqual([]);
    });
  });

  describe('extractMenus', () => {
    it('extracts all menu types', () => {
      const menus = extractMenus(mockBootstrap);

      expect(menus).toHaveProperty('top');
      expect(menus).toHaveProperty('side');
      expect(menus).toHaveProperty('footer');
      expect(Array.isArray(menus.top)).toBe(true);
      expect(Array.isArray(menus.side)).toBe(true);
      expect(Array.isArray(menus.footer)).toBe(true);
    });
  });

  describe('filterMenuByPermissions', () => {
    const menuItems: MenuItem[] = [
      {
        id: 'public',
        label: 'Public',
        route: '/public',
        order: 1,
      },
      {
        id: 'protected',
        label: 'Protected',
        route: '/protected',
        order: 2,
        permission: 'write',
      },
      {
        id: 'admin-only',
        label: 'Admin Only',
        route: '/admin',
        order: 3,
        permission: 'admin',
      },
    ];

    it('includes items without permission requirements', () => {
      const filtered = filterMenuByPermissions(menuItems, []);
      expect(filtered.some(item => item.id === 'public')).toBe(true);
    });

    it('filters items by user permissions', () => {
      const filtered = filterMenuByPermissions(menuItems, ['write']);

      expect(filtered.some(item => item.id === 'public')).toBe(true);
      expect(filtered.some(item => item.id === 'protected')).toBe(true);
      expect(filtered.some(item => item.id === 'admin-only')).toBe(false);
    });

    it('filters children recursively', () => {
      const itemsWithChildren: MenuItem[] = [
        {
          id: 'parent',
          label: 'Parent',
          route: '/parent',
          order: 1,
          children: [
            {
              id: 'child1',
              label: 'Child 1',
              route: '/parent/child1',
              order: 1,
            },
            {
              id: 'child2',
              label: 'Child 2',
              route: '/parent/child2',
              order: 2,
              permission: 'admin',
            },
          ],
        },
      ];

      const filtered = filterMenuByPermissions(itemsWithChildren, ['write']);

      expect(filtered[0].children).toHaveLength(1);
      expect(filtered[0].children?.[0].id).toBe('child1');
    });
  });

  describe('findMenuItemById', () => {
    const menuItems: MenuItem[] = [
      {
        id: 'item1',
        label: 'Item 1',
        route: '/item1',
        order: 1,
      },
      {
        id: 'item2',
        label: 'Item 2',
        route: '/item2',
        order: 2,
        children: [
          {
            id: 'item2-1',
            label: 'Item 2-1',
            route: '/item2/1',
            order: 1,
          },
        ],
      },
    ];

    it('finds top-level item by id', () => {
      const item = findMenuItemById(menuItems, 'item1');
      expect(item).not.toBeNull();
      expect(item?.id).toBe('item1');
    });

    it('finds nested item by id', () => {
      const item = findMenuItemById(menuItems, 'item2-1');
      expect(item).not.toBeNull();
      expect(item?.id).toBe('item2-1');
    });

    it('returns null for non-existent id', () => {
      const item = findMenuItemById(menuItems, 'non-existent');
      expect(item).toBeNull();
    });
  });

  describe('findMenuItemByRoute', () => {
    const menuItems: MenuItem[] = [
      {
        id: 'item1',
        label: 'Item 1',
        route: '/item1',
        order: 1,
      },
      {
        id: 'item2',
        label: 'Item 2',
        route: '/item2',
        order: 2,
        children: [
          {
            id: 'item2-1',
            label: 'Item 2-1',
            route: '/item2/1',
            order: 1,
          },
        ],
      },
    ];

    it('finds top-level item by route', () => {
      const item = findMenuItemByRoute(menuItems, '/item1');
      expect(item).not.toBeNull();
      expect(item?.id).toBe('item1');
    });

    it('finds nested item by route', () => {
      const item = findMenuItemByRoute(menuItems, '/item2/1');
      expect(item).not.toBeNull();
      expect(item?.id).toBe('item2-1');
    });

    it('returns null for non-existent route', () => {
      const item = findMenuItemByRoute(menuItems, '/non-existent');
      expect(item).toBeNull();
    });
  });

  describe('getParentGroupIds', () => {
    const menuItems: MenuItem[] = [
      {
        id: 'level1',
        label: 'Level 1',
        route: '/level1',
        order: 1,
        children: [
          {
            id: 'level2',
            label: 'Level 2',
            route: '/level1/level2',
            order: 1,
            children: [
              {
                id: 'level3',
                label: 'Level 3',
                route: '/level1/level2/level3',
                order: 1,
              },
            ],
          },
        ],
      },
    ];

    it('returns empty array for top-level item', () => {
      const parentIds = getParentGroupIds(menuItems, 'level1');
      expect(parentIds).toEqual([]);
    });

    it('returns parent ids for nested item', () => {
      const parentIds = getParentGroupIds(menuItems, 'level2');
      expect(parentIds).toContain('level1');
    });

    it('returns all parent ids for deeply nested item', () => {
      const parentIds = getParentGroupIds(menuItems, 'level3');
      expect(parentIds).toContain('level1');
      expect(parentIds).toContain('level2');
    });

    it('returns empty array for non-existent item', () => {
      const parentIds = getParentGroupIds(menuItems, 'non-existent');
      expect(parentIds).toEqual([]);
    });
  });
});
