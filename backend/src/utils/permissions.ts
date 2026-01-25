/**
 * Role-based permission mapping utility
 * Shared across services and routes to maintain consistent permission logic
 */

/**
 * Get user permissions based on their roles
 * In production, this would query a permissions table based on roles
 * For now, we use a simple static mapping
 */
export function getUserPermissionsFromRoles(roles: string[]): string[] {
  const rolePermissions: Record<string, string[]> = {
    admin: [
      'dashboard.view',
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'settings.view',
      'settings.edit',
      'admin.access',
      'admin.users.manage',
      'admin.settings.manage',
      // Action permissions
      'records.create',
      'records.update',
      'records.delete',
      'records.bulkUpdate',
      'records.bulkDelete',
      'records.query',
      // Items/Listings permissions
      'items.view',
      'items.create',
      'items.update',
      'items.delete',
    ],
    user: [
      'dashboard.view',
      'users.view',
      'settings.view',
      // Action permissions
      'records.create',
      'records.update',
      'records.query',
      // Items/Listings permissions
      'items.view',
    ],
  };

  const permissions = new Set<string>();
  for (const role of roles) {
    const perms = rolePermissions[role] || [];
    for (const perm of perms) {
      permissions.add(perm);
    }
  }

  return Array.from(permissions);
}
