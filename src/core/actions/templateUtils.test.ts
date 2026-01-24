/**
 * Template Utilities Tests
 */

import type { ActionContext } from '@/types/action.types';
import {
  evaluateCondition,
  getNestedValue,
  resolveTemplate,
  resolveTemplatesInObject,
  setNestedValue,
} from './templateUtils';

describe('templateUtils', () => {
  describe('getNestedValue', () => {
    it('should get nested value from object', () => {
      const obj = {
        user: {
          name: 'John',
          profile: {
            age: 30,
          },
        },
      };

      expect(getNestedValue(obj, 'user.name')).toBe('John');
      expect(getNestedValue(obj, 'user.profile.age')).toBe(30);
    });

    it('should return undefined for non-existent path', () => {
      const obj = { user: { name: 'John' } };

      expect(getNestedValue(obj, 'user.email')).toBeUndefined();
      expect(getNestedValue(obj, 'user.profile.age')).toBeUndefined();
    });

    it('should return undefined for null/undefined values in path', () => {
      const obj = { user: null };

      expect(getNestedValue(obj, 'user.name')).toBeUndefined();
    });

    it('should return the object itself for empty path', () => {
      const obj = { name: 'John' };

      expect(getNestedValue(obj, '')).toBeUndefined();
    });
  });

  describe('setNestedValue', () => {
    it('should set nested value in object', () => {
      const obj: Record<string, any> = {};

      setNestedValue(obj, 'user.name', 'John');

      expect(obj.user.name).toBe('John');
    });

    it('should create nested objects as needed', () => {
      const obj: Record<string, any> = {};

      setNestedValue(obj, 'user.profile.age', 30);

      expect(obj.user.profile.age).toBe(30);
    });

    it('should merge objects when merge is true', () => {
      const obj: Record<string, any> = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      };

      setNestedValue(obj, 'user', { age: 30 }, true);

      expect(obj.user).toEqual({
        name: 'John',
        email: 'john@example.com',
        age: 30,
      });
    });

    it('should replace value when merge is false', () => {
      const obj: Record<string, any> = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      };

      setNestedValue(obj, 'user', { age: 30 }, false);

      expect(obj.user).toEqual({ age: 30 });
    });

    it('should not merge arrays', () => {
      const obj: Record<string, any> = {
        items: [1, 2, 3],
      };

      setNestedValue(obj, 'items', [4, 5, 6], true);

      expect(obj.items).toEqual([4, 5, 6]);
    });
  });

  describe('resolveTemplate', () => {
    const context: ActionContext = {
      pageState: { currentPage: 1, filter: 'active' },
      formData: { name: 'John', email: 'john@example.com' },
      widgetStates: {},
      user: { id: 'user123', name: 'John Doe', email: 'john@example.com', roles: [] },
      permissions: ['read', 'write'],
      tenant: { id: 'tenant456', name: 'Acme Corp', brandingVersion: '1.0.0' },
      routeParams: { userId: '123' },
      queryParams: { tab: 'settings' },
      currentPath: '/users/123',
      navigate: jest.fn(),
      showToast: jest.fn(),
      fetch: jest.fn(),
      setState: jest.fn(),
      getState: jest.fn(),
    };

    it('should resolve single template expression', () => {
      expect(resolveTemplate('{{pageState.currentPage}}', context)).toBe(1);
      expect(resolveTemplate('{{formData.name}}', context)).toBe('John');
      expect(resolveTemplate('{{user.name}}', context)).toBe('John Doe');
    });

    it('should resolve template expression in string', () => {
      expect(resolveTemplate('Page {{pageState.currentPage}}', context)).toBe('Page 1');
      expect(resolveTemplate('Hello {{formData.name}}!', context)).toBe('Hello John!');
    });

    it('should resolve multiple template expressions', () => {
      expect(resolveTemplate('{{formData.name}} - {{formData.email}}', context)).toBe(
        'John - john@example.com'
      );
    });

    it('should resolve context root properties', () => {
      expect(resolveTemplate('{{currentPath}}', context)).toBe('/users/123');
      expect(resolveTemplate('{{permissions}}', context)).toEqual(['read', 'write']);
    });

    it('should resolve nested paths', () => {
      expect(resolveTemplate('{{routeParams.userId}}', context)).toBe('123');
      expect(resolveTemplate('{{queryParams.tab}}', context)).toBe('settings');
      expect(resolveTemplate('{{tenant.name}}', context)).toBe('Acme Corp');
    });

    it('should return empty string for undefined values in string templates', () => {
      expect(resolveTemplate('Value: {{nonExistent.path}}', context)).toBe('Value: ');
    });

    it('should return undefined for undefined values in single expression', () => {
      expect(resolveTemplate('{{nonExistent.path}}', context)).toBeUndefined();
    });

    it('should return non-template strings unchanged', () => {
      expect(resolveTemplate('Hello World', context)).toBe('Hello World');
    });
  });

  describe('resolveTemplatesInObject', () => {
    const context: ActionContext = {
      pageState: { currentPage: 1 },
      formData: { name: 'John', email: 'john@example.com' },
      widgetStates: {},
      user: { id: 'user123', name: 'John Doe', email: 'john@example.com', roles: [] },
      permissions: ['read', 'write'],
      tenant: { id: 'tenant456', name: 'Acme Corp', brandingVersion: '1.0.0' },
      routeParams: { userId: '123' },
      queryParams: {},
      currentPath: '/users/123',
      navigate: jest.fn(),
      showToast: jest.fn(),
      fetch: jest.fn(),
      setState: jest.fn(),
      getState: jest.fn(),
    };

    it('should resolve templates in object properties', () => {
      const obj = {
        url: '/api/users/{{routeParams.userId}}',
        name: '{{formData.name}}',
        page: '{{pageState.currentPage}}',
      };

      const resolved = resolveTemplatesInObject(obj, context);

      expect(resolved).toEqual({
        url: '/api/users/123',
        name: 'John',
        page: 1,
      });
    });

    it('should resolve templates in nested objects', () => {
      const obj = {
        user: {
          name: '{{formData.name}}',
          email: '{{formData.email}}',
        },
        path: '{{currentPath}}',
      };

      const resolved = resolveTemplatesInObject(obj, context);

      expect(resolved).toEqual({
        user: {
          name: 'John',
          email: 'john@example.com',
        },
        path: '/users/123',
      });
    });

    it('should resolve templates in arrays', () => {
      const obj = {
        items: ['{{formData.name}}', '{{formData.email}}', 'static'],
      };

      const resolved = resolveTemplatesInObject(obj, context);

      expect(resolved).toEqual({
        items: ['John', 'john@example.com', 'static'],
      });
    });

    it('should handle null and undefined', () => {
      expect(resolveTemplatesInObject(null, context)).toBeNull();
      expect(resolveTemplatesInObject(undefined, context)).toBeUndefined();
    });

    it('should handle non-string primitives', () => {
      expect(resolveTemplatesInObject(123, context)).toBe(123);
      expect(resolveTemplatesInObject(true, context)).toBe(true);
    });
  });

  describe('evaluateCondition', () => {
    const context: ActionContext = {
      pageState: { isAdmin: true, count: 5 },
      formData: {},
      widgetStates: {},
      user: { id: 'user123', name: 'John Doe', email: 'john@example.com', roles: ['admin'] },
      permissions: ['read', 'write'],
      tenant: { id: 'tenant456', name: 'Acme Corp', brandingVersion: '1.0.0' },
      routeParams: {},
      queryParams: {},
      currentPath: '/dashboard',
      navigate: jest.fn(),
      showToast: jest.fn(),
      fetch: jest.fn(),
      setState: jest.fn(),
      getState: jest.fn(),
    };

    it('should evaluate boolean template', () => {
      expect(evaluateCondition('{{pageState.isAdmin}}', context)).toBe(true);
    });

    it('should evaluate string "true" as true', () => {
      expect(evaluateCondition('true', context)).toBe(true);
      expect(evaluateCondition('TRUE', context)).toBe(true);
    });

    it('should evaluate string "false" as false', () => {
      expect(evaluateCondition('false', context)).toBe(false);
      expect(evaluateCondition('FALSE', context)).toBe(false);
    });

    it('should evaluate truthy values', () => {
      expect(evaluateCondition('{{pageState.count}}', context)).toBe(true);
      expect(evaluateCondition('{{user.name}}', context)).toBe(true);
    });

    it('should evaluate falsy values', () => {
      expect(evaluateCondition('{{pageState.nonExistent}}', context)).toBe(false);
    });

    it('should return true for empty condition', () => {
      expect(evaluateCondition('', context)).toBe(true);
    });
  });
});
