/**
 * Navigation Action Handlers Tests
 *
 * Comprehensive tests for navigate, goBack, and reload handlers
 */

import type { ActionContext } from '@/types/action.types';
import { goBackHandler, navigateHandler, reloadHandler } from './navigationHandlers';

describe('navigationHandlers', () => {
  let mockContext: ActionContext;
  let mockNavigate: jest.Mock;
  let mockWindowOpen: jest.Mock;
  let mockHistoryBack: jest.Mock;

  beforeEach(() => {
    mockNavigate = jest.fn();
    mockWindowOpen = jest.fn();
    mockHistoryBack = jest.fn();

    mockContext = {
      pageState: {},
      initialPageState: {},
      formData: {},
      widgetStates: {},
      user: { id: 'user123', name: 'John Doe', email: 'john@example.com', roles: [] },
      permissions: ['read'],
      tenant: { id: 'tenant456', name: 'Acme Corp', brandingVersion: '1.0.0' },
      routeParams: {},
      queryParams: {},
      currentPath: '/test',
      navigate: mockNavigate,
      showToast: jest.fn(),
      fetch: jest.fn(),
      setState: jest.fn(),
      getState: jest.fn(),
    };

    // Mock window.open
    global.window.open = mockWindowOpen;

    // Mock window.history
    Object.defineProperty(global.window, 'history', {
      writable: true,
      configurable: true,
      value: {
        length: 5,
        back: mockHistoryBack,
      },
    });
  });

  describe('navigateHandler', () => {
    describe('Internal Navigation', () => {
      it('should navigate to internal path', async () => {
        const result = await navigateHandler({ to: '/users' }, mockContext);

        expect(result.success).toBe(true);
        expect(mockNavigate).toHaveBeenCalledWith('/users', {
          replace: undefined,
          query: undefined,
        });
      });

      it('should navigate with query parameters', async () => {
        const query = { page: '1', filter: 'active' };
        const result = await navigateHandler({ to: '/users', query }, mockContext);

        expect(result.success).toBe(true);
        expect(mockNavigate).toHaveBeenCalledWith('/users', {
          replace: undefined,
          query,
        });
      });

      it('should support replace history', async () => {
        const result = await navigateHandler({ to: '/users', replace: true }, mockContext);

        expect(result.success).toBe(true);
        expect(mockNavigate).toHaveBeenCalledWith('/users', {
          replace: true,
          query: undefined,
        });
      });

      it('should support push history (default)', async () => {
        const result = await navigateHandler({ to: '/users', replace: false }, mockContext);

        expect(result.success).toBe(true);
        expect(mockNavigate).toHaveBeenCalledWith('/users', {
          replace: false,
          query: undefined,
        });
      });
    });

    describe('External URLs', () => {
      it('should handle external URLs in same tab', async () => {
        const result = await navigateHandler(
          { to: 'https://example.com', external: true },
          mockContext
        );

        expect(result.success).toBe(true);
        // Note: Can't reliably test window.location.href assignment in jsdom
        // The important part is that it doesn't call mockNavigate
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      it('should handle external URLs in new tab', async () => {
        const result = await navigateHandler(
          { to: 'https://example.com', external: true, openInNewTab: true },
          mockContext
        );

        expect(result.success).toBe(true);
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://example.com',
          '_blank',
          'noopener,noreferrer'
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    describe('Parameter Validation', () => {
      it('should require "to" parameter', async () => {
        // biome-ignore lint/suspicious/noExplicitAny: Testing invalid params
        const result = await navigateHandler({} as any, mockContext);

        expect(result.success).toBe(false);
        expect(result.error?.message).toContain('to');
      });
    });

    describe('Error Handling', () => {
      it('should handle navigation errors', async () => {
        mockNavigate.mockImplementation(() => {
          throw new Error('Navigation failed');
        });

        const result = await navigateHandler({ to: '/users' }, mockContext);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('NAVIGATION_ERROR');
        expect(result.error?.message).toContain('Navigation failed');
      });
    });

    describe('Return Value', () => {
      it('should return path in success data', async () => {
        const result = await navigateHandler({ to: '/users' }, mockContext);

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ path: '/users' });
      });
    });
  });

  describe('goBackHandler', () => {
    it('should go back when history exists', async () => {
      const result = await goBackHandler({}, mockContext);

      expect(result.success).toBe(true);
      expect(mockHistoryBack).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should use fallback when no history', async () => {
      // Mock empty history
      Object.defineProperty(global.window, 'history', {
        writable: true,
        configurable: true,
        value: {
          length: 1,
          back: jest.fn(),
        },
      });

      const result = await goBackHandler({ fallback: '/' }, mockContext);

      expect(result.success).toBe(true);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should not navigate if no history and no fallback', async () => {
      // Mock empty history
      Object.defineProperty(global.window, 'history', {
        writable: true,
        configurable: true,
        value: {
          length: 1,
          back: jest.fn(),
        },
      });

      const result = await goBackHandler({}, mockContext);

      expect(result.success).toBe(true);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const errorHistoryBack = jest.fn(() => {
        throw new Error('History error');
      });
      Object.defineProperty(global.window, 'history', {
        writable: true,
        configurable: true,
        value: {
          length: 5,
          back: errorHistoryBack,
        },
      });

      const result = await goBackHandler({}, mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('GO_BACK_ERROR');
    });
  });

  describe('reloadHandler', () => {
    it('should call window.location.reload', async () => {
      // Note: We can't easily mock window.location.reload in jsdom
      // So we just verify it doesn't throw and returns success
      const result = await reloadHandler({}, mockContext);

      // The handler will attempt to call window.location.reload()
      // In test environment it won't actually reload, but should return success
      expect(result.success).toBe(true);
    });

    it('should handle hard reload parameter', async () => {
      const result = await reloadHandler({ hard: true }, mockContext);

      expect(result.success).toBe(true);
    });

    it('should handle soft reload parameter', async () => {
      const result = await reloadHandler({ hard: false }, mockContext);

      expect(result.success).toBe(true);
    });

    // Skip error test as we can't reliably mock window.location.reload errors in jsdom
  });
});
