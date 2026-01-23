/**
 * Widget Type Definitions
 *
 * Core types for the widget system, including widget props, bindings, events,
 * and registry definitions.
 */

import type { ComponentType, ReactNode } from 'react';

/**
 * Base widget configuration interface
 * Extends WidgetConfig from page.types.ts with additional runtime properties
 */
export interface BaseWidgetConfig {
  /** Unique widget identifier */
  id: string;

  /** Widget type from registry */
  type: string;

  /** Widget-specific properties */
  props?: Record<string, unknown>;

  /** Visibility flag */
  visible?: boolean;

  /** Widget display name (for debugging) */
  displayName?: string;

  /** Widget category (for organization) */
  category?: string;
}

/**
 * Widget bindings for data connections
 */
export interface WidgetBindings {
  /** Current value binding */
  value?: unknown;

  /** Error message binding */
  error?: string;

  /** Loading state binding */
  loading?: boolean;

  /** Disabled state binding */
  disabled?: boolean;

  /** Additional custom bindings */
  [key: string]: unknown;
}

/**
 * Widget event handlers
 */
export interface WidgetEvents {
  /** Change event (for form inputs) */
  onChange?: (value: unknown) => void;

  /** Click event */
  onClick?: () => void;

  /** Blur event */
  onBlur?: () => void;

  /** Focus event */
  onFocus?: () => void;

  /** Submit event (for forms) */
  onSubmit?: (data: unknown) => void;

  /** Load event */
  onLoad?: () => void;

  /** Error event */
  onError?: (error: Error) => void;

  /** Additional custom event handlers */
  [key: string]: ((value?: unknown) => void) | undefined;
}

/**
 * Widget props interface
 * All widgets receive these props from the renderer
 */
export interface WidgetProps<TConfig extends BaseWidgetConfig = BaseWidgetConfig> {
  /** Widget configuration from backend */
  config: TConfig;

  /** Data bindings (e.g., value, error, loading) */
  bindings?: WidgetBindings;

  /** Event handlers (e.g., onChange, onClick) */
  events?: WidgetEvents;

  /** Child widgets (for container widgets) */
  children?: ReactNode;
}

/**
 * Widget component type
 */
export type WidgetComponent<TConfig extends BaseWidgetConfig = BaseWidgetConfig> = ComponentType<
  WidgetProps<TConfig>
>;

/**
 * Widget metadata for registry
 */
export interface WidgetMetadata {
  /** Widget type identifier */
  type: string;

  /** Display name for debugging and dev tools */
  displayName?: string;

  /** Widget category (e.g., 'form', 'layout', 'data', 'feedback') */
  category?: string;

  /** Description of the widget */
  description?: string;

  /** Whether widget supports lazy loading */
  lazy?: boolean;

  /** JSON schema for widget configuration validation */
  schema?: JSONSchema;

  /** Widget version */
  version?: string;
}

/**
 * Widget definition in registry
 */
export interface WidgetDefinition {
  /** Widget type identifier */
  type: string;

  /** React component */
  component: WidgetComponent;

  /** Widget metadata */
  metadata?: WidgetMetadata;
}

/**
 * JSON Schema type (simplified)
 */
export interface JSONSchema {
  type?: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
}

/**
 * Widget registry interface
 */
export interface IWidgetRegistry {
  /**
   * Register a widget component
   * @param type - Widget type identifier
   * @param component - React component
   * @param metadata - Optional widget metadata
   */
  register<TConfig extends BaseWidgetConfig = BaseWidgetConfig>(
    type: string,
    component: WidgetComponent<TConfig>,
    metadata?: Partial<WidgetMetadata>
  ): void;

  /**
   * Get widget component by type
   * @param type - Widget type identifier
   * @returns Widget component or undefined
   */
  get(type: string): WidgetComponent | undefined;

  /**
   * Check if widget type is registered
   * @param type - Widget type identifier
   * @returns True if widget is registered
   */
  has(type: string): boolean;

  /**
   * Get all registered widget definitions
   * @returns Map of widget type to definition
   */
  getAll(): Map<string, WidgetDefinition>;

  /**
   * Get all registered widget types
   * @returns Array of widget type identifiers
   */
  getTypes(): string[];

  /**
   * Unregister a widget component
   * @param type - Widget type identifier
   * @returns True if widget was unregistered
   */
  unregister(type: string): boolean;

  /**
   * Clear all registered widgets
   */
  clear(): void;

  /**
   * Get widget metadata
   * @param type - Widget type identifier
   * @returns Widget metadata or undefined
   */
  getMetadata(type: string): WidgetMetadata | undefined;
}

/**
 * Widget error types
 */
export enum WidgetErrorType {
  /** Widget type not found in registry */
  WIDGET_NOT_FOUND = 'WIDGET_NOT_FOUND',

  /** Widget configuration is invalid */
  INVALID_CONFIG = 'INVALID_CONFIG',

  /** Widget rendering failed */
  RENDER_ERROR = 'RENDER_ERROR',

  /** Widget validation failed */
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  /** Widget loading failed (lazy loading) */
  LOAD_ERROR = 'LOAD_ERROR',
}

/**
 * Widget error class
 */
export class WidgetError extends Error {
  constructor(
    message: string,
    public type: WidgetErrorType,
    public widgetType?: string,
    public widgetId?: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'WidgetError';
  }
}

/**
 * Widget renderer options
 */
export interface WidgetRendererOptions {
  /** Enable error boundaries for each widget */
  errorBoundaries?: boolean;

  /** Show debug information in development mode */
  debug?: boolean;

  /** Fallback component for unknown widget types */
  fallbackComponent?: WidgetComponent;

  /** Enable performance monitoring */
  performanceMonitoring?: boolean;
}
