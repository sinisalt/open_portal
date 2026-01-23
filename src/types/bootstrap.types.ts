/**
 * Bootstrap API Types
 *
 * Type definitions for the /ui/bootstrap API endpoint response
 */

/**
 * User information returned from bootstrap
 */
export interface BootstrapUser {
  /** Unique user identifier */
  id: string;

  /** User's full name */
  name: string;

  /** User's email address */
  email: string;

  /** Optional avatar URL */
  avatar?: string;

  /** User's assigned roles */
  roles: string[];
}

/**
 * Tenant/organization information
 */
export interface BootstrapTenant {
  /** Unique tenant identifier */
  id: string;

  /** Tenant name */
  name: string;

  /** Current branding version for this tenant */
  brandingVersion: string;
}

/**
 * Menu item configuration
 */
export interface MenuItem {
  /** Unique menu item identifier */
  id: string;

  /** Display label */
  label: string;

  /** Icon identifier (icon library reference) */
  icon?: string;

  /** Navigation route */
  route: string;

  /** Display order */
  order: number;

  /** Permission required to view this item */
  permission?: string;

  /** Child menu items (for nested menus) */
  children?: MenuItem[];
}

/**
 * Application defaults
 */
export interface BootstrapDefaults {
  /** Default home page route */
  homePage: string;

  /** Default theme (light/dark/auto) */
  theme: string;
}

/**
 * Feature flags configuration
 */
export type FeatureFlags = Record<string, boolean>;

/**
 * Complete bootstrap response
 */
export interface BootstrapResponse {
  /** Current user information */
  user: BootstrapUser;

  /** User's permissions array */
  permissions: string[];

  /** Tenant/organization information */
  tenant: BootstrapTenant;

  /** Menu configuration */
  menu: MenuItem[];

  /** Application defaults */
  defaults: BootstrapDefaults;

  /** Feature flags */
  featureFlags: FeatureFlags;
}

/**
 * Bootstrap state for hooks/context
 */
export interface BootstrapState {
  /** Bootstrap data */
  data: BootstrapResponse | null;

  /** Loading state */
  loading: boolean;

  /** Error message if any */
  error: string | null;

  /** Whether bootstrap has been loaded */
  loaded: boolean;
}

/**
 * Bootstrap error types
 */
export enum BootstrapErrorType {
  /** Network error */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /** Authentication error */
  AUTH_ERROR = 'AUTH_ERROR',

  /** Invalid response */
  INVALID_RESPONSE = 'INVALID_RESPONSE',

  /** Server error */
  SERVER_ERROR = 'SERVER_ERROR',

  /** Unknown error */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Bootstrap error with type information
 */
export class BootstrapError extends Error {
  constructor(
    message: string,
    public type: BootstrapErrorType,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'BootstrapError';
  }
}
