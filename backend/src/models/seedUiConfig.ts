import { randomUUID } from 'node:crypto';
import type { MenuConfig, PageConfig, RouteConfig, TenantBranding } from './database.js';
import { db } from './database.js';

/**
 * Seed UI configuration data for testing
 */
export async function seedUiConfig(): Promise<void> {
  // Seed tenant branding for default tenant
  const defaultBranding: TenantBranding = {
    id: randomUUID(),
    tenantId: 'tenant-001',
    version: '1.0.0',
    config: {
      colors: {
        primary: '#1e40af',
        secondary: '#64748b',
        success: '#16a34a',
        warning: '#ca8a04',
        error: '#dc2626',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
      },
      typography: {
        fontFamily: "'Inter', sans-serif",
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      logos: {
        primary: '/logo.svg',
        secondary: '/logo-light.svg',
        favicon: '/favicon.ico',
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createTenantBranding(defaultBranding);

  // Seed menu config
  const defaultMenu: MenuConfig = {
    id: randomUUID(),
    tenantId: 'tenant-001',
    role: 'user',
    config: {
      items: [
        {
          id: 'home',
          label: 'Home',
          icon: 'home',
          path: '/',
          order: 0,
        },
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          path: '/dashboard',
          order: 1,
          permissions: ['dashboard.view'],
        },
        {
          id: 'users',
          label: 'Users',
          icon: 'users',
          path: '/users',
          order: 2,
          permissions: ['users.view'],
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          path: '/settings',
          order: 3,
          permissions: ['settings.view'],
        },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createMenuConfig(defaultMenu);

  // Seed admin menu config
  const adminMenu: MenuConfig = {
    id: randomUUID(),
    tenantId: 'tenant-001',
    role: 'admin',
    config: {
      items: [
        {
          id: 'home',
          label: 'Home',
          icon: 'home',
          path: '/',
          order: 0,
        },
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          path: '/dashboard',
          order: 1,
        },
        {
          id: 'users',
          label: 'Users',
          icon: 'users',
          path: '/users',
          order: 2,
        },
        {
          id: 'admin',
          label: 'Administration',
          icon: 'admin',
          path: '/admin',
          order: 3,
          permissions: ['admin.access'],
          children: [
            {
              id: 'admin-users',
              label: 'Manage Users',
              path: '/admin/users',
              permissions: ['admin.users.manage'],
            },
            {
              id: 'admin-settings',
              label: 'System Settings',
              path: '/admin/settings',
              permissions: ['admin.settings.manage'],
            },
          ],
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          path: '/settings',
          order: 4,
        },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createMenuConfig(adminMenu);

  // Seed route configs
  const routes: RouteConfig[] = [
    {
      id: randomUUID(),
      pattern: '/',
      pageId: 'home',
      permissions: [],
      exact: true,
      tenantId: 'tenant-001',
      priority: 0,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      pattern: '/dashboard',
      pageId: 'dashboard',
      permissions: ['dashboard.view'],
      exact: true,
      tenantId: 'tenant-001',
      priority: 0,
      metadata: {
        title: 'Dashboard',
      },
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      pattern: '/users',
      pageId: 'users-list',
      permissions: ['users.view'],
      exact: true,
      tenantId: 'tenant-001',
      priority: 0,
      metadata: {
        title: 'Users',
      },
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      pattern: '/settings',
      pageId: 'settings',
      permissions: ['settings.view'],
      exact: true,
      tenantId: 'tenant-001',
      priority: 0,
      metadata: {
        title: 'Settings',
      },
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      pattern: '/admin',
      pageId: 'admin-dashboard',
      permissions: ['admin.access'],
      exact: false,
      tenantId: 'tenant-001',
      priority: 0,
      metadata: {
        title: 'Administration',
      },
      createdAt: new Date(),
    },
  ];

  for (const route of routes) {
    db.createRouteConfig(route);
  }

  // Seed page configs
  const homePageConfig: PageConfig = {
    id: randomUUID(),
    pageId: 'home',
    version: '1.0.0',
    config: {
      pageId: 'home',
      schemaVersion: '1.0',
      title: 'Home',
      widgets: [
        {
          id: 'page',
          type: 'Page',
          props: {
            title: 'Welcome to OpenPortal',
          },
          children: [
            {
              id: 'section-1',
              type: 'Section',
              props: {
                title: 'Getting Started',
              },
              children: [
                {
                  id: 'card-1',
                  type: 'Card',
                  props: {
                    title: 'Dashboard',
                    description: 'View your personalized dashboard',
                  },
                },
                {
                  id: 'card-2',
                  type: 'Card',
                  props: {
                    title: 'Users',
                    description: 'Manage users and permissions',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    tenantId: 'tenant-001',
    permissions: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createPageConfig(homePageConfig);

  const dashboardPageConfig: PageConfig = {
    id: randomUUID(),
    pageId: 'dashboard',
    version: '1.0.0',
    config: {
      pageId: 'dashboard',
      schemaVersion: '1.0',
      title: 'Dashboard',
      widgets: [
        {
          id: 'page',
          type: 'Page',
          props: {
            title: 'Dashboard',
          },
          children: [
            {
              id: 'kpi-section',
              type: 'Section',
              props: {
                title: 'Key Metrics',
              },
              children: [
                {
                  id: 'kpi-users',
                  type: 'KPI',
                  props: {
                    title: 'Total Users',
                    value: '1,234',
                    trend: '+12%',
                    trendDirection: 'up',
                  },
                },
                {
                  id: 'kpi-revenue',
                  type: 'KPI',
                  props: {
                    title: 'Revenue',
                    value: '$45,678',
                    trend: '+8%',
                    trendDirection: 'up',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    tenantId: 'tenant-001',
    permissions: ['dashboard.view'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createPageConfig(dashboardPageConfig);

  console.log('✅ UI configurations seeded successfully');
}
