/**
 * Widget Registry
 *
 * Central registry for widget components. Maps widget type strings to React components
 * and manages widget lifecycle, metadata, and validation.
 *
 * Features:
 * - Type-safe widget registration and retrieval
 * - Widget metadata storage (category, schema, version)
 * - Development mode warnings for duplicate/missing widgets
 * - Widget categorization and discovery
 * - Lazy loading support for heavy widgets
 */

import type {
  BaseWidgetConfig,
  IWidgetRegistry,
  WidgetComponent,
  WidgetDefinition,
  WidgetMetadata,
} from '@/types/widget.types';
import { WidgetError, WidgetErrorType } from '@/types/widget.types';

/**
 * Widget Registry Implementation
 * Singleton pattern - use widgetRegistry export
 */
class WidgetRegistry implements IWidgetRegistry {
  /** Map of widget type to widget definition */
  private widgets: Map<string, WidgetDefinition> = new Map();

  /** Development mode flag */
  private isDevelopment: boolean = process.env.NODE_ENV !== 'production';

  /**
   * Register a widget component
   */
  register<TConfig extends BaseWidgetConfig = BaseWidgetConfig>(
    type: string,
    component: WidgetComponent<TConfig>,
    metadata?: Partial<WidgetMetadata>
  ): void {
    // Validate type
    if (!type || typeof type !== 'string') {
      throw new WidgetError(
        'Widget type must be a non-empty string',
        WidgetErrorType.INVALID_CONFIG,
        type
      );
    }

    // Validate component
    if (!component || typeof component !== 'function') {
      throw new WidgetError(
        `Widget component for type "${type}" must be a React component`,
        WidgetErrorType.INVALID_CONFIG,
        type
      );
    }

    // Warn if overwriting in development
    if (this.isDevelopment && this.widgets.has(type)) {
      console.warn(
        `[WidgetRegistry] Overwriting existing widget: ${type}. This may indicate duplicate registration.`
      );
    }

    // Create widget definition
    const definition: WidgetDefinition = {
      type,
      component: component as WidgetComponent,
      metadata: {
        type,
        displayName: metadata?.displayName || type,
        category: metadata?.category,
        description: metadata?.description,
        lazy: metadata?.lazy || false,
        schema: metadata?.schema,
        version: metadata?.version,
      },
    };

    // Register widget
    this.widgets.set(type, definition);

    // Log registration in development
    if (this.isDevelopment) {
      console.log(
        `[WidgetRegistry] Registered widget: ${type}`,
        metadata?.category ? `(category: ${metadata.category})` : ''
      );
    }
  }

  /**
   * Get widget component by type
   */
  get(type: string): WidgetComponent | undefined {
    const definition = this.widgets.get(type);

    // Warn about missing widgets in development
    if (this.isDevelopment && !definition) {
      console.warn(
        `[WidgetRegistry] Widget type "${type}" not found in registry. Available types: ${this.getTypes().join(', ')}`
      );
    }

    return definition?.component;
  }

  /**
   * Check if widget type is registered
   */
  has(type: string): boolean {
    return this.widgets.has(type);
  }

  /**
   * Get all registered widget definitions
   */
  getAll(): Map<string, WidgetDefinition> {
    return new Map(this.widgets);
  }

  /**
   * Get all registered widget types
   */
  getTypes(): string[] {
    return Array.from(this.widgets.keys());
  }

  /**
   * Unregister a widget component
   */
  unregister(type: string): boolean {
    const existed = this.widgets.has(type);

    if (existed) {
      this.widgets.delete(type);

      if (this.isDevelopment) {
        console.log(`[WidgetRegistry] Unregistered widget: ${type}`);
      }
    }

    return existed;
  }

  /**
   * Clear all registered widgets
   */
  clear(): void {
    const count = this.widgets.size;
    this.widgets.clear();

    if (this.isDevelopment) {
      console.log(`[WidgetRegistry] Cleared ${count} widgets`);
    }
  }

  /**
   * Get widget metadata
   */
  getMetadata(type: string): WidgetMetadata | undefined {
    return this.widgets.get(type)?.metadata;
  }

  /**
   * Get widgets by category
   */
  getByCategory(category: string): WidgetDefinition[] {
    return Array.from(this.widgets.values()).filter(def => def.metadata?.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();

    for (const definition of this.widgets.values()) {
      if (definition.metadata?.category) {
        categories.add(definition.metadata.category);
      }
    }

    return Array.from(categories).sort();
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalWidgets: number;
    categories: Record<string, number>;
    lazyWidgets: number;
  } {
    const stats = {
      totalWidgets: this.widgets.size,
      categories: {} as Record<string, number>,
      lazyWidgets: 0,
    };

    for (const definition of this.widgets.values()) {
      // Count by category
      const category = definition.metadata?.category || 'uncategorized';
      stats.categories[category] = (stats.categories[category] || 0) + 1;

      // Count lazy widgets
      if (definition.metadata?.lazy) {
        stats.lazyWidgets++;
      }
    }

    return stats;
  }

  /**
   * Validate widget configuration against schema
   * Returns validation errors if any
   */
  validate(type: string, config: BaseWidgetConfig): string[] {
    const definition = this.widgets.get(type);

    if (!definition) {
      return [`Widget type "${type}" not found in registry`];
    }

    const schema = definition.metadata?.schema;
    if (!schema) {
      // No schema means no validation
      return [];
    }

    const errors: string[] = [];

    // Basic validation: check required fields
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in config) && !(config.props && field in config.props)) {
          errors.push(`Required field "${field}" is missing`);
        }
      }
    }

    // TODO: Add more comprehensive JSON schema validation if needed
    // For now, basic validation is sufficient

    return errors;
  }
}

/**
 * Global widget registry instance
 * Use this singleton instance throughout the application
 */
export const widgetRegistry = new WidgetRegistry();

/**
 * Export type for dependency injection / testing
 */
export type { IWidgetRegistry };
