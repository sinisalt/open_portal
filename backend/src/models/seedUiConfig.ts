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
          id: 'profile',
          label: 'Profile',
          icon: 'user',
          path: '/profile',
          order: 2,
        },
        {
          id: 'listings',
          label: 'Listings',
          icon: 'list',
          path: '/listings',
          order: 3,
          permissions: ['items.view'],
        },
        {
          id: 'users',
          label: 'Users',
          icon: 'users',
          path: '/users',
          order: 4,
          permissions: ['users.view'],
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          path: '/settings',
          order: 5,
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
          id: 'profile',
          label: 'Profile',
          icon: 'user',
          path: '/profile',
          order: 2,
        },
        {
          id: 'listings',
          label: 'Listings',
          icon: 'list',
          path: '/listings',
          order: 3,
        },
        {
          id: 'users',
          label: 'Users',
          icon: 'users',
          path: '/users',
          order: 4,
        },
        {
          id: 'admin',
          label: 'Administration',
          icon: 'admin',
          path: '/admin',
          order: 5,
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
          order: 6,
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
      pattern: '/profile',
      pageId: 'profile',
      permissions: [],
      exact: true,
      tenantId: 'tenant-001',
      priority: 0,
      metadata: {
        title: 'User Profile',
      },
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      pattern: '/listings',
      pageId: 'listings',
      permissions: ['items.view'],
      exact: true,
      tenantId: 'tenant-001',
      priority: 0,
      metadata: {
        title: 'Listings',
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

  // Enhanced Dashboard page with comprehensive widgets
  const enhancedDashboardConfig: PageConfig = {
    id: randomUUID(),
    pageId: 'dashboard-enhanced',
    version: '1.0.0',
    config: {
      pageId: 'dashboard-enhanced',
      schemaVersion: '1.0',
      title: 'Dashboard - Full Sample',
      widgets: [
        {
          id: 'page',
          type: 'Page',
          props: {
            title: 'Dashboard',
            padding: 'md',
          },
          children: [
            {
              id: 'kpi-section',
              type: 'Section',
              props: {
                title: 'Key Metrics',
                bordered: false,
                padding: 'md',
              },
              children: [
                {
                  id: 'kpi-grid',
                  type: 'Grid',
                  props: {
                    columns: 12,
                    gap: 'md',
                  },
                  children: [
                    {
                      id: 'kpi-users',
                      type: 'KPI',
                      layoutProps: { span: 3 },
                      props: {
                        label: 'Total Users',
                        format: 'number',
                        showTrend: true,
                        size: 'md',
                        icon: 'users',
                      },
                      bindings: {
                        value: '{{datasources.metrics.data.totalUsers}}',
                        trend: '{{datasources.metrics.data.usersTrend}}',
                      },
                      events: {
                        onClick: { actionId: 'showUserDetails' },
                      },
                    },
                    {
                      id: 'kpi-revenue',
                      type: 'KPI',
                      layoutProps: { span: 3 },
                      props: {
                        label: 'Monthly Revenue',
                        format: 'currency',
                        formatOptions: { currency: 'USD' },
                        showTrend: true,
                        size: 'md',
                        icon: 'dollar-sign',
                      },
                      bindings: {
                        value: '{{datasources.metrics.data.revenue}}',
                        trend: '{{datasources.metrics.data.revenueTrend}}',
                      },
                      events: {
                        onClick: { actionId: 'showRevenueDetails' },
                      },
                    },
                    {
                      id: 'kpi-tasks',
                      type: 'KPI',
                      layoutProps: { span: 3 },
                      props: {
                        label: 'Active Tasks',
                        format: 'number',
                        showTrend: true,
                        size: 'md',
                        icon: 'check-circle',
                      },
                      bindings: {
                        value: '{{datasources.metrics.data.activeTasks}}',
                        trend: '{{datasources.metrics.data.tasksTrend}}',
                      },
                    },
                    {
                      id: 'kpi-conversion',
                      type: 'KPI',
                      layoutProps: { span: 3 },
                      props: {
                        label: 'Conversion Rate',
                        format: 'percent',
                        showTrend: true,
                        size: 'md',
                        icon: 'trending-up',
                      },
                      bindings: {
                        value: '{{datasources.metrics.data.conversionRate}}',
                        trend: '{{datasources.metrics.data.conversionTrend}}',
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'activity-section',
              type: 'Section',
              props: {
                title: 'Recent Activity',
                bordered: true,
                padding: 'md',
              },
              children: [
                {
                  id: 'activity-table',
                  type: 'Table',
                  props: {
                    columns: [
                      { id: 'user', label: 'User', field: 'userName', sortable: true },
                      { id: 'action', label: 'Action', field: 'action', sortable: true },
                      {
                        id: 'timestamp',
                        label: 'Time',
                        field: 'timestamp',
                        format: 'date',
                        sortable: true,
                      },
                      { id: 'status', label: 'Status', field: 'status' },
                    ],
                    rowKey: 'id',
                    pagination: {
                      enabled: true,
                      pageSize: 10,
                    },
                    sorting: {
                      enabled: true,
                      defaultSort: {
                        field: 'timestamp',
                        direction: 'desc',
                      },
                    },
                    emptyMessage: 'No recent activity',
                  },
                  bindings: {
                    data: '{{datasources.recentActivity.data}}',
                  },
                },
              ],
            },
          ],
        },
      ],
      datasources: [
        {
          id: 'metrics',
          type: 'http',
          config: {
            url: '/api/dashboard/metrics',
            method: 'GET',
            autoLoad: true,
          },
        },
        {
          id: 'recentActivity',
          type: 'http',
          config: {
            url: '/api/dashboard/recent-activity',
            method: 'GET',
            autoLoad: true,
          },
        },
      ],
      actions: [
        {
          id: 'showUserDetails',
          type: 'navigate',
          params: {
            path: '/users',
          },
        },
        {
          id: 'showRevenueDetails',
          type: 'navigate',
          params: {
            path: '/reports/revenue',
          },
        },
      ],
    },
    tenantId: 'tenant-001',
    permissions: ['dashboard.view'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createPageConfig(enhancedDashboardConfig);

  // Profile page configuration
  const profilePageConfig: PageConfig = {
    id: randomUUID(),
    pageId: 'profile',
    version: '1.0.0',
    config: {
      pageId: 'profile',
      schemaVersion: '1.0',
      title: 'User Profile',
      widgets: [
        {
          id: 'page',
          type: 'Page',
          props: {
            title: 'My Profile',
            padding: 'md',
          },
          children: [
            {
              id: 'profile-section',
              type: 'Section',
              props: {
                title: 'Profile Information',
                bordered: false,
                padding: 'md',
              },
              children: [
                {
                  id: 'profile-card',
                  type: 'Card',
                  props: {
                    title: 'Edit Profile',
                    elevation: 'md',
                    padding: 'lg',
                  },
                  children: [
                    {
                      id: 'profile-grid',
                      type: 'Grid',
                      props: {
                        columns: 12,
                        gap: 'md',
                      },
                      children: [
                        {
                          id: 'name-input',
                          type: 'TextInput',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Full Name',
                            placeholder: 'Enter your full name',
                            required: true,
                            icon: 'user',
                            iconPosition: 'start',
                          },
                          bindings: {
                            value: '{{datasources.userProfile.data.name}}',
                          },
                          events: {
                            onChange: { actionId: 'updateProfileField' },
                          },
                        },
                        {
                          id: 'email-input',
                          type: 'TextInput',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Email Address',
                            type: 'email',
                            placeholder: 'your.email@example.com',
                            required: true,
                            icon: 'mail',
                            iconPosition: 'start',
                          },
                          bindings: {
                            value: '{{datasources.userProfile.data.email}}',
                          },
                          events: {
                            onChange: { actionId: 'updateProfileField' },
                          },
                        },
                        {
                          id: 'phone-input',
                          type: 'TextInput',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Phone Number',
                            type: 'tel',
                            placeholder: '+1 (555) 123-4567',
                            icon: 'phone',
                            iconPosition: 'start',
                          },
                          bindings: {
                            value: '{{datasources.userProfile.data.phone}}',
                          },
                          events: {
                            onChange: { actionId: 'updateProfileField' },
                          },
                        },
                        {
                          id: 'timezone-select',
                          type: 'Select',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Timezone',
                            placeholder: 'Select your timezone',
                            searchable: true,
                            options: [
                              { value: 'America/New_York', label: 'Eastern Time (ET)' },
                              { value: 'America/Chicago', label: 'Central Time (CT)' },
                              { value: 'America/Denver', label: 'Mountain Time (MT)' },
                              { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                              { value: 'Europe/London', label: 'London (GMT)' },
                              { value: 'Europe/Paris', label: 'Paris (CET)' },
                              { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
                            ],
                          },
                          bindings: {
                            value: '{{datasources.userProfile.data.timezone}}',
                          },
                          events: {
                            onChange: { actionId: 'updateProfileField' },
                          },
                        },
                        {
                          id: 'newsletter-checkbox',
                          type: 'Checkbox',
                          layoutProps: { span: 12 },
                          props: {
                            label: 'Subscribe to newsletter and product updates',
                            helpText:
                              'We will send you occasional updates about new features and improvements.',
                          },
                          bindings: {
                            value: '{{datasources.userProfile.data.newsletter}}',
                          },
                          events: {
                            onChange: { actionId: 'updateProfileField' },
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'actions-section',
              type: 'Section',
              props: {
                padding: 'md',
              },
              children: [
                {
                  id: 'save-button',
                  type: 'Button',
                  props: {
                    label: 'Save Changes',
                    variant: 'primary',
                    size: 'md',
                  },
                  events: {
                    onClick: { actionId: 'saveProfile' },
                  },
                },
              ],
            },
          ],
        },
      ],
      datasources: [
        {
          id: 'userProfile',
          type: 'http',
          config: {
            url: '/api/users/me',
            method: 'GET',
            autoLoad: true,
          },
        },
      ],
      actions: [
        {
          id: 'updateProfileField',
          type: 'updateState',
          params: {
            target: 'userProfile.data',
          },
        },
        {
          id: 'saveProfile',
          type: 'executeAction',
          params: {
            actionId: 'user.updateProfile',
            data: '{{datasources.userProfile.data}}',
          },
          onSuccess: {
            actionId: 'showSuccessToast',
          },
          onError: {
            actionId: 'showErrorToast',
          },
        },
        {
          id: 'showSuccessToast',
          type: 'showToast',
          params: {
            variant: 'success',
            message: 'Profile updated successfully',
            duration: 5000,
          },
        },
        {
          id: 'showErrorToast',
          type: 'showToast',
          params: {
            variant: 'error',
            message: 'Failed to update profile. Please try again.',
            duration: 5000,
          },
        },
      ],
    },
    tenantId: 'tenant-001',
    permissions: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createPageConfig(profilePageConfig);

  // Listings page configuration
  const listingsPageConfig: PageConfig = {
    id: randomUUID(),
    pageId: 'listings',
    version: '1.0.0',
    config: {
      pageId: 'listings',
      schemaVersion: '1.0',
      title: 'Listings',
      widgets: [
        {
          id: 'page',
          type: 'Page',
          props: {
            title: 'Manage Listings',
            padding: 'md',
          },
          children: [
            {
              id: 'listings-section',
              type: 'Section',
              props: {
                title: 'Items',
                bordered: false,
                padding: 'md',
              },
              children: [
                {
                  id: 'toolbar',
                  type: 'Toolbar',
                  props: {
                    actions: [
                      {
                        id: 'add-new',
                        label: 'Add New',
                        icon: 'plus',
                        variant: 'primary',
                        actionId: 'openAddModal',
                      },
                      {
                        id: 'refresh',
                        label: 'Refresh',
                        icon: 'refresh',
                        variant: 'secondary',
                        actionId: 'refreshListings',
                      },
                    ],
                  },
                },
                {
                  id: 'listings-table',
                  type: 'Table',
                  props: {
                    columns: [
                      {
                        id: 'name',
                        label: 'Name',
                        field: 'name',
                        sortable: true,
                      },
                      {
                        id: 'category',
                        label: 'Category',
                        field: 'category',
                        sortable: true,
                      },
                      {
                        id: 'status',
                        label: 'Status',
                        field: 'status',
                        sortable: true,
                      },
                      {
                        id: 'created',
                        label: 'Created',
                        field: 'createdAt',
                        format: 'date',
                        sortable: true,
                      },
                      {
                        id: 'price',
                        label: 'Price',
                        field: 'price',
                        format: 'currency',
                        formatOptions: { currency: 'USD' },
                        align: 'right',
                      },
                    ],
                    rowKey: 'id',
                    selectable: true,
                    multiSelect: true,
                    pagination: {
                      enabled: true,
                      pageSize: 25,
                      serverSide: true,
                    },
                    sorting: {
                      enabled: true,
                      serverSide: true,
                      defaultSort: {
                        field: 'createdAt',
                        direction: 'desc',
                      },
                    },
                    filtering: {
                      enabled: true,
                      serverSide: true,
                    },
                    rowActions: [
                      {
                        id: 'view',
                        label: 'View',
                        icon: 'eye',
                        actionId: 'viewItem',
                      },
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: 'edit',
                        actionId: 'editItem',
                      },
                      {
                        id: 'delete',
                        label: 'Delete',
                        icon: 'trash',
                        actionId: 'deleteItem',
                      },
                    ],
                    bulkActions: [
                      {
                        id: 'bulk-delete',
                        label: 'Delete Selected',
                        actionId: 'bulkDeleteItems',
                      },
                    ],
                    emptyMessage: 'No items found. Create your first item to get started.',
                  },
                  bindings: {
                    data: '{{datasources.items.data.items}}',
                    pagination: '{{datasources.items.data.pagination}}',
                    selection: '{{state.selectedItems}}',
                  },
                  events: {
                    onRowAction: { actionId: 'handleRowAction' },
                    onBulkAction: { actionId: 'handleBulkAction' },
                    onPageChange: { actionId: 'loadItemsPage' },
                    onSortChange: { actionId: 'sortItems' },
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'add-edit-modal',
          type: 'Modal',
          props: {
            title: '{{state.modalMode === "add" ? "Add New Item" : "Edit Item"}}',
            size: 'md',
            closable: true,
            closeOnBackdrop: false,
            showFooter: true,
            actions: [
              {
                id: 'cancel',
                label: 'Cancel',
                variant: 'secondary',
                actionId: 'closeModal',
              },
              {
                id: 'save',
                label: 'Save',
                variant: 'primary',
                actionId: 'saveItem',
              },
            ],
          },
          bindings: {
            open: '{{state.modalOpen}}',
          },
          events: {
            onClose: { actionId: 'closeModal' },
            onActionClick: { actionId: 'handleModalAction' },
          },
          children: [
            {
              id: 'modal-form-grid',
              type: 'Grid',
              props: {
                columns: 12,
                gap: 'md',
              },
              children: [
                {
                  id: 'item-name',
                  type: 'TextInput',
                  layoutProps: { span: 12 },
                  props: {
                    label: 'Item Name',
                    placeholder: 'Enter item name',
                    required: true,
                  },
                  bindings: {
                    value: '{{state.currentItem.name}}',
                  },
                },
                {
                  id: 'item-category',
                  type: 'Select',
                  layoutProps: { span: 6 },
                  props: {
                    label: 'Category',
                    placeholder: 'Select category',
                    required: true,
                    options: [
                      { value: 'electronics', label: 'Electronics' },
                      { value: 'clothing', label: 'Clothing' },
                      { value: 'books', label: 'Books' },
                      { value: 'home', label: 'Home & Garden' },
                      { value: 'sports', label: 'Sports & Outdoors' },
                    ],
                  },
                  bindings: {
                    value: '{{state.currentItem.category}}',
                  },
                },
                {
                  id: 'item-price',
                  type: 'TextInput',
                  layoutProps: { span: 6 },
                  props: {
                    label: 'Price',
                    type: 'number',
                    placeholder: '0.00',
                    required: true,
                    icon: 'dollar-sign',
                    iconPosition: 'start',
                  },
                  bindings: {
                    value: '{{state.currentItem.price}}',
                  },
                },
                {
                  id: 'item-status',
                  type: 'Select',
                  layoutProps: { span: 12 },
                  props: {
                    label: 'Status',
                    required: true,
                    options: [
                      { value: 'active', label: 'Active' },
                      { value: 'draft', label: 'Draft' },
                      { value: 'archived', label: 'Archived' },
                    ],
                  },
                  bindings: {
                    value: '{{state.currentItem.status}}',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'delete-confirm-modal',
          type: 'Modal',
          props: {
            title: 'Confirm Delete',
            size: 'sm',
            closable: true,
            actions: [
              {
                id: 'cancel',
                label: 'Cancel',
                variant: 'secondary',
                actionId: 'closeDeleteModal',
              },
              {
                id: 'confirm',
                label: 'Delete',
                variant: 'primary',
                actionId: 'confirmDelete',
              },
            ],
          },
          bindings: {
            open: '{{state.deleteModalOpen}}',
          },
          events: {
            onClose: { actionId: 'closeDeleteModal' },
          },
          children: [
            {
              id: 'delete-message',
              type: 'Text',
              props: {
                content: 'Are you sure you want to delete this item? This action cannot be undone.',
              },
            },
          ],
        },
      ],
      datasources: [
        {
          id: 'items',
          type: 'http',
          config: {
            url: '/api/items',
            method: 'GET',
            autoLoad: true,
            params: {
              page: '{{state.currentPage || 1}}',
              pageSize: 25,
              sort: '{{state.sortField}}',
              sortDirection: '{{state.sortDirection}}',
            },
          },
        },
      ],
      actions: [
        {
          id: 'openAddModal',
          type: 'updateState',
          params: {
            modalOpen: true,
            modalMode: 'add',
            currentItem: {},
          },
        },
        {
          id: 'editItem',
          type: 'updateState',
          params: {
            modalOpen: true,
            modalMode: 'edit',
            currentItem: '{{event.data}}',
          },
        },
        {
          id: 'deleteItem',
          type: 'updateState',
          params: {
            deleteModalOpen: true,
            itemToDelete: '{{event.data}}',
          },
        },
        {
          id: 'closeModal',
          type: 'updateState',
          params: {
            modalOpen: false,
            currentItem: {},
          },
        },
        {
          id: 'closeDeleteModal',
          type: 'updateState',
          params: {
            deleteModalOpen: false,
            itemToDelete: null,
          },
        },
        {
          id: 'saveItem',
          type: 'executeAction',
          params: {
            actionId: '{{state.modalMode === "add" ? "item.create" : "item.update"}}',
            data: '{{state.currentItem}}',
          },
          onSuccess: {
            actionId: 'afterSave',
          },
        },
        {
          id: 'confirmDelete',
          type: 'executeAction',
          params: {
            actionId: 'item.delete',
            data: { id: '{{state.itemToDelete.id}}' },
          },
          onSuccess: {
            actionId: 'afterDelete',
          },
        },
        {
          id: 'afterSave',
          type: 'chain',
          params: {
            actions: [
              { actionId: 'closeModal' },
              { actionId: 'refreshListings' },
              {
                actionId: 'showToast',
                params: {
                  variant: 'success',
                  message: 'Item saved successfully',
                },
              },
            ],
          },
        },
        {
          id: 'afterDelete',
          type: 'chain',
          params: {
            actions: [
              { actionId: 'closeDeleteModal' },
              { actionId: 'refreshListings' },
              {
                actionId: 'showToast',
                params: {
                  variant: 'success',
                  message: 'Item deleted successfully',
                },
              },
            ],
          },
        },
        {
          id: 'refreshListings',
          type: 'refreshDatasource',
          params: {
            datasourceId: 'items',
          },
        },
        {
          id: 'loadItemsPage',
          type: 'updateState',
          params: {
            currentPage: '{{event.page}}',
          },
          then: {
            actionId: 'refreshListings',
          },
        },
        {
          id: 'handleRowAction',
          type: 'dispatch',
          params: {
            actionMap: {
              view: 'viewItem',
              edit: 'editItem',
              delete: 'deleteItem',
            },
          },
        },
        {
          id: 'handleBulkAction',
          type: 'dispatch',
          params: {
            actionMap: {
              'bulk-delete': 'bulkDeleteItems',
            },
          },
        },
      ],
    },
    tenantId: 'tenant-001',
    permissions: ['items.view'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createPageConfig(listingsPageConfig);

  console.log('✅ UI configurations seeded successfully');
}
