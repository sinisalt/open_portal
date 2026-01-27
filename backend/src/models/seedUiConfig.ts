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
          onSuccess: {
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

  // ========================================
  // NEW DEMO PAGE CONFIGURATIONS (Issue #050)
  // ========================================

  // 1. HOMEPAGE - Public landing page with Hero, Features, Pricing
  const homepageConfig: PageConfig = {
    id: randomUUID(),
    pageId: 'homepage',
    version: '1.0.0',
    config: {
      pageId: 'homepage',
      schemaVersion: '1.0',
      title: 'Welcome to OpenPortal',
      widgets: [
        {
          id: 'page',
          type: 'Page',
          props: {
            title: 'OpenPortal - Configuration-Driven Business UI Platform',
            padding: 'none',
          },
          children: [
            // Hero Section
            {
              id: 'hero-section',
              type: 'Hero',
              props: {
                backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920',
                title: 'Build Dynamic UIs with Configuration',
                subtitle: 'OpenPortal empowers you to create powerful business applications without coding. Define your UI with JSON, manage multi-tenant deployments, and scale effortlessly.',
                height: 'lg',
                textAlign: 'center',
                overlay: {
                  color: '#000000',
                  opacity: 0.5,
                },
                ctaButtons: [
                  {
                    id: 'get-started',
                    text: 'Get Started',
                    variant: 'default',
                    actionId: 'navigateToDashboard',
                  },
                  {
                    id: 'learn-more',
                    text: 'Learn More',
                    variant: 'outline',
                    actionId: 'navigateToAbout',
                  },
                ],
              },
            },
            // Features Section
            {
              id: 'features-section',
              type: 'Section',
              props: {
                title: 'Why OpenPortal?',
                subtitle: 'Everything you need to build modern business applications',
                padding: 'xl',
                bordered: false,
              },
              children: [
                {
                  id: 'features-grid',
                  type: 'Grid',
                  props: {
                    columns: 12,
                    gap: 'lg',
                  },
                  children: [
                    {
                      id: 'feature-config',
                      type: 'Card',
                      layoutProps: { span: 4 },
                      props: {
                        title: 'Configuration-Driven',
                        description: 'Define your entire UI with JSON configurations. No frontend changes needed for new features.',
                        elevation: 'md',
                        padding: 'lg',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'feature-config-icon',
                          type: 'Text',
                          props: {
                            content: '⚙️',
                            variant: 'heading',
                            align: 'center',
                          },
                        },
                      ],
                    },
                    {
                      id: 'feature-multitenant',
                      type: 'Card',
                      layoutProps: { span: 4 },
                      props: {
                        title: 'Multi-Tenant Ready',
                        description: 'Support multiple tenants with custom branding, themes, and configurations out of the box.',
                        elevation: 'md',
                        padding: 'lg',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'feature-multitenant-icon',
                          type: 'Text',
                          props: {
                            content: '🏢',
                            variant: 'heading',
                            align: 'center',
                          },
                        },
                      ],
                    },
                    {
                      id: 'feature-widgets',
                      type: 'Card',
                      layoutProps: { span: 4 },
                      props: {
                        title: 'Rich Widget Library',
                        description: '28+ generic, reusable widgets. Build everything from dashboards to complex forms.',
                        elevation: 'md',
                        padding: 'lg',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'feature-widgets-icon',
                          type: 'Text',
                          props: {
                            content: '🧩',
                            variant: 'heading',
                            align: 'center',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // Pricing Section
            {
              id: 'pricing-section',
              type: 'Section',
              props: {
                title: 'Simple, Transparent Pricing',
                subtitle: 'Choose the plan that fits your needs',
                padding: 'xl',
                bordered: false,
              },
              children: [
                {
                  id: 'pricing-grid',
                  type: 'Grid',
                  props: {
                    columns: 12,
                    gap: 'lg',
                  },
                  children: [
                    {
                      id: 'pricing-starter',
                      type: 'Card',
                      layoutProps: { span: 4 },
                      props: {
                        title: 'Starter',
                        elevation: 'md',
                        padding: 'lg',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'price-starter-amount',
                          type: 'Text',
                          props: {
                            content: '$29/month',
                            variant: 'heading',
                            align: 'center',
                            color: 'primary',
                          },
                        },
                        {
                          id: 'price-starter-features',
                          type: 'Text',
                          props: {
                            content: '• Up to 5 users\n• Basic widgets\n• Email support\n• 1 tenant',
                            variant: 'body',
                          },
                        },
                        {
                          id: 'price-starter-badge',
                          type: 'Badge',
                          props: {
                            label: 'Perfect for Small Teams',
                            variant: 'secondary',
                          },
                        },
                      ],
                    },
                    {
                      id: 'pricing-pro',
                      type: 'Card',
                      layoutProps: { span: 4 },
                      props: {
                        title: 'Professional',
                        elevation: 'lg',
                        padding: 'lg',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'price-pro-amount',
                          type: 'Text',
                          props: {
                            content: '$99/month',
                            variant: 'heading',
                            align: 'center',
                            color: 'primary',
                          },
                        },
                        {
                          id: 'price-pro-features',
                          type: 'Text',
                          props: {
                            content: '• Up to 50 users\n• All widgets\n• Priority support\n• 10 tenants\n• Custom branding',
                            variant: 'body',
                          },
                        },
                        {
                          id: 'price-pro-badge',
                          type: 'Badge',
                          props: {
                            label: 'Most Popular',
                            variant: 'success',
                          },
                        },
                      ],
                    },
                    {
                      id: 'pricing-enterprise',
                      type: 'Card',
                      layoutProps: { span: 4 },
                      props: {
                        title: 'Enterprise',
                        elevation: 'md',
                        padding: 'lg',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'price-enterprise-amount',
                          type: 'Text',
                          props: {
                            content: 'Contact Us',
                            variant: 'heading',
                            align: 'center',
                            color: 'primary',
                          },
                        },
                        {
                          id: 'price-enterprise-features',
                          type: 'Text',
                          props: {
                            content: '• Unlimited users\n• All widgets + custom\n• 24/7 support\n• Unlimited tenants\n• White-label',
                            variant: 'body',
                          },
                        },
                        {
                          id: 'price-enterprise-badge',
                          type: 'Badge',
                          props: {
                            label: 'Maximum Flexibility',
                            variant: 'default',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // CTA Section
            {
              id: 'cta-section',
              type: 'Section',
              props: {
                padding: 'xl',
                bordered: false,
              },
              children: [
                {
                  id: 'cta-text',
                  type: 'Text',
                  props: {
                    content: 'Ready to transform your business applications?',
                    variant: 'heading',
                    align: 'center',
                  },
                },
                {
                  id: 'cta-buttons',
                  type: 'ButtonGroup',
                  props: {
                    orientation: 'horizontal',
                    gap: 'md',
                    justify: 'center',
                    buttons: [
                      {
                        id: 'cta-start',
                        label: 'Start Free Trial',
                        variant: 'default',
                        actionId: 'navigateToSignup',
                      },
                      {
                        id: 'cta-demo',
                        label: 'Schedule Demo',
                        variant: 'outline',
                        actionId: 'navigateToContact',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
      actions: [
        {
          id: 'navigateToDashboard',
          type: 'navigate',
          params: { path: '/dashboard' },
        },
        {
          id: 'navigateToAbout',
          type: 'navigate',
          params: { path: '/about' },
        },
        {
          id: 'navigateToSignup',
          type: 'navigate',
          params: { path: '/signup' },
        },
        {
          id: 'navigateToContact',
          type: 'navigate',
          params: { path: '/contact' },
        },
      ],
    },
    tenantId: 'tenant-001',
    permissions: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createPageConfig(homepageConfig);

  // Add route for homepage
  db.createRouteConfig({
    id: randomUUID(),
    pattern: '/home',
    pageId: 'homepage',
    permissions: [],
    exact: true,
    tenantId: 'tenant-001',
    priority: 0,
    metadata: { title: 'Home' },
    createdAt: new Date(),
  });

  // 2. ABOUT US PAGE - Content-rich page with Text, Images, Cards
  const aboutPageConfig: PageConfig = {
    id: randomUUID(),
    pageId: 'about',
    version: '1.0.0',
    config: {
      pageId: 'about',
      schemaVersion: '1.0',
      title: 'About OpenPortal',
      widgets: [
        {
          id: 'page',
          type: 'Page',
          props: {
            title: 'About Us',
            padding: 'md',
          },
          children: [
            // Header Section
            {
              id: 'about-header',
              type: 'Section',
              props: {
                padding: 'lg',
                bordered: false,
              },
              children: [
                {
                  id: 'about-title',
                  type: 'Text',
                  props: {
                    content: 'About OpenPortal',
                    variant: 'heading',
                    align: 'center',
                  },
                },
                {
                  id: 'about-subtitle',
                  type: 'Text',
                  props: {
                    content: 'Building the future of configuration-driven business applications',
                    variant: 'subheading',
                    align: 'center',
                    color: 'muted',
                  },
                },
              ],
            },
            // Mission Section with Image
            {
              id: 'mission-section',
              type: 'Section',
              props: {
                title: 'Our Mission',
                padding: 'lg',
                bordered: true,
              },
              children: [
                {
                  id: 'mission-grid',
                  type: 'Grid',
                  props: {
                    columns: 12,
                    gap: 'lg',
                  },
                  children: [
                    {
                      id: 'mission-image',
                      type: 'Image',
                      layoutProps: { span: 5 },
                      props: {
                        src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
                        alt: 'Team collaboration',
                        aspectRatio: '4:3',
                        fit: 'cover',
                        rounded: 'md',
                        loading: 'lazy',
                      },
                    },
                    {
                      id: 'mission-content',
                      type: 'Card',
                      layoutProps: { span: 7 },
                      props: {
                        elevation: 'none',
                        padding: 'md',
                      },
                      children: [
                        {
                          id: 'mission-text',
                          type: 'Text',
                          props: {
                            content: 'At OpenPortal, we believe that building business applications should be fast, flexible, and accessible to everyone. Our mission is to empower organizations to create powerful, scalable applications without the complexity of traditional development.\n\nWe achieve this through a revolutionary configuration-driven approach where the entire user interface is defined by JSON configurations from the backend. This means:\n\n• **Zero frontend changes** for new features\n• **Rapid deployment** of new business requirements\n• **Multi-tenant architecture** out of the box\n• **Consistent UI patterns** across your organization',
                            variant: 'body',
                            markdown: true,
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // Values Section
            {
              id: 'values-section',
              type: 'Section',
              props: {
                title: 'Our Core Values',
                padding: 'lg',
                bordered: false,
              },
              children: [
                {
                  id: 'values-grid',
                  type: 'Grid',
                  props: {
                    columns: 12,
                    gap: 'md',
                  },
                  children: [
                    {
                      id: 'value-innovation',
                      type: 'Card',
                      layoutProps: { span: 3 },
                      props: {
                        elevation: 'md',
                        padding: 'lg',
                      },
                      children: [
                        {
                          id: 'value-innovation-icon',
                          type: 'Text',
                          props: {
                            content: '💡',
                            variant: 'heading',
                            align: 'center',
                          },
                        },
                        {
                          id: 'value-innovation-title',
                          type: 'Text',
                          props: {
                            content: 'Innovation',
                            variant: 'subheading',
                            align: 'center',
                          },
                        },
                        {
                          id: 'value-innovation-desc',
                          type: 'Text',
                          props: {
                            content: 'Continuously pushing boundaries in application development',
                            variant: 'body',
                            align: 'center',
                            color: 'muted',
                          },
                        },
                      ],
                    },
                    {
                      id: 'value-simplicity',
                      type: 'Card',
                      layoutProps: { span: 3 },
                      props: {
                        elevation: 'md',
                        padding: 'lg',
                      },
                      children: [
                        {
                          id: 'value-simplicity-icon',
                          type: 'Text',
                          props: {
                            content: '✨',
                            variant: 'heading',
                            align: 'center',
                          },
                        },
                        {
                          id: 'value-simplicity-title',
                          type: 'Text',
                          props: {
                            content: 'Simplicity',
                            variant: 'subheading',
                            align: 'center',
                          },
                        },
                        {
                          id: 'value-simplicity-desc',
                          type: 'Text',
                          props: {
                            content: 'Making complex systems simple and intuitive',
                            variant: 'body',
                            align: 'center',
                            color: 'muted',
                          },
                        },
                      ],
                    },
                    {
                      id: 'value-quality',
                      type: 'Card',
                      layoutProps: { span: 3 },
                      props: {
                        elevation: 'md',
                        padding: 'lg',
                      },
                      children: [
                        {
                          id: 'value-quality-icon',
                          type: 'Text',
                          props: {
                            content: '⭐',
                            variant: 'heading',
                            align: 'center',
                          },
                        },
                        {
                          id: 'value-quality-title',
                          type: 'Text',
                          props: {
                            content: 'Quality',
                            variant: 'subheading',
                            align: 'center',
                          },
                        },
                        {
                          id: 'value-quality-desc',
                          type: 'Text',
                          props: {
                            content: 'Delivering excellence in every line of code',
                            variant: 'body',
                            align: 'center',
                            color: 'muted',
                          },
                        },
                      ],
                    },
                    {
                      id: 'value-collaboration',
                      type: 'Card',
                      layoutProps: { span: 3 },
                      props: {
                        elevation: 'md',
                        padding: 'lg',
                      },
                      children: [
                        {
                          id: 'value-collaboration-icon',
                          type: 'Text',
                          props: {
                            content: '🤝',
                            variant: 'heading',
                            align: 'center',
                          },
                        },
                        {
                          id: 'value-collaboration-title',
                          type: 'Text',
                          props: {
                            content: 'Collaboration',
                            variant: 'subheading',
                            align: 'center',
                          },
                        },
                        {
                          id: 'value-collaboration-desc',
                          type: 'Text',
                          props: {
                            content: 'Working together to achieve greatness',
                            variant: 'body',
                            align: 'center',
                            color: 'muted',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // Technology Section
            {
              id: 'tech-section',
              type: 'Section',
              props: {
                title: 'Built with Modern Technology',
                padding: 'lg',
                bordered: false,
              },
              children: [
                {
                  id: 'tech-content',
                  type: 'Card',
                  props: {
                    elevation: 'md',
                    padding: 'lg',
                  },
                  children: [
                    {
                      id: 'tech-text',
                      type: 'Text',
                      props: {
                        content: 'OpenPortal is built on a cutting-edge technology stack:\n\n• **Frontend**: React 19 + TypeScript + Vite\n• **UI Components**: shadcn/ui + Tailwind CSS v4\n• **Routing**: TanStack Router\n• **State Management**: TanStack Query + Store\n• **Backend**: Node.js + Express + TypeScript\n• **Database**: SQLite (easily swappable)\n• **Real-time**: WebSocket support\n• **Testing**: Jest + Playwright\n\nEvery component is accessible (WCAG 2.1 AA), performant, and production-ready.',
                        variant: 'body',
                        markdown: true,
                      },
                    },
                  ],
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

  db.createPageConfig(aboutPageConfig);

  // Add route for about page
  db.createRouteConfig({
    id: randomUUID(),
    pattern: '/about',
    pageId: 'about',
    permissions: [],
    exact: true,
    tenantId: 'tenant-001',
    priority: 0,
    metadata: { title: 'About Us' },
    createdAt: new Date(),
  });

  // 3. TEAM PAGE - Team members displayed with Cards, Images, Badges
  const teamPageConfig: PageConfig = {
    id: randomUUID(),
    pageId: 'team',
    version: '1.0.0',
    config: {
      pageId: 'team',
      schemaVersion: '1.0',
      title: 'Our Team',
      widgets: [
        {
          id: 'page',
          type: 'Page',
          props: {
            title: 'Meet Our Team',
            padding: 'md',
          },
          children: [
            // Header Section
            {
              id: 'team-header',
              type: 'Section',
              props: {
                padding: 'lg',
                bordered: false,
              },
              children: [
                {
                  id: 'team-title',
                  type: 'Text',
                  props: {
                    content: 'Meet the Team',
                    variant: 'heading',
                    align: 'center',
                  },
                },
                {
                  id: 'team-subtitle',
                  type: 'Text',
                  props: {
                    content: 'The talented people behind OpenPortal',
                    variant: 'subheading',
                    align: 'center',
                    color: 'muted',
                  },
                },
              ],
            },
            // Leadership Section
            {
              id: 'leadership-section',
              type: 'Section',
              props: {
                title: 'Leadership Team',
                padding: 'lg',
                bordered: false,
              },
              children: [
                {
                  id: 'leadership-grid',
                  type: 'Grid',
                  props: {
                    columns: 12,
                    gap: 'lg',
                  },
                  children: [
                    {
                      id: 'member-ceo',
                      type: 'Card',
                      layoutProps: { span: 4 },
                      props: {
                        elevation: 'md',
                        padding: 'lg',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'member-ceo-image',
                          type: 'Image',
                          props: {
                            src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                            alt: 'John Smith - CEO',
                            aspectRatio: '1:1',
                            fit: 'cover',
                            rounded: 'full',
                          },
                        },
                        {
                          id: 'member-ceo-name',
                          type: 'Text',
                          props: {
                            content: 'John Smith',
                            variant: 'subheading',
                            align: 'center',
                            weight: 'semibold',
                          },
                        },
                        {
                          id: 'member-ceo-role',
                          type: 'Badge',
                          props: {
                            label: 'CEO & Founder',
                            variant: 'default',
                          },
                        },
                        {
                          id: 'member-ceo-bio',
                          type: 'Text',
                          props: {
                            content: 'Visionary leader with 15+ years in enterprise software. Passionate about making technology accessible to everyone.',
                            variant: 'body',
                            align: 'center',
                            color: 'muted',
                          },
                        },
                        {
                          id: 'member-ceo-social',
                          type: 'ButtonGroup',
                          props: {
                            orientation: 'horizontal',
                            gap: 'sm',
                            justify: 'center',
                            buttons: [
                              {
                                id: 'ceo-linkedin',
                                icon: 'linkedin',
                                variant: 'ghost',
                                href: 'https://linkedin.com',
                              },
                              {
                                id: 'ceo-twitter',
                                icon: 'twitter',
                                variant: 'ghost',
                                href: 'https://twitter.com',
                              },
                              {
                                id: 'ceo-github',
                                icon: 'github',
                                variant: 'ghost',
                                href: 'https://github.com',
                              },
                            ],
                          },
                        },
                      ],
                    },
                    {
                      id: 'member-cto',
                      type: 'Card',
                      layoutProps: { span: 4 },
                      props: {
                        elevation: 'md',
                        padding: 'lg',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'member-cto-image',
                          type: 'Image',
                          props: {
                            src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                            alt: 'Sarah Johnson - CTO',
                            aspectRatio: '1:1',
                            fit: 'cover',
                            rounded: 'full',
                          },
                        },
                        {
                          id: 'member-cto-name',
                          type: 'Text',
                          props: {
                            content: 'Sarah Johnson',
                            variant: 'subheading',
                            align: 'center',
                            weight: 'semibold',
                          },
                        },
                        {
                          id: 'member-cto-role',
                          type: 'Badge',
                          props: {
                            label: 'CTO',
                            variant: 'success',
                          },
                        },
                        {
                          id: 'member-cto-bio',
                          type: 'Text',
                          props: {
                            content: 'Technical architect with expertise in scalable systems. Leads our engineering team to build world-class software.',
                            variant: 'body',
                            align: 'center',
                            color: 'muted',
                          },
                        },
                        {
                          id: 'member-cto-social',
                          type: 'ButtonGroup',
                          props: {
                            orientation: 'horizontal',
                            gap: 'sm',
                            justify: 'center',
                            buttons: [
                              {
                                id: 'cto-linkedin',
                                icon: 'linkedin',
                                variant: 'ghost',
                                href: 'https://linkedin.com',
                              },
                              {
                                id: 'cto-twitter',
                                icon: 'twitter',
                                variant: 'ghost',
                                href: 'https://twitter.com',
                              },
                              {
                                id: 'cto-github',
                                icon: 'github',
                                variant: 'ghost',
                                href: 'https://github.com',
                              },
                            ],
                          },
                        },
                      ],
                    },
                    {
                      id: 'member-coo',
                      type: 'Card',
                      layoutProps: { span: 4 },
                      props: {
                        elevation: 'md',
                        padding: 'lg',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'member-coo-image',
                          type: 'Image',
                          props: {
                            src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                            alt: 'Michael Chen - COO',
                            aspectRatio: '1:1',
                            fit: 'cover',
                            rounded: 'full',
                          },
                        },
                        {
                          id: 'member-coo-name',
                          type: 'Text',
                          props: {
                            content: 'Michael Chen',
                            variant: 'subheading',
                            align: 'center',
                            weight: 'semibold',
                          },
                        },
                        {
                          id: 'member-coo-role',
                          type: 'Badge',
                          props: {
                            label: 'COO',
                            variant: 'secondary',
                          },
                        },
                        {
                          id: 'member-coo-bio',
                          type: 'Text',
                          props: {
                            content: 'Operations expert focused on efficiency and growth. Ensures our platform runs smoothly at scale.',
                            variant: 'body',
                            align: 'center',
                            color: 'muted',
                          },
                        },
                        {
                          id: 'member-coo-social',
                          type: 'ButtonGroup',
                          props: {
                            orientation: 'horizontal',
                            gap: 'sm',
                            justify: 'center',
                            buttons: [
                              {
                                id: 'coo-linkedin',
                                icon: 'linkedin',
                                variant: 'ghost',
                                href: 'https://linkedin.com',
                              },
                              {
                                id: 'coo-twitter',
                                icon: 'twitter',
                                variant: 'ghost',
                                href: 'https://twitter.com',
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // Engineering Team Section
            {
              id: 'engineering-section',
              type: 'Section',
              props: {
                title: 'Engineering Team',
                padding: 'lg',
                bordered: false,
              },
              children: [
                {
                  id: 'engineering-grid',
                  type: 'Grid',
                  props: {
                    columns: 12,
                    gap: 'md',
                  },
                  children: [
                    {
                      id: 'member-eng1',
                      type: 'Card',
                      layoutProps: { span: 3 },
                      props: {
                        elevation: 'sm',
                        padding: 'md',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'member-eng1-image',
                          type: 'Image',
                          props: {
                            src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
                            alt: 'Emily Rodriguez',
                            aspectRatio: '1:1',
                            fit: 'cover',
                            rounded: 'full',
                          },
                        },
                        {
                          id: 'member-eng1-name',
                          type: 'Text',
                          props: {
                            content: 'Emily Rodriguez',
                            variant: 'body',
                            align: 'center',
                            weight: 'semibold',
                          },
                        },
                        {
                          id: 'member-eng1-role',
                          type: 'Badge',
                          props: {
                            label: 'Senior Engineer',
                            variant: 'outline',
                            size: 'sm',
                          },
                        },
                      ],
                    },
                    {
                      id: 'member-eng2',
                      type: 'Card',
                      layoutProps: { span: 3 },
                      props: {
                        elevation: 'sm',
                        padding: 'md',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'member-eng2-image',
                          type: 'Image',
                          props: {
                            src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
                            alt: 'David Park',
                            aspectRatio: '1:1',
                            fit: 'cover',
                            rounded: 'full',
                          },
                        },
                        {
                          id: 'member-eng2-name',
                          type: 'Text',
                          props: {
                            content: 'David Park',
                            variant: 'body',
                            align: 'center',
                            weight: 'semibold',
                          },
                        },
                        {
                          id: 'member-eng2-role',
                          type: 'Badge',
                          props: {
                            label: 'Frontend Lead',
                            variant: 'outline',
                            size: 'sm',
                          },
                        },
                      ],
                    },
                    {
                      id: 'member-eng3',
                      type: 'Card',
                      layoutProps: { span: 3 },
                      props: {
                        elevation: 'sm',
                        padding: 'md',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'member-eng3-image',
                          type: 'Image',
                          props: {
                            src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
                            alt: 'Lisa Wang',
                            aspectRatio: '1:1',
                            fit: 'cover',
                            rounded: 'full',
                          },
                        },
                        {
                          id: 'member-eng3-name',
                          type: 'Text',
                          props: {
                            content: 'Lisa Wang',
                            variant: 'body',
                            align: 'center',
                            weight: 'semibold',
                          },
                        },
                        {
                          id: 'member-eng3-role',
                          type: 'Badge',
                          props: {
                            label: 'Backend Lead',
                            variant: 'outline',
                            size: 'sm',
                          },
                        },
                      ],
                    },
                    {
                      id: 'member-eng4',
                      type: 'Card',
                      layoutProps: { span: 3 },
                      props: {
                        elevation: 'sm',
                        padding: 'md',
                        hoverable: true,
                      },
                      children: [
                        {
                          id: 'member-eng4-image',
                          type: 'Image',
                          props: {
                            src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
                            alt: 'James Wilson',
                            aspectRatio: '1:1',
                            fit: 'cover',
                            rounded: 'full',
                          },
                        },
                        {
                          id: 'member-eng4-name',
                          type: 'Text',
                          props: {
                            content: 'James Wilson',
                            variant: 'body',
                            align: 'center',
                            weight: 'semibold',
                          },
                        },
                        {
                          id: 'member-eng4-role',
                          type: 'Badge',
                          props: {
                            label: 'DevOps',
                            variant: 'outline',
                            size: 'sm',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // Join Us Section
            {
              id: 'join-section',
              type: 'Section',
              props: {
                padding: 'xl',
                bordered: false,
              },
              children: [
                {
                  id: 'join-card',
                  type: 'Card',
                  props: {
                    elevation: 'lg',
                    padding: 'xl',
                  },
                  children: [
                    {
                      id: 'join-title',
                      type: 'Text',
                      props: {
                        content: 'Join Our Team',
                        variant: 'heading',
                        align: 'center',
                      },
                    },
                    {
                      id: 'join-description',
                      type: 'Text',
                      props: {
                        content: 'We are always looking for talented individuals who are passionate about building great software.',
                        variant: 'body',
                        align: 'center',
                        color: 'muted',
                      },
                    },
                    {
                      id: 'join-button',
                      type: 'ButtonGroup',
                      props: {
                        orientation: 'horizontal',
                        gap: 'md',
                        justify: 'center',
                        buttons: [
                          {
                            id: 'view-positions',
                            label: 'View Open Positions',
                            variant: 'default',
                            actionId: 'navigateToCareers',
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      actions: [
        {
          id: 'navigateToCareers',
          type: 'navigate',
          params: { path: '/careers' },
        },
      ],
    },
    tenantId: 'tenant-001',
    permissions: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createPageConfig(teamPageConfig);

  // Add route for team page
  db.createRouteConfig({
    id: randomUUID(),
    pattern: '/team',
    pageId: 'team',
    permissions: [],
    exact: true,
    tenantId: 'tenant-001',
    priority: 0,
    metadata: { title: 'Our Team' },
    createdAt: new Date(),
  });

  // 4. USERS MANAGEMENT PAGE - Table + Modal + Form with all form widgets
  const usersManagementConfig: PageConfig = {
    id: randomUUID(),
    pageId: 'users-management',
    version: '1.0.0',
    config: {
      pageId: 'users-management',
      schemaVersion: '1.0',
      title: 'User Management',
      widgets: [
        {
          id: 'page',
          type: 'Page',
          props: {
            title: 'User Management',
            padding: 'md',
          },
          children: [
            {
              id: 'users-section',
              type: 'Section',
              props: {
                title: 'Users',
                padding: 'md',
                bordered: false,
              },
              children: [
                // Action Buttons
                {
                  id: 'users-actions',
                  type: 'ButtonGroup',
                  props: {
                    orientation: 'horizontal',
                    gap: 'md',
                    buttons: [
                      {
                        id: 'add-user-btn',
                        label: 'Add User',
                        icon: 'plus',
                        variant: 'default',
                        actionId: 'openAddUserModal',
                      },
                      {
                        id: 'refresh-btn',
                        label: 'Refresh',
                        icon: 'refresh-cw',
                        variant: 'outline',
                        actionId: 'refreshUsers',
                      },
                      {
                        id: 'export-btn',
                        label: 'Export',
                        icon: 'download',
                        variant: 'ghost',
                        actionId: 'exportUsers',
                      },
                    ],
                  },
                },
                // Users Table
                {
                  id: 'users-table',
                  type: 'Table',
                  props: {
                    columns: [
                      {
                        id: 'avatar',
                        label: '',
                        field: 'avatar',
                        format: 'image',
                        width: '50px',
                      },
                      {
                        id: 'name',
                        label: 'Name',
                        field: 'name',
                        sortable: true,
                      },
                      {
                        id: 'email',
                        label: 'Email',
                        field: 'email',
                        sortable: true,
                      },
                      {
                        id: 'role',
                        label: 'Role',
                        field: 'role',
                        format: 'badge',
                        sortable: true,
                      },
                      {
                        id: 'status',
                        label: 'Status',
                        field: 'status',
                        format: 'badge',
                      },
                      {
                        id: 'tags',
                        label: 'Tags',
                        field: 'tags',
                        format: 'badges',
                      },
                      {
                        id: 'createdAt',
                        label: 'Created',
                        field: 'createdAt',
                        format: 'date',
                        sortable: true,
                      },
                    ],
                    rowKey: 'id',
                    pagination: {
                      enabled: true,
                      pageSize: 10,
                    },
                    sorting: {
                      enabled: true,
                      defaultSort: {
                        field: 'name',
                        direction: 'asc',
                      },
                    },
                    filtering: {
                      enabled: true,
                    },
                    rowActions: [
                      {
                        id: 'view',
                        label: 'View',
                        icon: 'eye',
                        actionId: 'viewUser',
                      },
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: 'edit',
                        actionId: 'editUser',
                      },
                      {
                        id: 'delete',
                        label: 'Delete',
                        icon: 'trash',
                        variant: 'destructive',
                        actionId: 'deleteUser',
                      },
                    ],
                    selectable: true,
                    bulkActions: [
                      {
                        id: 'bulk-delete',
                        label: 'Delete Selected',
                        icon: 'trash',
                        variant: 'destructive',
                        actionId: 'bulkDeleteUsers',
                      },
                      {
                        id: 'bulk-export',
                        label: 'Export Selected',
                        icon: 'download',
                        actionId: 'bulkExportUsers',
                      },
                    ],
                    emptyMessage: 'No users found',
                  },
                  bindings: {
                    data: '{{datasources.users.data}}',
                    loading: '{{datasources.users.loading}}',
                  },
                  events: {
                    onRowClick: { actionId: 'viewUser' },
                    onPageChange: { actionId: 'loadUsersPage' },
                    onSort: { actionId: 'sortUsers' },
                    onFilter: { actionId: 'filterUsers' },
                  },
                },
              ],
            },
            // Add/Edit User Modal
            {
              id: 'user-modal',
              type: 'Modal',
              props: {
                title: '{{state.modalMode === "add" ? "Add New User" : "Edit User"}}',
                size: 'lg',
              },
              bindings: {
                open: '{{state.userModalOpen}}',
              },
              events: {
                onClose: { actionId: 'closeUserModal' },
              },
              children: [
                {
                  id: 'user-form',
                  type: 'Form',
                  props: {
                    layout: 'vertical',
                  },
                  children: [
                    {
                      id: 'user-form-grid',
                      type: 'Grid',
                      props: {
                        columns: 12,
                        gap: 'md',
                      },
                      children: [
                        // Avatar Upload
                        {
                          id: 'avatar-upload',
                          type: 'FileUpload',
                          layoutProps: { span: 12 },
                          props: {
                            label: 'Profile Picture',
                            accept: 'image/*',
                            maxSize: 5242880, // 5MB
                            maxFiles: 1,
                            preview: true,
                            helperText: 'Upload a profile picture (max 5MB)',
                          },
                          bindings: {
                            value: '{{state.currentUser.avatar}}',
                          },
                          events: {
                            onChange: { actionId: 'updateUserField', params: { field: 'avatar' } },
                          },
                        },
                        // Name
                        {
                          id: 'name-input',
                          type: 'TextInput',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Full Name',
                            placeholder: 'Enter full name',
                            required: true,
                            icon: 'user',
                          },
                          bindings: {
                            value: '{{state.currentUser.name}}',
                          },
                          events: {
                            onChange: { actionId: 'updateUserField', params: { field: 'name' } },
                          },
                        },
                        // Email
                        {
                          id: 'email-input',
                          type: 'TextInput',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Email Address',
                            type: 'email',
                            placeholder: 'user@example.com',
                            required: true,
                            icon: 'mail',
                          },
                          bindings: {
                            value: '{{state.currentUser.email}}',
                          },
                          events: {
                            onChange: { actionId: 'updateUserField', params: { field: 'email' } },
                          },
                        },
                        // Role
                        {
                          id: 'role-select',
                          type: 'Select',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Role',
                            placeholder: 'Select role',
                            required: true,
                            options: [
                              { value: 'admin', label: 'Administrator' },
                              { value: 'editor', label: 'Editor' },
                              { value: 'viewer', label: 'Viewer' },
                              { value: 'user', label: 'User' },
                            ],
                          },
                          bindings: {
                            value: '{{state.currentUser.role}}',
                          },
                          events: {
                            onChange: { actionId: 'updateUserField', params: { field: 'role' } },
                          },
                        },
                        // Status
                        {
                          id: 'status-select',
                          type: 'Select',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Status',
                            placeholder: 'Select status',
                            required: true,
                            options: [
                              { value: 'active', label: 'Active' },
                              { value: 'inactive', label: 'Inactive' },
                              { value: 'pending', label: 'Pending' },
                            ],
                          },
                          bindings: {
                            value: '{{state.currentUser.status}}',
                          },
                          events: {
                            onChange: { actionId: 'updateUserField', params: { field: 'status' } },
                          },
                        },
                        // Tags Input (NEW WIDGET)
                        {
                          id: 'tags-input',
                          type: 'TagInput',
                          layoutProps: { span: 12 },
                          props: {
                            label: 'Tags',
                            placeholder: 'Add tags (press Enter)',
                            maxTags: 5,
                            allowCustom: true,
                            helperText: 'Add up to 5 tags to categorize this user',
                          },
                          bindings: {
                            value: '{{state.currentUser.tags}}',
                            suggestions: '{{datasources.userTags.data}}',
                          },
                          events: {
                            onChange: { actionId: 'updateUserField', params: { field: 'tags' } },
                          },
                        },
                        // Bio (NEW WIDGET - Textarea)
                        {
                          id: 'bio-textarea',
                          type: 'Textarea',
                          layoutProps: { span: 12 },
                          props: {
                            label: 'Biography',
                            placeholder: 'Enter user bio...',
                            rows: 4,
                            maxLength: 500,
                            helperText: 'Brief description of the user (max 500 characters)',
                          },
                          bindings: {
                            value: '{{state.currentUser.bio}}',
                          },
                          events: {
                            onChange: { actionId: 'updateUserField', params: { field: 'bio' } },
                          },
                        },
                        // Active Checkbox
                        {
                          id: 'active-checkbox',
                          type: 'Checkbox',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Email notifications enabled',
                          },
                          bindings: {
                            checked: '{{state.currentUser.emailNotifications}}',
                          },
                          events: {
                            onChange: { actionId: 'updateUserField', params: { field: 'emailNotifications' } },
                          },
                        },
                        {
                          id: 'newsletter-checkbox',
                          type: 'Checkbox',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Subscribe to newsletter',
                          },
                          bindings: {
                            checked: '{{state.currentUser.newsletter}}',
                          },
                          events: {
                            onChange: { actionId: 'updateUserField', params: { field: 'newsletter' } },
                          },
                        },
                      ],
                    },
                    // Form Actions
                    {
                      id: 'form-actions',
                      type: 'ButtonGroup',
                      props: {
                        orientation: 'horizontal',
                        gap: 'md',
                        justify: 'end',
                        buttons: [
                          {
                            id: 'cancel-btn',
                            label: 'Cancel',
                            variant: 'ghost',
                            actionId: 'closeUserModal',
                          },
                          {
                            id: 'save-btn',
                            label: 'Save User',
                            variant: 'default',
                            actionId: 'saveUser',
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
            // Delete Confirmation Modal
            {
              id: 'delete-modal',
              type: 'Modal',
              props: {
                title: 'Confirm Delete',
                size: 'sm',
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
                    content: 'Are you sure you want to delete this user? This action cannot be undone.',
                    variant: 'body',
                  },
                },
                {
                  id: 'delete-actions',
                  type: 'ButtonGroup',
                  props: {
                    orientation: 'horizontal',
                    gap: 'md',
                    justify: 'end',
                    buttons: [
                      {
                        id: 'cancel-delete-btn',
                        label: 'Cancel',
                        variant: 'ghost',
                        actionId: 'closeDeleteModal',
                      },
                      {
                        id: 'confirm-delete-btn',
                        label: 'Delete',
                        variant: 'destructive',
                        actionId: 'confirmDeleteUser',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
      datasources: [
        {
          id: 'users',
          type: 'http',
          config: {
            url: '/api/users',
            method: 'GET',
            autoLoad: true,
          },
        },
        {
          id: 'userTags',
          type: 'http',
          config: {
            url: '/api/users/tags',
            method: 'GET',
            autoLoad: true,
          },
        },
      ],
      actions: [
        {
          id: 'openAddUserModal',
          type: 'chain',
          params: {
            actions: [
              {
                actionId: 'updateState',
                params: {
                  modalMode: 'add',
                  currentUser: {},
                  userModalOpen: true,
                },
              },
            ],
          },
        },
        {
          id: 'editUser',
          type: 'chain',
          params: {
            actions: [
              {
                actionId: 'updateState',
                params: {
                  modalMode: 'edit',
                  currentUser: '{{event.row}}',
                  userModalOpen: true,
                },
              },
            ],
          },
        },
        {
          id: 'viewUser',
          type: 'navigate',
          params: {
            path: '/users/{{event.row.id}}',
          },
        },
        {
          id: 'deleteUser',
          type: 'updateState',
          params: {
            userToDelete: '{{event.row}}',
            deleteModalOpen: true,
          },
        },
        {
          id: 'closeUserModal',
          type: 'updateState',
          params: {
            userModalOpen: false,
            currentUser: {},
          },
        },
        {
          id: 'closeDeleteModal',
          type: 'updateState',
          params: {
            deleteModalOpen: false,
            userToDelete: null,
          },
        },
        {
          id: 'saveUser',
          type: 'executeAction',
          params: {
            actionId: '{{state.modalMode === "add" ? "user.create" : "user.update"}}',
            data: '{{state.currentUser}}',
          },
          onSuccess: {
            actionId: 'afterSaveUser',
          },
        },
        {
          id: 'confirmDeleteUser',
          type: 'executeAction',
          params: {
            actionId: 'user.delete',
            data: { id: '{{state.userToDelete.id}}' },
          },
          onSuccess: {
            actionId: 'afterDeleteUser',
          },
        },
        {
          id: 'afterSaveUser',
          type: 'chain',
          params: {
            actions: [
              { actionId: 'closeUserModal' },
              { actionId: 'refreshUsers' },
              {
                actionId: 'showToast',
                params: {
                  variant: 'success',
                  message: 'User saved successfully',
                },
              },
            ],
          },
        },
        {
          id: 'afterDeleteUser',
          type: 'chain',
          params: {
            actions: [
              { actionId: 'closeDeleteModal' },
              { actionId: 'refreshUsers' },
              {
                actionId: 'showToast',
                params: {
                  variant: 'success',
                  message: 'User deleted successfully',
                },
              },
            ],
          },
        },
        {
          id: 'refreshUsers',
          type: 'refreshDatasource',
          params: {
            datasourceId: 'users',
          },
        },
        {
          id: 'loadUsersPage',
          type: 'updateState',
          params: {
            currentPage: '{{event.page}}',
          },
          onSuccess: {
            actionId: 'refreshUsers',
          },
        },
        {
          id: 'sortUsers',
          type: 'updateState',
          params: {
            sortField: '{{event.field}}',
            sortDirection: '{{event.direction}}',
          },
          onSuccess: {
            actionId: 'refreshUsers',
          },
        },
        {
          id: 'filterUsers',
          type: 'updateState',
          params: {
            filters: '{{event.filters}}',
          },
          onSuccess: {
            actionId: 'refreshUsers',
          },
        },
        {
          id: 'updateUserField',
          type: 'updateState',
          params: {
            'currentUser.{{params.field}}': '{{event.value}}',
          },
        },
        {
          id: 'exportUsers',
          type: 'executeAction',
          params: {
            actionId: 'user.export',
          },
        },
        {
          id: 'bulkDeleteUsers',
          type: 'executeAction',
          params: {
            actionId: 'user.bulkDelete',
            data: { ids: '{{state.selectedRows}}' },
          },
          onSuccess: {
            actionId: 'refreshUsers',
          },
        },
        {
          id: 'bulkExportUsers',
          type: 'executeAction',
          params: {
            actionId: 'user.bulkExport',
            data: { ids: '{{state.selectedRows}}' },
          },
        },
      ],
    },
    tenantId: 'tenant-001',
    permissions: ['users.view'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createPageConfig(usersManagementConfig);

  // Add route for users management
  db.createRouteConfig({
    id: randomUUID(),
    pattern: '/users/manage',
    pageId: 'users-management',
    permissions: ['users.view'],
    exact: true,
    tenantId: 'tenant-001',
    priority: 0,
    metadata: { title: 'User Management' },
    createdAt: new Date(),
  });

  // 5. LOCATIONS MANAGEMENT PAGE - Table + Modal with Wizard for multi-step creation
  const locationsManagementConfig: PageConfig = {
    id: randomUUID(),
    pageId: 'locations-management',
    version: '1.0.0',
    config: {
      pageId: 'locations-management',
      schemaVersion: '1.0',
      title: 'Location Management',
      widgets: [
        {
          id: 'page',
          type: 'Page',
          props: {
            title: 'Location Management',
            padding: 'md',
          },
          children: [
            {
              id: 'locations-section',
              type: 'Section',
              props: {
                title: 'Locations',
                padding: 'md',
                bordered: false,
              },
              children: [
                // Action Buttons
                {
                  id: 'locations-actions',
                  type: 'ButtonGroup',
                  props: {
                    orientation: 'horizontal',
                    gap: 'md',
                    buttons: [
                      {
                        id: 'add-location-btn',
                        label: 'Add Location',
                        icon: 'plus',
                        variant: 'default',
                        actionId: 'openAddLocationWizard',
                      },
                      {
                        id: 'refresh-locations-btn',
                        label: 'Refresh',
                        icon: 'refresh-cw',
                        variant: 'outline',
                        actionId: 'refreshLocations',
                      },
                      {
                        id: 'map-view-btn',
                        label: 'Map View',
                        icon: 'map',
                        variant: 'ghost',
                        actionId: 'showMapView',
                      },
                    ],
                  },
                },
                // Locations Table
                {
                  id: 'locations-table',
                  type: 'Table',
                  props: {
                    columns: [
                      {
                        id: 'image',
                        label: '',
                        field: 'image',
                        format: 'image',
                        width: '60px',
                      },
                      {
                        id: 'name',
                        label: 'Name',
                        field: 'name',
                        sortable: true,
                      },
                      {
                        id: 'address',
                        label: 'Address',
                        field: 'address',
                        sortable: false,
                      },
                      {
                        id: 'city',
                        label: 'City',
                        field: 'city',
                        sortable: true,
                      },
                      {
                        id: 'country',
                        label: 'Country',
                        field: 'country',
                        sortable: true,
                      },
                      {
                        id: 'tags',
                        label: 'Tags',
                        field: 'tags',
                        format: 'badges',
                      },
                      {
                        id: 'status',
                        label: 'Status',
                        field: 'status',
                        format: 'badge',
                      },
                    ],
                    rowKey: 'id',
                    pagination: {
                      enabled: true,
                      pageSize: 10,
                    },
                    sorting: {
                      enabled: true,
                      defaultSort: {
                        field: 'name',
                        direction: 'asc',
                      },
                    },
                    filtering: {
                      enabled: true,
                    },
                    rowActions: [
                      {
                        id: 'view',
                        label: 'View',
                        icon: 'eye',
                        actionId: 'viewLocation',
                      },
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: 'edit',
                        actionId: 'editLocation',
                      },
                      {
                        id: 'delete',
                        label: 'Delete',
                        icon: 'trash',
                        variant: 'destructive',
                        actionId: 'deleteLocation',
                      },
                    ],
                    emptyMessage: 'No locations found. Click "Add Location" to get started.',
                  },
                  bindings: {
                    data: '{{datasources.locations.data}}',
                    loading: '{{datasources.locations.loading}}',
                  },
                  events: {
                    onRowClick: { actionId: 'viewLocation' },
                    onPageChange: { actionId: 'loadLocationsPage' },
                  },
                },
              ],
            },
            // Add/Edit Location Wizard Modal
            {
              id: 'location-wizard-modal',
              type: 'Modal',
              props: {
                title: '{{state.wizardMode === "add" ? "Add New Location" : "Edit Location"}}',
                size: 'xl',
              },
              bindings: {
                open: '{{state.wizardModalOpen}}',
              },
              events: {
                onClose: { actionId: 'closeWizardModal' },
              },
              children: [
                {
                  id: 'location-wizard',
                  type: 'Wizard',
                  props: {
                    steps: [
                      {
                        id: 'basic-info',
                        label: 'Basic Information',
                        description: 'Enter location details',
                      },
                      {
                        id: 'address',
                        label: 'Address',
                        description: 'Location address details',
                      },
                      {
                        id: 'media',
                        label: 'Media & Tags',
                        description: 'Photos and categorization',
                      },
                      {
                        id: 'review',
                        label: 'Review',
                        description: 'Review and submit',
                      },
                    ],
                  },
                  bindings: {
                    currentStep: '{{state.wizardStep}}',
                  },
                  events: {
                    onStepChange: { actionId: 'updateWizardStep' },
                    onComplete: { actionId: 'saveLocation' },
                  },
                  children: [
                    // Step 1: Basic Information
                    {
                      id: 'step-basic',
                      type: 'Grid',
                      props: {
                        columns: 12,
                        gap: 'md',
                      },
                      children: [
                        {
                          id: 'location-name',
                          type: 'TextInput',
                          layoutProps: { span: 12 },
                          props: {
                            label: 'Location Name',
                            placeholder: 'Enter location name',
                            required: true,
                            icon: 'map-pin',
                          },
                          bindings: {
                            value: '{{state.currentLocation.name}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'name' } },
                          },
                        },
                        {
                          id: 'location-description',
                          type: 'Textarea',
                          layoutProps: { span: 12 },
                          props: {
                            label: 'Description',
                            placeholder: 'Describe this location...',
                            rows: 4,
                            maxLength: 1000,
                            helperText: 'Provide a detailed description of the location',
                          },
                          bindings: {
                            value: '{{state.currentLocation.description}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'description' } },
                          },
                        },
                        {
                          id: 'location-type',
                          type: 'Select',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Location Type',
                            placeholder: 'Select type',
                            required: true,
                            options: [
                              { value: 'office', label: 'Office' },
                              { value: 'warehouse', label: 'Warehouse' },
                              { value: 'retail', label: 'Retail Store' },
                              { value: 'datacenter', label: 'Data Center' },
                              { value: 'other', label: 'Other' },
                            ],
                          },
                          bindings: {
                            value: '{{state.currentLocation.type}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'type' } },
                          },
                        },
                        {
                          id: 'location-status',
                          type: 'Select',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Status',
                            placeholder: 'Select status',
                            required: true,
                            options: [
                              { value: 'active', label: 'Active' },
                              { value: 'inactive', label: 'Inactive' },
                              { value: 'pending', label: 'Pending' },
                              { value: 'maintenance', label: 'Under Maintenance' },
                            ],
                          },
                          bindings: {
                            value: '{{state.currentLocation.status}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'status' } },
                          },
                        },
                      ],
                    },
                    // Step 2: Address
                    {
                      id: 'step-address',
                      type: 'Grid',
                      props: {
                        columns: 12,
                        gap: 'md',
                      },
                      children: [
                        {
                          id: 'address-line1',
                          type: 'TextInput',
                          layoutProps: { span: 12 },
                          props: {
                            label: 'Address Line 1',
                            placeholder: 'Street address',
                            required: true,
                            icon: 'home',
                          },
                          bindings: {
                            value: '{{state.currentLocation.address.line1}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'address.line1' } },
                          },
                        },
                        {
                          id: 'address-line2',
                          type: 'TextInput',
                          layoutProps: { span: 12 },
                          props: {
                            label: 'Address Line 2',
                            placeholder: 'Apartment, suite, etc. (optional)',
                          },
                          bindings: {
                            value: '{{state.currentLocation.address.line2}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'address.line2' } },
                          },
                        },
                        {
                          id: 'address-city',
                          type: 'TextInput',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'City',
                            placeholder: 'City',
                            required: true,
                          },
                          bindings: {
                            value: '{{state.currentLocation.address.city}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'address.city' } },
                          },
                        },
                        {
                          id: 'address-state',
                          type: 'TextInput',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'State/Province',
                            placeholder: 'State or Province',
                          },
                          bindings: {
                            value: '{{state.currentLocation.address.state}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'address.state' } },
                          },
                        },
                        {
                          id: 'address-postal',
                          type: 'TextInput',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Postal Code',
                            placeholder: 'ZIP or Postal Code',
                            required: true,
                          },
                          bindings: {
                            value: '{{state.currentLocation.address.postalCode}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'address.postalCode' } },
                          },
                        },
                        {
                          id: 'address-country',
                          type: 'Select',
                          layoutProps: { span: 6 },
                          props: {
                            label: 'Country',
                            placeholder: 'Select country',
                            required: true,
                            options: [
                              { value: 'US', label: 'United States' },
                              { value: 'CA', label: 'Canada' },
                              { value: 'GB', label: 'United Kingdom' },
                              { value: 'DE', label: 'Germany' },
                              { value: 'FR', label: 'France' },
                              { value: 'AU', label: 'Australia' },
                              { value: 'JP', label: 'Japan' },
                            ],
                          },
                          bindings: {
                            value: '{{state.currentLocation.address.country}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'address.country' } },
                          },
                        },
                      ],
                    },
                    // Step 3: Media & Tags
                    {
                      id: 'step-media',
                      type: 'Grid',
                      props: {
                        columns: 12,
                        gap: 'md',
                      },
                      children: [
                        {
                          id: 'location-images',
                          type: 'FileUpload',
                          layoutProps: { span: 12 },
                          props: {
                            label: 'Location Photos',
                            accept: 'image/*',
                            multiple: true,
                            maxSize: 10485760, // 10MB
                            maxFiles: 5,
                            preview: true,
                            helperText: 'Upload up to 5 photos (max 10MB each)',
                          },
                          bindings: {
                            value: '{{state.currentLocation.images}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'images' } },
                          },
                        },
                        {
                          id: 'location-tags',
                          type: 'TagInput',
                          layoutProps: { span: 12 },
                          props: {
                            label: 'Tags',
                            placeholder: 'Add tags (press Enter)',
                            maxTags: 10,
                            allowCustom: true,
                            helperText: 'Add tags to help categorize this location',
                          },
                          bindings: {
                            value: '{{state.currentLocation.tags}}',
                            suggestions: '{{datasources.locationTags.data}}',
                          },
                          events: {
                            onChange: { actionId: 'updateLocationField', params: { field: 'tags' } },
                          },
                        },
                        {
                          id: 'location-features',
                          type: 'Grid',
                          layoutProps: { span: 12 },
                          props: {
                            columns: 12,
                            gap: 'sm',
                          },
                          children: [
                            {
                              id: 'feature-parking',
                              type: 'Checkbox',
                              layoutProps: { span: 6 },
                              props: {
                                label: 'Parking Available',
                              },
                              bindings: {
                                checked: '{{state.currentLocation.features.parking}}',
                              },
                              events: {
                                onChange: { actionId: 'updateLocationField', params: { field: 'features.parking' } },
                              },
                            },
                            {
                              id: 'feature-wifi',
                              type: 'Checkbox',
                              layoutProps: { span: 6 },
                              props: {
                                label: 'WiFi Available',
                              },
                              bindings: {
                                checked: '{{state.currentLocation.features.wifi}}',
                              },
                              events: {
                                onChange: { actionId: 'updateLocationField', params: { field: 'features.wifi' } },
                              },
                            },
                            {
                              id: 'feature-accessible',
                              type: 'Checkbox',
                              layoutProps: { span: 6 },
                              props: {
                                label: 'Wheelchair Accessible',
                              },
                              bindings: {
                                checked: '{{state.currentLocation.features.accessible}}',
                              },
                              events: {
                                onChange: { actionId: 'updateLocationField', params: { field: 'features.accessible' } },
                              },
                            },
                            {
                              id: 'feature-security',
                              type: 'Checkbox',
                              layoutProps: { span: 6 },
                              props: {
                                label: '24/7 Security',
                              },
                              bindings: {
                                checked: '{{state.currentLocation.features.security}}',
                              },
                              events: {
                                onChange: { actionId: 'updateLocationField', params: { field: 'features.security' } },
                              },
                            },
                          ],
                        },
                      ],
                    },
                    // Step 4: Review
                    {
                      id: 'step-review',
                      type: 'Card',
                      props: {
                        elevation: 'sm',
                        padding: 'lg',
                      },
                      children: [
                        {
                          id: 'review-title',
                          type: 'Text',
                          props: {
                            content: 'Review Location Details',
                            variant: 'subheading',
                            weight: 'semibold',
                          },
                        },
                        {
                          id: 'review-content',
                          type: 'Grid',
                          props: {
                            columns: 12,
                            gap: 'md',
                          },
                          children: [
                            {
                              id: 'review-basic',
                              type: 'Card',
                              layoutProps: { span: 6 },
                              props: {
                                title: 'Basic Information',
                                elevation: 'none',
                                padding: 'md',
                              },
                              children: [
                                {
                                  id: 'review-name',
                                  type: 'Text',
                                  props: {
                                    content: '**Name:** {{state.currentLocation.name}}',
                                    variant: 'body',
                                    markdown: true,
                                  },
                                },
                                {
                                  id: 'review-type',
                                  type: 'Text',
                                  props: {
                                    content: '**Type:** {{state.currentLocation.type}}',
                                    variant: 'body',
                                    markdown: true,
                                  },
                                },
                                {
                                  id: 'review-status-badge',
                                  type: 'Badge',
                                  props: {
                                    label: '{{state.currentLocation.status}}',
                                    variant: 'success',
                                  },
                                },
                              ],
                            },
                            {
                              id: 'review-address',
                              type: 'Card',
                              layoutProps: { span: 6 },
                              props: {
                                title: 'Address',
                                elevation: 'none',
                                padding: 'md',
                              },
                              children: [
                                {
                                  id: 'review-address-text',
                                  type: 'Text',
                                  props: {
                                    content: '{{state.currentLocation.address.line1}}\n{{state.currentLocation.address.city}}, {{state.currentLocation.address.state}} {{state.currentLocation.address.postalCode}}\n{{state.currentLocation.address.country}}',
                                    variant: 'body',
                                  },
                                },
                              ],
                            },
                            {
                              id: 'review-tags',
                              type: 'Card',
                              layoutProps: { span: 12 },
                              props: {
                                title: 'Tags',
                                elevation: 'none',
                                padding: 'md',
                              },
                              children: [
                                {
                                  id: 'review-tags-list',
                                  type: 'Text',
                                  props: {
                                    content: '**Tags:** {{state.currentLocation.tags.join(", ")}}',
                                    variant: 'body',
                                    markdown: true,
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // Delete Confirmation Modal
            {
              id: 'delete-location-modal',
              type: 'Modal',
              props: {
                title: 'Confirm Delete',
                size: 'sm',
              },
              bindings: {
                open: '{{state.deleteLocationModalOpen}}',
              },
              events: {
                onClose: { actionId: 'closeDeleteLocationModal' },
              },
              children: [
                {
                  id: 'delete-location-message',
                  type: 'Text',
                  props: {
                    content: 'Are you sure you want to delete "{{state.locationToDelete.name}}"? This action cannot be undone.',
                    variant: 'body',
                  },
                },
                {
                  id: 'delete-location-actions',
                  type: 'ButtonGroup',
                  props: {
                    orientation: 'horizontal',
                    gap: 'md',
                    justify: 'end',
                    buttons: [
                      {
                        id: 'cancel-delete-location-btn',
                        label: 'Cancel',
                        variant: 'ghost',
                        actionId: 'closeDeleteLocationModal',
                      },
                      {
                        id: 'confirm-delete-location-btn',
                        label: 'Delete',
                        variant: 'destructive',
                        actionId: 'confirmDeleteLocation',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
      datasources: [
        {
          id: 'locations',
          type: 'http',
          config: {
            url: '/api/locations',
            method: 'GET',
            autoLoad: true,
          },
        },
        {
          id: 'locationTags',
          type: 'http',
          config: {
            url: '/api/locations/tags',
            method: 'GET',
            autoLoad: true,
          },
        },
      ],
      actions: [
        {
          id: 'openAddLocationWizard',
          type: 'chain',
          params: {
            actions: [
              {
                actionId: 'updateState',
                params: {
                  wizardMode: 'add',
                  wizardStep: 0,
                  currentLocation: {},
                  wizardModalOpen: true,
                },
              },
            ],
          },
        },
        {
          id: 'editLocation',
          type: 'chain',
          params: {
            actions: [
              {
                actionId: 'updateState',
                params: {
                  wizardMode: 'edit',
                  wizardStep: 0,
                  currentLocation: '{{event.row}}',
                  wizardModalOpen: true,
                },
              },
            ],
          },
        },
        {
          id: 'viewLocation',
          type: 'navigate',
          params: {
            path: '/locations/{{event.row.id}}',
          },
        },
        {
          id: 'deleteLocation',
          type: 'updateState',
          params: {
            locationToDelete: '{{event.row}}',
            deleteLocationModalOpen: true,
          },
        },
        {
          id: 'closeWizardModal',
          type: 'updateState',
          params: {
            wizardModalOpen: false,
            currentLocation: {},
            wizardStep: 0,
          },
        },
        {
          id: 'closeDeleteLocationModal',
          type: 'updateState',
          params: {
            deleteLocationModalOpen: false,
            locationToDelete: null,
          },
        },
        {
          id: 'updateWizardStep',
          type: 'updateState',
          params: {
            wizardStep: '{{event.step}}',
          },
        },
        {
          id: 'updateLocationField',
          type: 'updateState',
          params: {
            'currentLocation.{{params.field}}': '{{event.value}}',
          },
        },
        {
          id: 'saveLocation',
          type: 'executeAction',
          params: {
            actionId: '{{state.wizardMode === "add" ? "location.create" : "location.update"}}',
            data: '{{state.currentLocation}}',
          },
          onSuccess: {
            actionId: 'afterSaveLocation',
          },
        },
        {
          id: 'confirmDeleteLocation',
          type: 'executeAction',
          params: {
            actionId: 'location.delete',
            data: { id: '{{state.locationToDelete.id}}' },
          },
          onSuccess: {
            actionId: 'afterDeleteLocation',
          },
        },
        {
          id: 'afterSaveLocation',
          type: 'chain',
          params: {
            actions: [
              { actionId: 'closeWizardModal' },
              { actionId: 'refreshLocations' },
              {
                actionId: 'showToast',
                params: {
                  variant: 'success',
                  message: 'Location saved successfully',
                },
              },
            ],
          },
        },
        {
          id: 'afterDeleteLocation',
          type: 'chain',
          params: {
            actions: [
              { actionId: 'closeDeleteLocationModal' },
              { actionId: 'refreshLocations' },
              {
                actionId: 'showToast',
                params: {
                  variant: 'success',
                  message: 'Location deleted successfully',
                },
              },
            ],
          },
        },
        {
          id: 'refreshLocations',
          type: 'refreshDatasource',
          params: {
            datasourceId: 'locations',
          },
        },
        {
          id: 'loadLocationsPage',
          type: 'updateState',
          params: {
            currentPage: '{{event.page}}',
          },
          onSuccess: {
            actionId: 'refreshLocations',
          },
        },
        {
          id: 'showMapView',
          type: 'navigate',
          params: {
            path: '/locations/map',
          },
        },
      ],
    },
    tenantId: 'tenant-001',
    permissions: ['locations.view'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.createPageConfig(locationsManagementConfig);

  // Add route for locations management
  db.createRouteConfig({
    id: randomUUID(),
    pattern: '/locations/manage',
    pageId: 'locations-management',
    permissions: ['locations.view'],
    exact: true,
    tenantId: 'tenant-001',
    priority: 0,
    metadata: { title: 'Location Management' },
    createdAt: new Date(),
  });

  console.log('✅ UI configurations seeded successfully');
}
