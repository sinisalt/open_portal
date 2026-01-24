import type { ActionHandler } from './actionTypes.js';

/**
 * Action Registry
 * Central registry for all action handlers
 */
class ActionRegistry {
  private handlers: Map<string, ActionHandler> = new Map();

  /**
   * Register an action handler
   */
  register(handler: ActionHandler): void {
    if (this.handlers.has(handler.id)) {
      throw new Error(`Action handler with id "${handler.id}" already registered`);
    }
    this.handlers.set(handler.id, handler);
  }

  /**
   * Get an action handler by ID
   */
  get(actionId: string): ActionHandler | undefined {
    return this.handlers.get(actionId);
  }

  /**
   * Check if an action handler exists
   */
  has(actionId: string): boolean {
    return this.handlers.has(actionId);
  }

  /**
   * Get all registered action IDs
   */
  getActionIds(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Unregister an action handler (mainly for testing)
   */
  unregister(actionId: string): boolean {
    return this.handlers.delete(actionId);
  }

  /**
   * Clear all handlers (mainly for testing)
   */
  clear(): void {
    this.handlers.clear();
  }
}

// Singleton instance
export const actionRegistry = new ActionRegistry();
