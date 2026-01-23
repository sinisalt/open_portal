/**
 * User Context Tests
 */

import { render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as bootstrapService from '@/services/bootstrapService';
import * as tokenManager from '@/services/tokenManager';
import type { BootstrapResponse } from '@/types/bootstrap.types';
import { BootstrapProvider } from './BootstrapContext';
import {
  UserProvider,
  useHasAllPermissions,
  useHasAnyPermission,
  useHasPermission,
  usePermissions,
  useTenant,
  useUser,
  useUserContext,
} from './UserContext';

// Mock dependencies
jest.mock('@/services/bootstrapService');
jest.mock('@/services/tokenManager');
jest.mock('@/services/authService', () => ({
  getCurrentUser: jest.fn(() => null),
  login: jest.fn(),
  logout: jest.fn(),
  getRefreshToken: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

describe('UserContext', () => {
  const mockBootstrapData: BootstrapResponse = {
    user: {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      roles: ['admin', 'editor'],
    },
    permissions: ['dashboard.view', 'users.edit', 'users.delete', 'reports.view'],
    tenant: {
      id: 'tenant456',
      name: 'Acme Corp',
      brandingVersion: '1.2.0',
    },
    menu: [],
    defaults: {
      homePage: '/dashboard',
      theme: 'light',
    },
    featureFlags: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();

    // Mock authenticated state
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);
  });

  /**
   * Helper to render with all required providers
   */
  function renderWithProviders(ui: ReactNode) {
    return render(
      <BootstrapProvider>
        <UserProvider>{ui}</UserProvider>
      </BootstrapProvider>
    );
  }

  /**
   * Helper to render hook with all required providers
   */
  function renderHookWithProviders<T>(hook: () => T) {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <BootstrapProvider>
        <UserProvider>{children}</UserProvider>
      </BootstrapProvider>
    );

    return renderHook(hook, { wrapper });
  }

  describe('UserProvider', () => {
    it('should provide user context to children', async () => {
      function TestComponent() {
        const context = useUserContext();
        return <div data-testid="context-exists">{context ? 'exists' : 'missing'}</div>;
      }

      renderWithProviders(<TestComponent />);

      const element = await screen.findByTestId('context-exists');
      expect(element).toHaveTextContent('exists');
    });

    it('should throw error when useUserContext used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      function TestComponent() {
        useUserContext();
        return <div />;
      }

      expect(() => render(<TestComponent />)).toThrow(
        'useUserContext must be used within a UserProvider'
      );

      console.error = originalError;
    });
  });

  describe('useUserContext', () => {
    it('should return user information from bootstrap', async () => {
      const { result } = renderHookWithProviders(() => useUserContext());

      // Wait for bootstrap to load
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current.user).toEqual(mockBootstrapData.user);
    });

    it('should return permissions array from bootstrap', async () => {
      const { result } = renderHookWithProviders(() => useUserContext());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current.permissions).toEqual(mockBootstrapData.permissions);
    });

    it('should return tenant information from bootstrap', async () => {
      const { result } = renderHookWithProviders(() => useUserContext());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current.tenant).toEqual(mockBootstrapData.tenant);
    });

    it('should indicate authenticated state', async () => {
      const { result } = renderHookWithProviders(() => useUserContext());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current.isAuthenticated).toBe(false); // useAuth returns false initially
    });

    it('should provide permission checking functions', async () => {
      const { result } = renderHookWithProviders(() => useUserContext());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(typeof result.current.hasPermission).toBe('function');
      expect(typeof result.current.hasAnyPermission).toBe('function');
      expect(typeof result.current.hasAllPermissions).toBe('function');
    });
  });

  describe('useUser', () => {
    it('should return current user', async () => {
      const { result } = renderHookWithProviders(() => useUser());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toEqual(mockBootstrapData.user);
    });

    it('should return null when no user', async () => {
      (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue({
        ...mockBootstrapData,
        user: null,
      });

      const { result } = renderHookWithProviders(() => useUser());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBeNull();
    });
  });

  describe('usePermissions', () => {
    it('should return permissions array', async () => {
      const { result } = renderHookWithProviders(() => usePermissions());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toEqual(mockBootstrapData.permissions);
    });

    it('should return empty array when no permissions', async () => {
      (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue({
        ...mockBootstrapData,
        permissions: [],
      });

      const { result } = renderHookWithProviders(() => usePermissions());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toEqual([]);
    });
  });

  describe('useTenant', () => {
    it('should return tenant information', async () => {
      const { result } = renderHookWithProviders(() => useTenant());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toEqual(mockBootstrapData.tenant);
    });

    it('should return null when no tenant', async () => {
      (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue({
        ...mockBootstrapData,
        tenant: null,
      });

      const { result } = renderHookWithProviders(() => useTenant());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBeNull();
    });
  });

  describe('useHasPermission', () => {
    it('should return true when user has permission', async () => {
      const { result } = renderHookWithProviders(() => useHasPermission('users.edit'));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(true);
    });

    it('should return false when user does not have permission', async () => {
      const { result } = renderHookWithProviders(() => useHasPermission('admin.delete'));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(false);
    });

    it('should return false when permissions array is empty', async () => {
      (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue({
        ...mockBootstrapData,
        permissions: [],
      });

      const { result } = renderHookWithProviders(() => useHasPermission('users.edit'));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(false);
    });
  });

  describe('useHasAnyPermission', () => {
    it('should return true when user has at least one permission', async () => {
      const { result } = renderHookWithProviders(() =>
        useHasAnyPermission(['users.edit', 'admin.full'])
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(true);
    });

    it('should return true when user has all permissions', async () => {
      const { result } = renderHookWithProviders(() =>
        useHasAnyPermission(['users.edit', 'reports.view'])
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(true);
    });

    it('should return false when user has none of the permissions', async () => {
      const { result } = renderHookWithProviders(() =>
        useHasAnyPermission(['admin.full', 'settings.write'])
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(false);
    });

    it('should return false for empty permissions array', async () => {
      const { result } = renderHookWithProviders(() => useHasAnyPermission([]));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(false);
    });
  });

  describe('useHasAllPermissions', () => {
    it('should return true when user has all permissions', async () => {
      const { result } = renderHookWithProviders(() =>
        useHasAllPermissions(['users.edit', 'reports.view'])
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(true);
    });

    it('should return false when user is missing one permission', async () => {
      const { result } = renderHookWithProviders(() =>
        useHasAllPermissions(['users.edit', 'admin.full'])
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(false);
    });

    it('should return false when user has none of the permissions', async () => {
      const { result } = renderHookWithProviders(() =>
        useHasAllPermissions(['admin.full', 'settings.write'])
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(false);
    });

    it('should return true for empty permissions array', async () => {
      const { result } = renderHookWithProviders(() => useHasAllPermissions([]));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current).toBe(true);
    });
  });

  describe('Permission checking methods', () => {
    it('should have hasPermission method that works correctly', async () => {
      const { result } = renderHookWithProviders(() => useUserContext());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current.hasPermission('users.edit')).toBe(true);
      expect(result.current.hasPermission('admin.full')).toBe(false);
    });

    it('should have hasAnyPermission method that works correctly', async () => {
      const { result } = renderHookWithProviders(() => useUserContext());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current.hasAnyPermission(['users.edit', 'admin.full'])).toBe(true);
      expect(result.current.hasAnyPermission(['admin.full', 'settings.write'])).toBe(false);
    });

    it('should have hasAllPermissions method that works correctly', async () => {
      const { result } = renderHookWithProviders(() => useUserContext());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(result.current.hasAllPermissions(['users.edit', 'reports.view'])).toBe(true);
      expect(result.current.hasAllPermissions(['users.edit', 'admin.full'])).toBe(false);
    });
  });

  describe('Integration with auth state', () => {
    it('should combine loading states from auth and bootstrap', async () => {
      const { result } = renderHookWithProviders(() => useUserContext());

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      // After bootstrap loads, should not be loading
      expect(result.current.isLoading).toBe(false);
    });

    it('should provide logout function from auth', async () => {
      const { result } = renderHookWithProviders(() => useUserContext());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(typeof result.current.logout).toBe('function');
    });
  });

  describe('Component usage examples', () => {
    it('should work in component to show user name', async () => {
      function UserDisplay() {
        const user = useUser();
        return <div data-testid="user-name">{user?.name || 'No user'}</div>;
      }

      renderWithProviders(<UserDisplay />);

      const element = await screen.findByTestId('user-name');
      expect(element).toHaveTextContent('John Doe');
    });

    it('should work in component to check permissions', async () => {
      function EditButton() {
        const canEdit = useHasPermission('users.edit');
        return (
          <button type="button" data-testid="edit-button" disabled={!canEdit}>
            {canEdit ? 'Edit' : 'No permission'}
          </button>
        );
      }

      renderWithProviders(<EditButton />);

      const button = await screen.findByTestId('edit-button');
      expect(button).toHaveTextContent('Edit');
      expect(button).not.toBeDisabled();
    });

    it('should work in component to show tenant info', async () => {
      function TenantDisplay() {
        const tenant = useTenant();
        return <div data-testid="tenant-name">{tenant?.name || 'No tenant'}</div>;
      }

      renderWithProviders(<TenantDisplay />);

      const element = await screen.findByTestId('tenant-name');
      expect(element).toHaveTextContent('Acme Corp');
    });
  });
});
