/**
 * User Model
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  tenantId: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refresh Token Model
 */
export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

/**
 * Page Configuration Model
 */
export interface PageConfig {
  id: string;
  pageId: string;
  version: string;
  config: Record<string, unknown>;
  tenantId?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Route Configuration Model
 */
export interface RouteConfig {
  id: string;
  pattern: string;
  pageId: string;
  permissions: string[];
  exact: boolean;
  redirectTo?: string;
  metadata?: Record<string, unknown>;
  tenantId?: string;
  priority: number;
  createdAt: Date;
}

/**
 * Tenant Branding Configuration
 */
export interface TenantBranding {
  id: string;
  tenantId: string;
  version: string;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Menu Configuration
 */
export interface MenuConfig {
  id: string;
  tenantId: string;
  role?: string;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Action Audit Log Entry
 */
export interface ActionAuditLog {
  id: string;
  actionId: string;
  userId: string;
  tenantId: string;
  params: Record<string, unknown>;
  context?: {
    pageId?: string;
    widgetId?: string;
  };
  success: boolean;
  errorMessage?: string;
  executionTimeMs: number;
  ipAddress?: string;
  userAgent?: string;
  affectedRecords?: number;
  createdAt: Date;
}

/**
 * In-Memory Database
 */
class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private refreshTokens: Map<string, RefreshToken> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private pageConfigs: Map<string, PageConfig> = new Map();
  private routeConfigs: Map<string, RouteConfig> = new Map();
  private tenantBrandings: Map<string, TenantBranding> = new Map();
  private menuConfigs: Map<string, MenuConfig> = new Map();
  private actionAuditLogs: ActionAuditLog[] = [];

  // Users
  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Refresh Tokens
  getRefreshTokens(): RefreshToken[] {
    return Array.from(this.refreshTokens.values());
  }

  getRefreshToken(token: string): RefreshToken | undefined {
    return this.refreshTokens.get(token);
  }

  createRefreshToken(refreshToken: RefreshToken): RefreshToken {
    this.refreshTokens.set(refreshToken.token, refreshToken);
    return refreshToken;
  }

  deleteRefreshToken(token: string): boolean {
    return this.refreshTokens.delete(token);
  }

  deleteRefreshTokensByUserId(userId: string): void {
    for (const [token, refreshToken] of this.refreshTokens.entries()) {
      if (refreshToken.userId === userId) {
        this.refreshTokens.delete(token);
      }
    }
  }

  // Audit Logs
  getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  addAuditLog(entry: AuditLogEntry): void {
    this.auditLogs.push(entry);
  }

  // Page Configs
  getPageConfigs(): PageConfig[] {
    return Array.from(this.pageConfigs.values());
  }

  getPageConfigById(id: string): PageConfig | undefined {
    return this.pageConfigs.get(id);
  }

  getPageConfigByPageId(pageId: string, tenantId?: string): PageConfig | undefined {
    return this.getPageConfigs().find(
      (config) =>
        config.pageId === pageId &&
        config.isActive &&
        (!tenantId || !config.tenantId || config.tenantId === tenantId),
    );
  }

  createPageConfig(config: PageConfig): PageConfig {
    this.pageConfigs.set(config.id, config);
    return config;
  }

  updatePageConfig(id: string, updates: Partial<PageConfig>): PageConfig | undefined {
    const config = this.pageConfigs.get(id);
    if (!config) {
      return undefined;
    }
    const updated = { ...config, ...updates, updatedAt: new Date() };
    this.pageConfigs.set(id, updated);
    return updated;
  }

  // Route Configs
  getRouteConfigs(): RouteConfig[] {
    return Array.from(this.routeConfigs.values());
  }

  getRouteConfigById(id: string): RouteConfig | undefined {
    return this.routeConfigs.get(id);
  }

  getRouteConfigsByTenant(tenantId?: string): RouteConfig[] {
    return this.getRouteConfigs()
      .filter((route) => !tenantId || !route.tenantId || route.tenantId === tenantId)
      .sort((a, b) => b.priority - a.priority);
  }

  createRouteConfig(route: RouteConfig): RouteConfig {
    this.routeConfigs.set(route.id, route);
    return route;
  }

  // Tenant Branding
  getTenantBrandings(): TenantBranding[] {
    return Array.from(this.tenantBrandings.values());
  }

  getTenantBrandingByTenantId(tenantId: string): TenantBranding | undefined {
    return this.getTenantBrandings().find((branding) => branding.tenantId === tenantId);
  }

  createTenantBranding(branding: TenantBranding): TenantBranding {
    this.tenantBrandings.set(branding.id, branding);
    return branding;
  }

  updateTenantBranding(id: string, updates: Partial<TenantBranding>): TenantBranding | undefined {
    const branding = this.tenantBrandings.get(id);
    if (!branding) {
      return undefined;
    }
    const updated = { ...branding, ...updates, updatedAt: new Date() };
    this.tenantBrandings.set(id, updated);
    return updated;
  }

  // Menu Configs
  getMenuConfigs(): MenuConfig[] {
    return Array.from(this.menuConfigs.values());
  }

  getMenuConfigByTenantAndRole(tenantId: string, role?: string): MenuConfig | undefined {
    return this.getMenuConfigs().find(
      (config) => config.tenantId === tenantId && config.role === role,
    );
  }

  createMenuConfig(config: MenuConfig): MenuConfig {
    this.menuConfigs.set(config.id, config);
    return config;
  }

  updateMenuConfig(id: string, updates: Partial<MenuConfig>): MenuConfig | undefined {
    const config = this.menuConfigs.get(id);
    if (!config) {
      return undefined;
    }
    const updated = { ...config, ...updates, updatedAt: new Date() };
    this.menuConfigs.set(id, updated);
    return updated;
  }

  // Action Audit Logs
  getActionAuditLogs(): ActionAuditLog[] {
    return this.actionAuditLogs;
  }

  addActionAuditLog(entry: ActionAuditLog): void {
    this.actionAuditLogs.push(entry);
  }

  getActionAuditLogsByUser(userId: string, limit = 100): ActionAuditLog[] {
    return this.actionAuditLogs
      .filter((log) => log.userId === userId)
      .slice(-limit)
      .reverse();
  }

  getActionAuditLogsByTenant(tenantId: string, limit = 100): ActionAuditLog[] {
    return this.actionAuditLogs
      .filter((log) => log.tenantId === tenantId)
      .slice(-limit)
      .reverse();
  }
}

// Singleton instance
export const db = new InMemoryDatabase();
