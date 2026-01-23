/**
 * Widget Registry Tests
 */

import type { WidgetProps } from '@/types/widget.types';
import { WidgetError } from '@/types/widget.types';
import { widgetRegistry } from './WidgetRegistry';

// Mock widgets for testing
function TestWidget({ config }: WidgetProps) {
  return config.type;
}

function AnotherWidget({ config }: WidgetProps) {
  return config.id;
}

describe('WidgetRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    widgetRegistry.clear();
  });

  describe('register', () => {
    it('should register a widget component', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      expect(widgetRegistry.has('TestWidget')).toBe(true);
      expect(widgetRegistry.get('TestWidget')).toBe(TestWidget);
    });

    it('should register a widget with metadata', () => {
      widgetRegistry.register('TestWidget', TestWidget, {
        displayName: 'Test Widget',
        category: 'test',
        description: 'A test widget',
        version: '1.0.0',
      });

      const metadata = widgetRegistry.getMetadata('TestWidget');
      expect(metadata).toMatchObject({
        type: 'TestWidget',
        displayName: 'Test Widget',
        category: 'test',
        description: 'A test widget',
        version: '1.0.0',
        lazy: false,
      });
    });

    it('should register multiple widgets', () => {
      widgetRegistry.register('TestWidget', TestWidget);
      widgetRegistry.register('AnotherWidget', AnotherWidget);

      expect(widgetRegistry.has('TestWidget')).toBe(true);
      expect(widgetRegistry.has('AnotherWidget')).toBe(true);
      expect(widgetRegistry.getTypes()).toEqual(['TestWidget', 'AnotherWidget']);
    });

    it('should throw error for invalid type', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid input
        widgetRegistry.register('', TestWidget);
      }).toThrow(WidgetError);

      expect(() => {
        // @ts-expect-error - Testing invalid input
        widgetRegistry.register(null, TestWidget);
      }).toThrow(WidgetError);
    });

    it('should throw error for invalid component', () => {
      expect(() => {
        // @ts-expect-error - Testing invalid input
        widgetRegistry.register('TestWidget', null);
      }).toThrow(WidgetError);

      expect(() => {
        // @ts-expect-error - Testing invalid input
        widgetRegistry.register('TestWidget', 'not a component');
      }).toThrow(WidgetError);
    });

    it('should allow overwriting existing widget', () => {
      widgetRegistry.register('TestWidget', TestWidget);
      widgetRegistry.register('TestWidget', AnotherWidget);

      expect(widgetRegistry.get('TestWidget')).toBe(AnotherWidget);
    });
  });

  describe('get', () => {
    it('should return widget component when registered', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      expect(widgetRegistry.get('TestWidget')).toBe(TestWidget);
    });

    it('should return undefined for unregistered widget', () => {
      expect(widgetRegistry.get('NonExistent')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered widget', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      expect(widgetRegistry.has('TestWidget')).toBe(true);
    });

    it('should return false for unregistered widget', () => {
      expect(widgetRegistry.has('NonExistent')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all registered widgets', () => {
      widgetRegistry.register('TestWidget', TestWidget);
      widgetRegistry.register('AnotherWidget', AnotherWidget);

      const all = widgetRegistry.getAll();
      expect(all.size).toBe(2);
      expect(all.has('TestWidget')).toBe(true);
      expect(all.has('AnotherWidget')).toBe(true);
    });

    it('should return empty map when no widgets registered', () => {
      const all = widgetRegistry.getAll();
      expect(all.size).toBe(0);
    });

    it('should return a copy of the registry', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      const all = widgetRegistry.getAll();
      all.delete('TestWidget');

      // Original registry should not be modified
      expect(widgetRegistry.has('TestWidget')).toBe(true);
    });
  });

  describe('getTypes', () => {
    it('should return all registered widget types', () => {
      widgetRegistry.register('TestWidget', TestWidget);
      widgetRegistry.register('AnotherWidget', AnotherWidget);

      const types = widgetRegistry.getTypes();
      expect(types).toEqual(['TestWidget', 'AnotherWidget']);
    });

    it('should return empty array when no widgets registered', () => {
      const types = widgetRegistry.getTypes();
      expect(types).toEqual([]);
    });
  });

  describe('unregister', () => {
    it('should unregister a widget', () => {
      widgetRegistry.register('TestWidget', TestWidget);
      const result = widgetRegistry.unregister('TestWidget');

      expect(result).toBe(true);
      expect(widgetRegistry.has('TestWidget')).toBe(false);
    });

    it('should return false when unregistering non-existent widget', () => {
      const result = widgetRegistry.unregister('NonExistent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all registered widgets', () => {
      widgetRegistry.register('TestWidget', TestWidget);
      widgetRegistry.register('AnotherWidget', AnotherWidget);

      widgetRegistry.clear();

      expect(widgetRegistry.getTypes()).toEqual([]);
      expect(widgetRegistry.has('TestWidget')).toBe(false);
      expect(widgetRegistry.has('AnotherWidget')).toBe(false);
    });
  });

  describe('getMetadata', () => {
    it('should return widget metadata', () => {
      widgetRegistry.register('TestWidget', TestWidget, {
        displayName: 'Test Widget',
        category: 'test',
      });

      const metadata = widgetRegistry.getMetadata('TestWidget');
      expect(metadata).toMatchObject({
        type: 'TestWidget',
        displayName: 'Test Widget',
        category: 'test',
      });
    });

    it('should return undefined for unregistered widget', () => {
      const metadata = widgetRegistry.getMetadata('NonExistent');
      expect(metadata).toBeUndefined();
    });

    it('should use type as displayName if not provided', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      const metadata = widgetRegistry.getMetadata('TestWidget');
      expect(metadata?.displayName).toBe('TestWidget');
    });
  });

  describe('getByCategory', () => {
    it('should return widgets by category', () => {
      widgetRegistry.register('TestWidget', TestWidget, { category: 'test' });
      widgetRegistry.register('AnotherWidget', AnotherWidget, { category: 'test' });

      const widgets = widgetRegistry.getByCategory('test');
      expect(widgets).toHaveLength(2);
      expect(widgets[0].type).toBe('TestWidget');
      expect(widgets[1].type).toBe('AnotherWidget');
    });

    it('should return empty array for non-existent category', () => {
      const widgets = widgetRegistry.getByCategory('nonexistent');
      expect(widgets).toEqual([]);
    });

    it('should not include widgets from other categories', () => {
      widgetRegistry.register('TestWidget', TestWidget, { category: 'test' });
      widgetRegistry.register('AnotherWidget', AnotherWidget, { category: 'other' });

      const widgets = widgetRegistry.getByCategory('test');
      expect(widgets).toHaveLength(1);
      expect(widgets[0].type).toBe('TestWidget');
    });
  });

  describe('getCategories', () => {
    it('should return all categories', () => {
      widgetRegistry.register('TestWidget', TestWidget, { category: 'test' });
      widgetRegistry.register('AnotherWidget', AnotherWidget, { category: 'other' });

      const categories = widgetRegistry.getCategories();
      expect(categories).toEqual(['other', 'test']); // Sorted alphabetically
    });

    it('should return empty array when no widgets registered', () => {
      const categories = widgetRegistry.getCategories();
      expect(categories).toEqual([]);
    });

    it('should not include duplicates', () => {
      widgetRegistry.register('TestWidget', TestWidget, { category: 'test' });
      widgetRegistry.register('AnotherWidget', AnotherWidget, { category: 'test' });

      const categories = widgetRegistry.getCategories();
      expect(categories).toEqual(['test']);
    });
  });

  describe('getStats', () => {
    it('should return registry statistics', () => {
      widgetRegistry.register('TestWidget', TestWidget, {
        category: 'test',
        lazy: false,
      });
      widgetRegistry.register('AnotherWidget', AnotherWidget, {
        category: 'test',
        lazy: true,
      });
      widgetRegistry.register('ThirdWidget', TestWidget, {
        category: 'other',
        lazy: false,
      });

      const stats = widgetRegistry.getStats();
      expect(stats).toEqual({
        totalWidgets: 3,
        categories: {
          test: 2,
          other: 1,
        },
        lazyWidgets: 1,
      });
    });

    it('should return zero stats when empty', () => {
      const stats = widgetRegistry.getStats();
      expect(stats).toEqual({
        totalWidgets: 0,
        categories: {},
        lazyWidgets: 0,
      });
    });

    it('should categorize widgets without category as uncategorized', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      const stats = widgetRegistry.getStats();
      expect(stats.categories).toEqual({
        uncategorized: 1,
      });
    });
  });

  describe('validate', () => {
    it('should return empty array when no schema defined', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      const errors = widgetRegistry.validate('TestWidget', {
        id: 'test',
        type: 'TestWidget',
      });
      expect(errors).toEqual([]);
    });

    it('should return error for unregistered widget', () => {
      const errors = widgetRegistry.validate('NonExistent', {
        id: 'test',
        type: 'NonExistent',
      });
      expect(errors).toEqual(['Widget type "NonExistent" not found in registry']);
    });

    it('should validate required fields', () => {
      widgetRegistry.register('TestWidget', TestWidget, {
        schema: {
          type: 'object',
          required: ['id', 'label'],
          properties: {
            id: { type: 'string' },
            label: { type: 'string' },
          },
        },
      });

      const errors = widgetRegistry.validate('TestWidget', {
        id: 'test',
        type: 'TestWidget',
      });
      expect(errors).toContain('Required field "label" is missing');
    });

    it('should not return errors when all required fields present', () => {
      widgetRegistry.register('TestWidget', TestWidget, {
        schema: {
          type: 'object',
          required: ['id', 'label'],
          properties: {
            id: { type: 'string' },
            label: { type: 'string' },
          },
        },
      });

      const errors = widgetRegistry.validate('TestWidget', {
        id: 'test',
        type: 'TestWidget',
        props: {
          label: 'Test Label',
        },
      });
      expect(errors).toEqual([]);
    });
  });
});
