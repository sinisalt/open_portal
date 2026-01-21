/**
 * Bootstrap Context
 *
 * Provides bootstrap data and methods globally to all components
 */

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useBootstrap } from '@/hooks/useBootstrap';
import type { BootstrapResponse } from '@/types/bootstrap.types';

/**
 * Bootstrap context value type
 */
export interface BootstrapContextValue {
  /** Bootstrap data */
  data: BootstrapResponse | null;

  /** Loading state */
  loading: boolean;

  /** Error message if any */
  error: string | null;

  /** Whether bootstrap has been successfully loaded */
  loaded: boolean;

  /** Reload bootstrap data (uses cache by default) */
  reload: (useCache?: boolean) => Promise<void>;

  /** Refresh bootstrap data (bypasses cache) */
  refresh: () => Promise<void>;

  /** Clear bootstrap data and cache */
  clear: () => void;

  // Convenient accessors
  /** Current user information */
  user: BootstrapResponse['user'] | null;

  /** User permissions */
  permissions: string[];

  /** Tenant information */
  tenant: BootstrapResponse['tenant'] | null;

  /** Menu configuration */
  menu: BootstrapResponse['menu'];

  /** Application defaults */
  defaults: BootstrapResponse['defaults'] | null;

  /** Feature flags */
  featureFlags: Record<string, boolean>;
}

/**
 * Bootstrap context
 */
const BootstrapContext = createContext<BootstrapContextValue | undefined>(undefined);

/**
 * Bootstrap context provider props
 */
export interface BootstrapProviderProps {
  children: ReactNode;
}

/**
 * Bootstrap context provider
 *
 * Wraps the application to provide bootstrap data to all components
 *
 * @example
 * ```tsx
 * <BootstrapProvider>
 *   <App />
 * </BootstrapProvider>
 * ```
 */
export function BootstrapProvider({ children }: BootstrapProviderProps) {
  const bootstrap = useBootstrap();

  return <BootstrapContext.Provider value={bootstrap}>{children}</BootstrapContext.Provider>;
}

/**
 * Hook to access bootstrap context
 *
 * Must be used within a BootstrapProvider
 *
 * @throws Error if used outside of BootstrapProvider
 * @returns Bootstrap context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, permissions, menu } = useBootstrapContext();
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}</p>
 *       <Menu items={menu} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useBootstrapContext(): BootstrapContextValue {
  const context = useContext(BootstrapContext);

  if (context === undefined) {
    throw new Error('useBootstrapContext must be used within a BootstrapProvider');
  }

  return context;
}

/**
 * Check if user has a specific permission
 *
 * Convenience function that uses bootstrap context
 *
 * @param permission - Permission to check
 * @returns True if user has the permission
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const canEdit = useHasPermission('users.edit');
 *
 *   return canEdit ? <EditButton /> : null;
 * }
 * ```
 */
export function useHasPermission(permission: string): boolean {
  const { permissions } = useBootstrapContext();
  return permissions.includes(permission);
}

/**
 * Check if a feature flag is enabled
 *
 * Convenience function that uses bootstrap context
 *
 * @param featureFlag - Feature flag to check
 * @returns True if feature is enabled
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const showNewDashboard = useFeatureFlag('newDashboard');
 *
 *   return showNewDashboard ? <NewDashboard /> : <OldDashboard />;
 * }
 * ```
 */
export function useFeatureFlag(featureFlag: string): boolean {
  const { featureFlags } = useBootstrapContext();
  return featureFlags[featureFlag] === true;
}
