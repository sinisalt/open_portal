/**
 * Action Registry
 *
 * Central registry for action handlers. Maps action types to their handler functions.
 */

import type {
  ActionHandler,
  ActionHandlerDefinition,
  ActionHandlerMetadata,
  IActionRegistry,
} from '@/types/action.types';

/**
 * Action registry implementation
 */
export class ActionRegistry implements IActionRegistry {
  private handlers: Map<string, ActionHandlerDefinition>;

  constructor() {
    this.handlers = new Map();
  }

  /**
   * Register an action handler
   */
  register<TParams = unknown, TResult = unknown>(
    type: string,
    handler: ActionHandler<TParams, TResult>,
    metadata?: Partial<ActionHandlerMetadata>
  ): void {
    if (!type) {
      throw new Error('Action type is required');
    }

    if (typeof handler !== 'function') {
      throw new Error('Action handler must be a function');
    }

    if (this.handlers.has(type)) {
      console.warn(`Action handler for type "${type}" is already registered. Overwriting.`);
    }

    this.handlers.set(type, {
      type,
      handler: handler as ActionHandler,
      metadata: {
        displayName: metadata?.displayName || type,
        description: metadata?.description,
        cancellable: metadata?.cancellable ?? true,
        retriable: metadata?.retriable ?? true,
        schema: metadata?.schema,
      },
    });
  }

  /**
   * Get action handler by type
   */
  get(type: string): ActionHandler | undefined {
    const definition = this.handlers.get(type);
    return definition?.handler;
  }

  /**
   * Check if action type is registered
   */
  has(type: string): boolean {
    return this.handlers.has(type);
  }

  /**
   * Get all registered action types
   */
  getTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Unregister an action handler
   */
  unregister(type: string): boolean {
    return this.handlers.delete(type);
  }

  /**
   * Clear all registered handlers
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get action handler metadata
   */
  getMetadata(type: string): ActionHandlerMetadata | undefined {
    const definition = this.handlers.get(type);
    return definition?.metadata;
  }

  /**
   * Get all handler definitions
   */
  getAll(): Map<string, ActionHandlerDefinition> {
    return new Map(this.handlers);
  }
}

/**
 * Global action registry instance
 */
export const actionRegistry = new ActionRegistry();
