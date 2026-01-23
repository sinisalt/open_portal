/**
 * Route Configuration Types
 *
 * Type definitions for route resolution and configuration
 */

/**
 * Route parameter value
 */
export type RouteParam = string | number | undefined;

/**
 * Route parameters object
 */
export type RouteParams = Record<string, RouteParam>;

/**
 * Route configuration metadata
 */
export interface RouteMetadata {
  /** Page title */
  title?: string;

  /** Page description (for meta tags) */
  description?: string;

  /** Icon identifier */
  icon?: string;

  /** Additional metadata */
  [key: string]: unknown;
}

/**
 * Route configuration
 */
export interface RouteConfig {
  /** Route pattern (e.g., "/profile/:id", "/dashboard") */
  pattern: string;

  /** Page identifier to load */
  pageId: string;

  /** Required permissions (all must be satisfied) */
  permissions?: string[];

  /** Redirect to another route */
  redirect?: string;

  /** Exact match required (no sub-paths) */
  exact?: boolean;

  /** Route metadata */
  metadata?: RouteMetadata;

  /** Route priority (higher values matched first, default: 0) */
  priority?: number;
}

/**
 * Route resolution result
 */
export interface RouteResolution {
  /** Matched page identifier */
  pageId: string;

  /** Extracted route parameters */
  params: RouteParams;

  /** Route metadata */
  metadata?: RouteMetadata;

  /** Whether user has required permissions */
  hasPermission: boolean;

  /** Redirect target if applicable */
  redirect?: string;

  /** Original route configuration */
  route: RouteConfig;
}

/**
 * Route match result (internal)
 */
export interface RouteMatch {
  /** Whether route pattern matches the path */
  matches: boolean;

  /** Extracted parameters from path */
  params: RouteParams;

  /** Matched route configuration */
  route: RouteConfig;
}

/**
 * Route resolver options
 */
export interface RouteResolverOptions {
  /** User permissions for access control */
  permissions?: string[];

  /** Whether to include routes without permission */
  includeUnauthorized?: boolean;

  /** Base path to strip from matching */
  basePath?: string;
}

/**
 * Route resolution error types
 */
export enum RouteErrorType {
  /** Route not found */
  NOT_FOUND = 'NOT_FOUND',

  /** Insufficient permissions */
  FORBIDDEN = 'FORBIDDEN',

  /** Invalid route configuration */
  INVALID_CONFIG = 'INVALID_CONFIG',

  /** Circular redirect detected */
  CIRCULAR_REDIRECT = 'CIRCULAR_REDIRECT',
}

/**
 * Route resolution error
 */
export class RouteError extends Error {
  constructor(
    message: string,
    public type: RouteErrorType,
    public path?: string
  ) {
    super(message);
    this.name = 'RouteError';
  }
}
