/**
 * Route Resolver Service Tests
 */

import { describe, expect, it } from '@jest/globals';
import type { RouteConfig } from '@/types/route.types';
import {
  buildPath,
  detectCircularRedirects,
  extractParams,
  filterRoutesByPermission,
  matchesPattern,
  resolveRoute,
  validateRouteConfig,
} from './routeResolver';

describe('routeResolver', () => {
  describe('matchesPattern', () => {
    it('should match static routes', () => {
      expect(matchesPattern('/dashboard', '/dashboard')).toBe(true);
      expect(matchesPattern('/dashboard', '/profile')).toBe(false);
    });

    it('should match dynamic routes', () => {
      expect(matchesPattern('/user/123', '/user/:id')).toBe(true);
      expect(matchesPattern('/user/abc', '/user/:id')).toBe(true);
      expect(matchesPattern('/user', '/user/:id')).toBe(false);
    });

    it('should match optional parameters', () => {
      expect(matchesPattern('/search/test', '/search/:term?')).toBe(true);
      expect(matchesPattern('/search', '/search/:term?')).toBe(true);
      expect(matchesPattern('/search/', '/search/:term?')).toBe(true);
    });

    it('should match wildcard routes', () => {
      expect(matchesPattern('/docs/api/users', '/docs/*')).toBe(true);
      expect(matchesPattern('/docs/getting-started', '/docs/*')).toBe(true);
      expect(matchesPattern('/docs', '/docs/*')).toBe(false);
    });

    it('should handle trailing slashes', () => {
      expect(matchesPattern('/dashboard/', '/dashboard')).toBe(true);
      expect(matchesPattern('/dashboard', '/dashboard/')).toBe(true);
    });

    it('should match nested routes', () => {
      expect(matchesPattern('/settings/profile', '/settings/profile')).toBe(true);
      expect(matchesPattern('/settings/profile/edit', '/settings/profile/edit')).toBe(true);
    });
  });

  describe('extractParams', () => {
    it('should extract single parameter', () => {
      const params = extractParams('/user/123', '/user/:id');
      expect(params).toEqual({ id: '123' });
    });

    it('should extract multiple parameters', () => {
      const params = extractParams('/org/acme/user/456', '/org/:orgId/user/:userId');
      expect(params).toEqual({ orgId: 'acme', userId: '456' });
    });

    it('should extract optional parameters when present', () => {
      const params = extractParams('/search/test', '/search/:term?');
      expect(params).toEqual({ term: 'test' });
    });

    it('should handle missing optional parameters', () => {
      const params = extractParams('/search', '/search/:term?');
      expect(params).toEqual({});
    });

    it('should return empty object for non-matching path', () => {
      const params = extractParams('/dashboard', '/user/:id');
      expect(params).toEqual({});
    });
  });

  describe('buildPath', () => {
    it('should build path with parameters', () => {
      const path = buildPath('/user/:id', { id: '123' });
      expect(path).toBe('/user/123');
    });

    it('should build path with multiple parameters', () => {
      const path = buildPath('/org/:orgId/user/:userId', { orgId: 'acme', userId: '456' });
      expect(path).toBe('/org/acme/user/456');
    });

    it('should handle optional parameters', () => {
      const path1 = buildPath('/search/:term?', { term: 'test' });
      expect(path1).toBe('/search/test');

      const path2 = buildPath('/search/:term?', {});
      expect(path2).toBe('/search');
    });

    it('should clean up double slashes', () => {
      const path = buildPath('/search/:term?', {});
      expect(path).toBe('/search');
    });
  });

  describe('resolveRoute', () => {
    const routes: RouteConfig[] = [
      {
        pattern: '/dashboard',
        pageId: 'dashboard-page',
        metadata: { title: 'Dashboard' },
      },
      {
        pattern: '/user/:id',
        pageId: 'user-profile',
        permissions: ['user.view'],
      },
      {
        pattern: '/admin/:section',
        pageId: 'admin-panel',
        permissions: ['admin.access'],
        priority: 10,
      },
      {
        pattern: '/search/:term?',
        pageId: 'search-page',
      },
      {
        pattern: '/docs/*',
        pageId: 'docs-page',
      },
    ];

    it('should resolve static route', () => {
      const result = resolveRoute('/dashboard', routes);
      expect(result.pageId).toBe('dashboard-page');
      expect(result.params).toEqual({});
      expect(result.metadata).toEqual({ title: 'Dashboard' });
    });

    it('should resolve dynamic route with parameters', () => {
      const result = resolveRoute('/user/123', routes, { permissions: ['user.view'] });
      expect(result.pageId).toBe('user-profile');
      expect(result.params).toEqual({ id: '123' });
      expect(result.hasPermission).toBe(true);
    });

    it('should resolve route with optional parameters', () => {
      const result1 = resolveRoute('/search/test', routes);
      expect(result1.pageId).toBe('search-page');
      expect(result1.params).toEqual({ term: 'test' });

      const result2 = resolveRoute('/search', routes);
      expect(result2.pageId).toBe('search-page');
      expect(result2.params).toEqual({});
    });

    it('should resolve wildcard route', () => {
      const result = resolveRoute('/docs/api/getting-started', routes);
      expect(result.pageId).toBe('docs-page');
    });

    it('should check permissions', () => {
      const result = resolveRoute('/admin/users', routes, {
        permissions: ['admin.access'],
      });
      expect(result.pageId).toBe('admin-panel');
      expect(result.hasPermission).toBe(true);
    });

    it('should skip routes without permission', () => {
      expect(() => {
        resolveRoute('/admin/users', routes, { permissions: [] });
      }).toThrow('No route found');
    });

    it('should respect route priority', () => {
      const priorityRoutes: RouteConfig[] = [
        { pattern: '/page/:id', pageId: 'low-priority', priority: 0 },
        { pattern: '/page/:id', pageId: 'high-priority', priority: 100 },
      ];

      const result = resolveRoute('/page/123', priorityRoutes);
      expect(result.pageId).toBe('high-priority');
    });

    it('should throw error for non-existent route', () => {
      expect(() => {
        resolveRoute('/non-existent', routes);
      }).toThrow('No route found for path: /non-existent');
    });

    it('should return route without permission when includeUnauthorized is true', () => {
      const result = resolveRoute('/admin/users', routes, {
        permissions: [],
        includeUnauthorized: true,
      });
      expect(result.pageId).toBe('admin-panel');
      expect(result.hasPermission).toBe(false);
    });
  });

  describe('validateRouteConfig', () => {
    it('should validate correct route config', () => {
      const route: RouteConfig = {
        pattern: '/dashboard',
        pageId: 'dashboard-page',
      };
      expect(validateRouteConfig(route)).toBe(true);
    });

    it('should reject route without pattern', () => {
      const route = {
        pageId: 'dashboard-page',
      } as RouteConfig;
      expect(validateRouteConfig(route)).toBe(false);
    });

    it('should reject route without pageId', () => {
      const route = {
        pattern: '/dashboard',
      } as RouteConfig;
      expect(validateRouteConfig(route)).toBe(false);
    });

    it('should reject route pattern not starting with /', () => {
      const route: RouteConfig = {
        pattern: 'dashboard',
        pageId: 'dashboard-page',
      };
      expect(validateRouteConfig(route)).toBe(false);
    });

    it('should validate route with all optional fields', () => {
      const route: RouteConfig = {
        pattern: '/dashboard',
        pageId: 'dashboard-page',
        permissions: ['dashboard.view'],
        exact: true,
        priority: 10,
        metadata: { title: 'Dashboard' },
      };
      expect(validateRouteConfig(route)).toBe(true);
    });
  });

  describe('filterRoutesByPermission', () => {
    const routes: RouteConfig[] = [
      { pattern: '/public', pageId: 'public-page' },
      { pattern: '/user', pageId: 'user-page', permissions: ['user.view'] },
      { pattern: '/admin', pageId: 'admin-page', permissions: ['admin.access'] },
      {
        pattern: '/superadmin',
        pageId: 'superadmin-page',
        permissions: ['admin.access', 'superadmin.access'],
      },
    ];

    it('should return all routes without permissions', () => {
      const filtered = filterRoutesByPermission(routes, []);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].pageId).toBe('public-page');
    });

    it('should filter routes by single permission', () => {
      const filtered = filterRoutesByPermission(routes, ['user.view']);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(r => r.pageId)).toEqual(['public-page', 'user-page']);
    });

    it('should filter routes by multiple permissions', () => {
      const filtered = filterRoutesByPermission(routes, ['admin.access', 'superadmin.access']);
      expect(filtered).toHaveLength(3);
      expect(filtered.map(r => r.pageId)).toEqual(['public-page', 'admin-page', 'superadmin-page']);
    });

    it('should require all permissions for route', () => {
      const filtered = filterRoutesByPermission(routes, ['admin.access']);
      expect(filtered.map(r => r.pageId)).toEqual(['public-page', 'admin-page']);
      expect(filtered.map(r => r.pageId)).not.toContain('superadmin-page');
    });
  });

  describe('detectCircularRedirects', () => {
    it('should detect simple circular redirect', () => {
      const routes: RouteConfig[] = [
        { pattern: '/a', pageId: 'page-a', redirect: '/b' },
        { pattern: '/b', pageId: 'page-b', redirect: '/a' },
      ];

      const circular = detectCircularRedirects(routes);
      expect(circular).toContain('/a');
    });

    it('should detect complex circular redirect chain', () => {
      const routes: RouteConfig[] = [
        { pattern: '/a', pageId: 'page-a', redirect: '/b' },
        { pattern: '/b', pageId: 'page-b', redirect: '/c' },
        { pattern: '/c', pageId: 'page-c', redirect: '/a' },
      ];

      const circular = detectCircularRedirects(routes);
      expect(circular.length).toBeGreaterThan(0);
    });

    it('should not report non-circular redirects', () => {
      const routes: RouteConfig[] = [
        { pattern: '/old-url', pageId: 'page-a', redirect: '/new-url' },
        { pattern: '/new-url', pageId: 'page-b' },
      ];

      const circular = detectCircularRedirects(routes);
      expect(circular).toHaveLength(0);
    });

    it('should handle routes without redirects', () => {
      const routes: RouteConfig[] = [
        { pattern: '/a', pageId: 'page-a' },
        { pattern: '/b', pageId: 'page-b' },
      ];

      const circular = detectCircularRedirects(routes);
      expect(circular).toHaveLength(0);
    });
  });
});
