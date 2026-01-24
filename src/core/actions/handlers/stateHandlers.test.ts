/**
 * State Handlers Tests
 */

import type { ActionContext } from '@/types/action.types';
import { mergeStateHandler, resetStateHandler, setStateHandler } from './stateHandlers';

describe('stateHandlers', () => {
  let mockContext: ActionContext;

  beforeEach(() => {
    mockContext = {
      pageState: { count: 5, user: { name: 'John' }, filter: 'active' },
      initialPageState: { count: 0, user: { name: '' }, filter: 'all' },
      formData: {},
      widgetStates: {},
      user: { id: 'user123', name: 'John Doe', email: 'john@example.com', roles: [] },
      permissions: ['read'],
      tenant: { id: 'tenant456', name: 'Acme Corp', brandingVersion: '1.0.0' },
      routeParams: {},
      queryParams: {},
      currentPath: '/test',
      navigate: jest.fn(),
      showToast: jest.fn(),
      fetch: jest.fn(),
      setState: jest.fn((path, value, merge) => {
        // Simulate setState behavior
        if (!path) return;
        const keys = path.split('.');
        let obj: any = mockContext.pageState;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!obj[keys[i]]) obj[keys[i]] = {};
          obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
      }),
      getState: jest.fn(),
    };
  });

  describe('resetStateHandler', () => {
    it('should reset specific paths to initial values when initialPageState is available', async () => {
      const result = await resetStateHandler({ paths: ['count'] }, mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.setState).toHaveBeenCalledWith('count', 0, false);
    });

    it('should reset all state to initial values when initialPageState is available', async () => {
      const result = await resetStateHandler({}, mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.pageState).toEqual({
        count: 0,
        user: { name: '' },
        filter: 'all',
      });
    });

    it('should clear specific paths when initialPageState is not available', async () => {
      const contextWithoutInitial = { ...mockContext, initialPageState: undefined };

      const result = await resetStateHandler({ paths: ['count'] }, contextWithoutInitial);

      expect(result.success).toBe(true);
      expect(contextWithoutInitial.setState).toHaveBeenCalledWith('count', undefined, false);
    });

    it('should clear all state when initialPageState is not available', async () => {
      const contextWithoutInitial = {
        ...mockContext,
        initialPageState: undefined,
        pageState: { count: 5, filter: 'active' },
      };

      const result = await resetStateHandler({}, contextWithoutInitial);

      expect(result.success).toBe(true);
      expect(Object.keys(contextWithoutInitial.pageState)).toHaveLength(0);
    });

    it('should handle nested paths correctly', async () => {
      const result = await resetStateHandler({ paths: ['user.name'] }, mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.setState).toHaveBeenCalledWith('user.name', '', false);
    });
  });

  describe('setStateHandler', () => {
    it('should set state at specific path', async () => {
      const result = await setStateHandler({ path: 'count', value: 10 }, mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.setState).toHaveBeenCalledWith('count', 10, true);
    });

    it('should set entire state when no path provided', async () => {
      const newState = { newKey: 'newValue' };
      const result = await setStateHandler({ value: newState }, mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.pageState).toEqual(newState);
    });
  });

  describe('mergeStateHandler', () => {
    it('should merge multiple state updates', async () => {
      const updates = { count: 10, newKey: 'value' };
      const result = await mergeStateHandler({ updates }, mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.setState).toHaveBeenCalledWith('count', 10, true);
      expect(mockContext.setState).toHaveBeenCalledWith('newKey', 'value', true);
    });

    it('should fail if updates parameter is missing', async () => {
      const result = await mergeStateHandler({ updates: null as any }, mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('MERGE_STATE_ERROR');
    });
  });
});
