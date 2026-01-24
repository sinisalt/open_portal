/**
 * Action Type Definitions
 *
 * Core types for the action execution framework, including action configs,
 * context, results, and registry definitions.
 */

import type { ComponentType } from 'react';
import type { BootstrapTenant, BootstrapUser } from './bootstrap.types';

/**
 * Action kind enum - defines the type of action to execute
 */
export enum ActionKind {
  // Navigation actions
  NAVIGATE = 'navigate',
  GO_BACK = 'goBack',
  RELOAD = 'reload',

  // State management actions
  SET_STATE = 'setState',
  RESET_STATE = 'resetState',
  MERGE_STATE = 'mergeState',

  // API actions
  API_CALL = 'apiCall',
  EXECUTE_ACTION = 'executeAction',

  // UI feedback actions
  SHOW_TOAST = 'showToast',
  SHOW_DIALOG = 'showDialog',
  HIDE_DIALOG = 'hideDialog',

  // Chaining actions
  SEQUENCE = 'sequence',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional',

  // Form actions
  VALIDATE_FORM = 'validateForm',
  RESET_FORM = 'resetForm',
  SUBMIT_FORM = 'submitForm',

  // Data actions
  REFRESH_DATASOURCE = 'refreshDatasource',
  INVALIDATE_CACHE = 'invalidateCache',
}

/**
 * Base action configuration
 */
export interface ActionConfig {
  /** Unique action identifier */
  id: string;

  /** Action type */
  type: ActionKind | string;

  /** Action parameters */
  params?: Record<string, unknown>;

  /** Condition to check before executing (template expression) */
  when?: string;

  /** Success handler actions */
  onSuccess?: ActionConfig | ActionConfig[];

  /** Error handler actions */
  onError?: ActionConfig | ActionConfig[];

  /** Show loading indicator */
  loading?: boolean;

  /** Execution timeout in milliseconds */
  timeout?: number;

  /** Retry configuration */
  retry?: ActionRetryConfig;
}

/**
 * Retry configuration for actions
 */
export interface ActionRetryConfig {
  /** Number of retry attempts */
  attempts: number;

  /** Delay between retries in milliseconds */
  delay: number;

  /** Backoff strategy */
  backoff?: 'linear' | 'exponential';
}

/**
 * Navigation action parameters
 */
export interface NavigateActionParams {
  /** Target path (supports template interpolation) */
  to: string;

  /** Path parameters */
  params?: Record<string, string>;

  /** Query parameters */
  query?: Record<string, string>;

  /** Replace history entry (default: false) */
  replace?: boolean;

  /** External URL (default: false) */
  external?: boolean;

  /** Open in new tab (default: false) */
  openInNewTab?: boolean;
}

/**
 * Go back action parameters
 */
export interface GoBackActionParams {
  /** Fallback route if no history */
  fallback?: string;
}

/**
 * Reload action parameters
 */
export interface ReloadActionParams {
  /** Force cache invalidation */
  hard?: boolean;
}

/**
 * Set state action parameters
 */
export interface SetStateActionParams {
  /** State path (e.g., "user.name") */
  path?: string;

  /** New value */
  value: unknown;

  /** Merge with existing state (default: true) */
  merge?: boolean;
}

/**
 * Reset state action parameters
 */
export interface ResetStateActionParams {
  /** Specific paths to reset (optional) */
  paths?: string[];
}

/**
 * Merge state action parameters
 */
export interface MergeStateActionParams {
  /** State updates */
  updates: Record<string, unknown>;
}

/**
 * API call action parameters
 */
export interface ApiCallActionParams {
  /** API endpoint URL (supports template interpolation) */
  url: string;

  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  /** Custom headers */
  headers?: Record<string, string>;

  /** Request body */
  body?: unknown;

  /** Query parameters */
  queryParams?: Record<string, unknown>;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Cache GET requests */
  cache?: boolean;

  /** Retry on 5xx errors */
  retryOn5xx?: boolean;
}

/**
 * Execute backend action parameters
 */
export interface ExecuteActionParams {
  /** Backend action identifier */
  actionId: string;

  /** Action context data */
  context?: Record<string, unknown>;
}

/**
 * Toast variant
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Show toast action parameters
 */
export interface ShowToastActionParams {
  /** Notification message */
  message: string;

  /** Toast variant */
  variant: ToastVariant;

  /** Auto-dismiss time in milliseconds (default: 5000) */
  duration?: number;

  /** Action button configuration */
  action?: {
    label: string;
    actionId: string;
  };
}

/**
 * Dialog variant
 */
export type DialogVariant = 'info' | 'warning' | 'error' | 'confirm';

/**
 * Show dialog action parameters
 */
export interface ShowDialogActionParams {
  /** Dialog title */
  title: string;

  /** Dialog message */
  message: string;

  /** Dialog variant */
  variant: DialogVariant;

  /** Confirm button label */
  confirmLabel?: string;

  /** Cancel button label */
  cancelLabel?: string;

  /** Actions on confirm */
  onConfirm?: ActionConfig[];

  /** Actions on cancel */
  onCancel?: ActionConfig[];
}

/**
 * Sequence action parameters
 */
export interface SequenceActionParams {
  /** Actions to execute sequentially */
  actions: ActionConfig[];
}

/**
 * Parallel action parameters
 */
export interface ParallelActionParams {
  /** Actions to execute in parallel */
  actions: ActionConfig[];
}

/**
 * Conditional action parameters
 */
export interface ConditionalActionParams {
  /** Condition to evaluate (template expression) */
  condition: string;

  /** Action to execute if condition is true */
  then: ActionConfig | ActionConfig[];

  /** Action to execute if condition is false */
  else?: ActionConfig | ActionConfig[];
}

/**
 * Action trigger information
 */
export interface ActionTrigger {
  /** Widget that triggered the action */
  widgetId: string;

  /** Event type (onClick, onChange, etc.) */
  eventType: string;

  /** Event-specific data */
  eventData?: unknown;
}

/**
 * Action context - available to all actions during execution
 */
export interface ActionContext {
  // State
  /** Current page state */
  pageState: Record<string, unknown>;

  /** Form field values */
  formData: Record<string, unknown>;

  /** Widget-specific states */
  widgetStates: Record<string, unknown>;

  // User & Tenant
  /** Current user information */
  user: BootstrapUser | null;

  /** User permissions */
  permissions: string[];

  /** Tenant/organization information */
  tenant: BootstrapTenant | null;

  // Navigation
  /** URL path parameters */
  routeParams: Record<string, string>;

  /** URL query parameters */
  queryParams: Record<string, string>;

  /** Current route path */
  currentPath: string;

  // Services
  /** Navigation service */
  navigate: (to: string, options?: NavigateOptions) => void;

  /** Toast service */
  showToast: (message: string, variant: ToastVariant, duration?: number) => void;

  /** HTTP client */
  fetch: (url: string, options?: RequestInit) => Promise<Response>;

  /** State updater */
  setState: (path: string, value: unknown, merge?: boolean) => void;

  /** State getter */
  getState: (path?: string) => unknown;

  // Event trigger information
  /** Action trigger information */
  trigger?: ActionTrigger;
}

/**
 * Navigation options
 */
export interface NavigateOptions {
  /** Replace current history entry */
  replace?: boolean;

  /** Query parameters */
  query?: Record<string, string>;

  /** State to pass to next route */
  state?: unknown;
}

/**
 * Action execution result
 */
export interface ActionResult<T = unknown> {
  /** Whether action succeeded */
  success: boolean;

  /** Result data (if any) */
  data?: T;

  /** Error information (if failed) */
  error?: ActionError;

  /** Execution metadata */
  metadata?: {
    /** Execution duration in milliseconds */
    duration: number;

    /** Number of retry attempts */
    retries?: number;

    /** Whether action was cancelled */
    cancelled?: boolean;
  };
}

/**
 * Action error information
 */
export interface ActionError {
  /** Error message */
  message: string;

  /** Error code */
  code?: string;

  /** HTTP status code (for API errors) */
  status?: number;

  /** Field-specific validation errors */
  fieldErrors?: Record<string, string[]>;

  /** Original error object */
  cause?: unknown;
}

/**
 * Action handler function signature
 */
export type ActionHandler<TParams = unknown, TResult = unknown> = (
  params: TParams,
  context: ActionContext,
  signal?: AbortSignal
) => Promise<ActionResult<TResult>>;

/**
 * Action handler definition in registry
 */
export interface ActionHandlerDefinition<TParams = unknown, TResult = unknown> {
  /** Action type identifier */
  type: string;

  /** Handler function */
  handler: ActionHandler<TParams, TResult>;

  /** Handler metadata */
  metadata?: ActionHandlerMetadata;
}

/**
 * Action handler metadata
 */
export interface ActionHandlerMetadata {
  /** Display name for debugging */
  displayName?: string;

  /** Description of the action */
  description?: string;

  /** Whether action supports cancellation */
  cancellable?: boolean;

  /** Whether action can be retried */
  retriable?: boolean;

  /** JSON schema for parameter validation */
  schema?: unknown;
}

/**
 * Action registry interface
 */
export interface IActionRegistry {
  /**
   * Register an action handler
   */
  register<TParams = unknown, TResult = unknown>(
    type: string,
    handler: ActionHandler<TParams, TResult>,
    metadata?: Partial<ActionHandlerMetadata>
  ): void;

  /**
   * Get action handler by type
   */
  get(type: string): ActionHandler | undefined;

  /**
   * Check if action type is registered
   */
  has(type: string): boolean;

  /**
   * Get all registered action types
   */
  getTypes(): string[];

  /**
   * Unregister an action handler
   */
  unregister(type: string): boolean;

  /**
   * Clear all registered handlers
   */
  clear(): void;

  /**
   * Get action handler metadata
   */
  getMetadata(type: string): ActionHandlerMetadata | undefined;
}

/**
 * Action executor interface
 */
export interface IActionExecutor {
  /**
   * Execute an action
   */
  execute(
    action: ActionConfig,
    context: ActionContext,
    signal?: AbortSignal
  ): Promise<ActionResult>;

  /**
   * Execute multiple actions in sequence
   */
  executeSequence(
    actions: ActionConfig[],
    context: ActionContext,
    signal?: AbortSignal
  ): Promise<ActionResult[]>;

  /**
   * Execute multiple actions in parallel
   */
  executeParallel(
    actions: ActionConfig[],
    context: ActionContext,
    signal?: AbortSignal
  ): Promise<ActionResult[]>;

  /**
   * Cancel all pending actions
   */
  cancelAll(): void;
}

/**
 * Action logger interface (for development mode)
 */
export interface IActionLogger {
  /**
   * Log action start
   */
  logStart(action: ActionConfig, context: ActionContext): void;

  /**
   * Log action success
   */
  logSuccess(action: ActionConfig, result: ActionResult, duration: number): void;

  /**
   * Log action error
   */
  logError(action: ActionConfig, error: ActionError, duration: number): void;

  /**
   * Log action cancellation
   */
  logCancel(action: ActionConfig): void;
}

/**
 * Action execution options
 */
export interface ActionExecutionOptions {
  /** Enable action logging in development mode */
  logging?: boolean;

  /** Global timeout for actions (ms) */
  timeout?: number;

  /** Enable action cancellation */
  cancellable?: boolean;

  /** Custom abort signal */
  signal?: AbortSignal;
}
