/**
 * ActionRegistry Tests
 */

import type { ActionContext, ActionHandler, ActionResult } from '@/types/action.types';
import { ActionRegistry } from './ActionRegistry';

describe('ActionRegistry', () => {
  let registry: ActionRegistry;

  beforeEach(() => {
    registry = new ActionRegistry();
  });

  describe('register', () => {
    it('should register an action handler', () => {
      const handler: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });

      registry.register('testAction', handler);

      expect(registry.has('testAction')).toBe(true);
      expect(registry.get('testAction')).toBe(handler);
    });

    it('should register with metadata', () => {
      const handler: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });
      const metadata = {
        displayName: 'Test Action',
        description: 'A test action',
        cancellable: true,
        retriable: false,
      };

      registry.register('testAction', handler, metadata);

      const registeredMetadata = registry.getMetadata('testAction');
      expect(registeredMetadata).toMatchObject(metadata);
    });

    it('should throw error if type is empty', () => {
      const handler: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });

      expect(() => {
        registry.register('', handler);
      }).toThrow('Action type is required');
    });

    it('should throw error if handler is not a function', () => {
      expect(() => {
        registry.register('testAction', 'not a function' as any);
      }).toThrow('Action handler must be a function');
    });

    it('should warn when overwriting existing handler', () => {
      const handler1: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });
      const handler2: ActionHandler = async () => ({ success: false, metadata: { duration: 0 } });
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      registry.register('testAction', handler1);
      registry.register('testAction', handler2);

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('already registered'));
      expect(registry.get('testAction')).toBe(handler2);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('get', () => {
    it('should return registered handler', () => {
      const handler: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });
      registry.register('testAction', handler);

      expect(registry.get('testAction')).toBe(handler);
    });

    it('should return undefined for unregistered handler', () => {
      expect(registry.get('nonExistent')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered handler', () => {
      const handler: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });
      registry.register('testAction', handler);

      expect(registry.has('testAction')).toBe(true);
    });

    it('should return false for unregistered handler', () => {
      expect(registry.has('nonExistent')).toBe(false);
    });
  });

  describe('getTypes', () => {
    it('should return empty array when no handlers registered', () => {
      expect(registry.getTypes()).toEqual([]);
    });

    it('should return all registered types', () => {
      const handler: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });

      registry.register('action1', handler);
      registry.register('action2', handler);
      registry.register('action3', handler);

      const types = registry.getTypes();
      expect(types).toHaveLength(3);
      expect(types).toContain('action1');
      expect(types).toContain('action2');
      expect(types).toContain('action3');
    });
  });

  describe('unregister', () => {
    it('should unregister a handler', () => {
      const handler: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });
      registry.register('testAction', handler);

      expect(registry.has('testAction')).toBe(true);
      const result = registry.unregister('testAction');
      expect(result).toBe(true);
      expect(registry.has('testAction')).toBe(false);
    });

    it('should return false when unregistering non-existent handler', () => {
      const result = registry.unregister('nonExistent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all registered handlers', () => {
      const handler: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });

      registry.register('action1', handler);
      registry.register('action2', handler);
      registry.register('action3', handler);

      expect(registry.getTypes()).toHaveLength(3);

      registry.clear();

      expect(registry.getTypes()).toHaveLength(0);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for registered handler', () => {
      const handler: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });
      const metadata = {
        displayName: 'Test Action',
        description: 'A test action',
      };

      registry.register('testAction', handler, metadata);

      const registeredMetadata = registry.getMetadata('testAction');
      expect(registeredMetadata).toMatchObject(metadata);
      expect(registeredMetadata?.cancellable).toBe(true); // Default
      expect(registeredMetadata?.retriable).toBe(true); // Default
    });

    it('should return undefined for unregistered handler', () => {
      expect(registry.getMetadata('nonExistent')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all handler definitions', () => {
      const handler1: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });
      const handler2: ActionHandler = async () => ({ success: false, metadata: { duration: 0 } });

      registry.register('action1', handler1, { displayName: 'Action 1' });
      registry.register('action2', handler2, { displayName: 'Action 2' });

      const all = registry.getAll();
      expect(all.size).toBe(2);
      expect(all.has('action1')).toBe(true);
      expect(all.has('action2')).toBe(true);
    });

    it('should return a copy of the handlers map', () => {
      const handler: ActionHandler = async () => ({ success: true, metadata: { duration: 0 } });
      registry.register('action1', handler);

      const all1 = registry.getAll();
      const all2 = registry.getAll();

      expect(all1).not.toBe(all2);
      expect(all1).toEqual(all2);
    });
  });
});
