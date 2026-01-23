/**
 * Bootstrap Context Tests
 */

import { render, renderHook, screen, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import * as bootstrapService from '@/services/bootstrapService';
import * as tokenManager from '@/services/tokenManager';
import type { BootstrapResponse } from '@/types/bootstrap.types';
import {
  BootstrapProvider,
  useBootstrapContext,
  useFeatureFlag,
  useHasPermission,
} from './BootstrapContext';

// Mock dependencies
jest.mock('@/services/bootstrapService');
jest.mock('@/services/tokenManager');

describe('BootstrapContext', () => {
  const mockBootstrapData: BootstrapResponse = {
    user: {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      roles: ['admin'],
    },
    permissions: ['dashboard.view', 'users.edit', 'reports.view'],
    tenant: {
      id: 'tenant456',
      name: 'Acme Corp',
      brandingVersion: '1.2.0',
    },
    menu: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/dashboard',
        order: 1,
      },
    ],
    defaults: {
      homePage: '/dashboard',
      theme: 'light',
    },
    featureFlags: {
      newDashboard: true,
      betaFeatures: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (tokenManager.isAuthenticated as jest.Mock).mockReturnValue(true);
    (bootstrapService.fetchBootstrap as jest.Mock).mockResolvedValue(mockBootstrapData);
  });

  describe('BootstrapProvider', () => {
    it('should render children', () => {
      render(
        <BootstrapProvider>
          <div>Test Content</div>
        </BootstrapProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should provide bootstrap context to children', async () => {
      const TestComponent = () => {
        const { user } = useBootstrapContext();
        return <div>{user ? user.name : 'Loading...'}</div>;
      };

      render(
        <BootstrapProvider>
          <TestComponent />
        </BootstrapProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('useBootstrapContext', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      // Test that the hook throws when used outside provider
      // We need to use a different approach since React hooks rules don't allow conditional usage
      const _caughtError: Error | null = null;

      const TestComponent = () => {
        // This will throw during render
        useBootstrapContext();
        return <div>Should not render</div>;
      };

      // Use a custom error boundary to catch the error
      class ErrorBoundary extends React.Component<
        { children: ReactNode },
        { error: Error | null }
      > {
        constructor(props: { children: ReactNode }) {
          super(props);
          this.state = { error: null };
        }

        static getDerivedStateFromError(error: Error) {
          return { error };
        }

        render() {
          if (this.state.error) {
            return <div>Error: {this.state.error.message}</div>;
          }
          return this.props.children;
        }
      }

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(
        screen.getByText(/useBootstrapContext must be used within a BootstrapProvider/)
      ).toBeInTheDocument();

      // Restore console.error
      console.error = originalError;
    });

    it('should return bootstrap context when used within provider', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <BootstrapProvider>{children}</BootstrapProvider>
      );

      const { result } = renderHook(() => useBootstrapContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      expect(result.current.data).toEqual(mockBootstrapData);
      expect(result.current.user).toEqual(mockBootstrapData.user);
      expect(result.current.permissions).toEqual(mockBootstrapData.permissions);
      expect(result.current.tenant).toEqual(mockBootstrapData.tenant);
      expect(result.current.menu).toEqual(mockBootstrapData.menu);
      expect(result.current.defaults).toEqual(mockBootstrapData.defaults);
      expect(result.current.featureFlags).toEqual(mockBootstrapData.featureFlags);
    });

    it('should provide reload, refresh, and clear methods', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <BootstrapProvider>{children}</BootstrapProvider>
      );

      const { result } = renderHook(() => useBootstrapContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      expect(typeof result.current.reload).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
      expect(typeof result.current.clear).toBe('function');
    });
  });

  describe('useHasPermission', () => {
    it('should return true when user has permission', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <BootstrapProvider>{children}</BootstrapProvider>
      );

      const { result } = renderHook(() => useHasPermission('dashboard.view'), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should return false when user does not have permission', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <BootstrapProvider>{children}</BootstrapProvider>
      );

      const { result } = renderHook(() => useHasPermission('admin.delete'), { wrapper });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should work in a component', async () => {
      const TestComponent = () => {
        const canEdit = useHasPermission('users.edit');
        return <div>{canEdit ? 'Can Edit' : 'Cannot Edit'}</div>;
      };

      render(
        <BootstrapProvider>
          <TestComponent />
        </BootstrapProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Can Edit')).toBeInTheDocument();
      });
    });
  });

  describe('useFeatureFlag', () => {
    it('should return true when feature is enabled', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <BootstrapProvider>{children}</BootstrapProvider>
      );

      const { result } = renderHook(() => useFeatureFlag('newDashboard'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should return false when feature is disabled', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <BootstrapProvider>{children}</BootstrapProvider>
      );

      const { result } = renderHook(() => useFeatureFlag('betaFeatures'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should return false when feature does not exist', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <BootstrapProvider>{children}</BootstrapProvider>
      );

      const { result } = renderHook(() => useFeatureFlag('nonExistent'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should work in a component', async () => {
      const TestComponent = () => {
        const showNew = useFeatureFlag('newDashboard');
        return <div>{showNew ? 'New Dashboard' : 'Old Dashboard'}</div>;
      };

      render(
        <BootstrapProvider>
          <TestComponent />
        </BootstrapProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('New Dashboard')).toBeInTheDocument();
      });
    });
  });
});
