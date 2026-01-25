/**
 * Tenant Model
 */
export interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  domain?: string;
  isActive: boolean;
  featureFlags: Record<string, boolean>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

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
 * Configuration Version Model
 * Tracks all versions of configurations for audit and rollback
 */
export interface ConfigVersion {
  id: string;
  tenantId: string;
  configType: 'page' | 'route' | 'branding' | 'menu';
  configId: string; // ID of the configuration (pageId, routeId, etc.)
  version: string; // Semantic version (e.g., "1.0.0", "1.1.0")
  config: Record<string, unknown>; // Snapshot of configuration at this version
  changeDescription?: string;
  changedBy: string; // User ID who made the change
  deploymentStatus: 'draft' | 'pending' | 'deployed' | 'rolled_back';
  environment: 'dev' | 'staging' | 'prod';
  validationStatus: 'pending' | 'passed' | 'failed';
  validationErrors?: string[];
  createdAt: Date;
}

/**
 * Configuration Validation Rule Model
 * Defines validation rules for configurations
 */
export interface ConfigValidationRule {
  id: string;
  name: string;
  description: string;
  configType: 'page' | 'route' | 'branding' | 'menu' | 'all';
  ruleType: 'schema' | 'lint' | 'custom';
  rule: Record<string, unknown>; // JSON Schema or custom rule definition
  severity: 'error' | 'warning' | 'info';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuration Deployment Model
 * Tracks deployments and approvals
 */
export interface ConfigDeployment {
  id: string;
  tenantId: string;
  versionIds: string[]; // Array of ConfigVersion IDs being deployed together
  environment: 'dev' | 'staging' | 'prod';
  status: 'pending' | 'approved' | 'rejected' | 'deployed' | 'failed' | 'rolled_back';
  approvedBy?: string; // User ID who approved
  deployedBy?: string; // User ID who deployed
  rollbackFromDeploymentId?: string; // If this is a rollback, reference to original deployment
  deploymentNotes?: string;
  createdAt: Date;
  approvedAt?: Date;
  deployedAt?: Date;
}

/**
 * Configuration Audit Trail Model
 * Comprehensive audit log for all configuration changes
 */
export interface ConfigAuditEntry {
  id: string;
  tenantId: string;
  configType: 'page' | 'route' | 'branding' | 'menu';
  configId: string;
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'validate'
    | 'deploy'
    | 'rollback'
    | 'approve'
    | 'reject';
  versionId?: string; // Reference to ConfigVersion
  deploymentId?: string; // Reference to ConfigDeployment
  userId: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * In-Memory Database
 */
class InMemoryDatabase {
  private tenants: Map<string, Tenant> = new Map();
  private users: Map<string, User> = new Map();
  private refreshTokens: Map<string, RefreshToken> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private pageConfigs: Map<string, PageConfig> = new Map();
  private routeConfigs: Map<string, RouteConfig> = new Map();
  private tenantBrandings: Map<string, TenantBranding> = new Map();
  private menuConfigs: Map<string, MenuConfig> = new Map();
  private actionAuditLogs: ActionAuditLog[] = [];

  // Configuration Governance
  private configVersions: Map<string, ConfigVersion> = new Map();
  private configValidationRules: Map<string, ConfigValidationRule> = new Map();
  private configDeployments: Map<string, ConfigDeployment> = new Map();
  private configAuditEntries: ConfigAuditEntry[] = [];

  // Tenants
  getTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  getTenantById(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  getTenantBySubdomain(subdomain: string): Tenant | undefined {
    return this.getTenants().find((tenant) => tenant.subdomain === subdomain && tenant.isActive);
  }

  getTenantByDomain(domain: string): Tenant | undefined {
    return this.getTenants().find((tenant) => tenant.domain === domain && tenant.isActive);
  }

  createTenant(tenant: Tenant): Tenant {
    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  updateTenant(id: string, updates: Partial<Tenant>): Tenant | undefined {
    const tenant = this.tenants.get(id);
    if (!tenant) {
      return undefined;
    }
    const updated = { ...tenant, ...updates, updatedAt: new Date() };
    this.tenants.set(id, updated);
    return updated;
  }

  deleteTenant(id: string): boolean {
    return this.tenants.delete(id);
  }

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
    const result: ActionAuditLog[] = [];
    if (limit <= 0) {
      return result;
    }

    for (let i = this.actionAuditLogs.length - 1; i >= 0 && result.length < limit; i -= 1) {
      const log = this.actionAuditLogs[i];
      if (log.userId === userId) {
        result.push(log);
      }
    }

    return result;
  }

  getActionAuditLogsByTenant(tenantId: string, limit = 100): ActionAuditLog[] {
    const result: ActionAuditLog[] = [];
    if (limit <= 0) {
      return result;
    }

    for (let i = this.actionAuditLogs.length - 1; i >= 0 && result.length < limit; i -= 1) {
      const log = this.actionAuditLogs[i];
      if (log.tenantId === tenantId) {
        result.push(log);
      }
    }

    return result;
  }

  // Configuration Versions
  getConfigVersions(filters?: {
    tenantId?: string;
    configType?: string;
    configId?: string;
    environment?: string;
  }): ConfigVersion[] {
    let versions = Array.from(this.configVersions.values());

    if (filters?.tenantId) {
      versions = versions.filter((v) => v.tenantId === filters.tenantId);
    }
    if (filters?.configType) {
      versions = versions.filter((v) => v.configType === filters.configType);
    }
    if (filters?.configId) {
      versions = versions.filter((v) => v.configId === filters.configId);
    }
    if (filters?.environment) {
      versions = versions.filter((v) => v.environment === filters.environment);
    }

    return versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getConfigVersionById(id: string): ConfigVersion | undefined {
    return this.configVersions.get(id);
  }

  createConfigVersion(version: ConfigVersion): ConfigVersion {
    this.configVersions.set(version.id, version);
    return version;
  }

  updateConfigVersion(id: string, updates: Partial<ConfigVersion>): ConfigVersion | undefined {
    const version = this.configVersions.get(id);
    if (!version) {
      return undefined;
    }
    const updated = { ...version, ...updates };
    this.configVersions.set(id, updated);
    return updated;
  }

  // Configuration Validation Rules
  getConfigValidationRules(filters?: {
    configType?: string;
    isActive?: boolean;
  }): ConfigValidationRule[] {
    let rules = Array.from(this.configValidationRules.values());

    if (filters?.configType) {
      rules = rules.filter((r) => r.configType === filters.configType || r.configType === 'all');
    }
    if (filters?.isActive !== undefined) {
      rules = rules.filter((r) => r.isActive === filters.isActive);
    }

    return rules;
  }

  getConfigValidationRuleById(id: string): ConfigValidationRule | undefined {
    return this.configValidationRules.get(id);
  }

  createConfigValidationRule(rule: ConfigValidationRule): ConfigValidationRule {
    this.configValidationRules.set(rule.id, rule);
    return rule;
  }

  updateConfigValidationRule(
    id: string,
    updates: Partial<ConfigValidationRule>,
  ): ConfigValidationRule | undefined {
    const rule = this.configValidationRules.get(id);
    if (!rule) {
      return undefined;
    }
    const updated = { ...rule, ...updates, updatedAt: new Date() };
    this.configValidationRules.set(id, updated);
    return updated;
  }

  deleteConfigValidationRule(id: string): boolean {
    return this.configValidationRules.delete(id);
  }

  // Configuration Deployments
  getConfigDeployments(filters?: {
    tenantId?: string;
    environment?: string;
    status?: string;
  }): ConfigDeployment[] {
    let deployments = Array.from(this.configDeployments.values());

    if (filters?.tenantId) {
      deployments = deployments.filter((d) => d.tenantId === filters.tenantId);
    }
    if (filters?.environment) {
      deployments = deployments.filter((d) => d.environment === filters.environment);
    }
    if (filters?.status) {
      deployments = deployments.filter((d) => d.status === filters.status);
    }

    return deployments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getConfigDeploymentById(id: string): ConfigDeployment | undefined {
    return this.configDeployments.get(id);
  }

  createConfigDeployment(deployment: ConfigDeployment): ConfigDeployment {
    this.configDeployments.set(deployment.id, deployment);
    return deployment;
  }

  updateConfigDeployment(
    id: string,
    updates: Partial<ConfigDeployment>,
  ): ConfigDeployment | undefined {
    const deployment = this.configDeployments.get(id);
    if (!deployment) {
      return undefined;
    }
    const updated = { ...deployment, ...updates };
    this.configDeployments.set(id, updated);
    return updated;
  }

  // Configuration Audit Trail
  getConfigAuditEntries(filters?: {
    tenantId?: string;
    configType?: string;
    configId?: string;
    userId?: string;
    action?: string;
    limit?: number;
  }): ConfigAuditEntry[] {
    let entries = [...this.configAuditEntries];

    if (filters?.tenantId) {
      entries = entries.filter((e) => e.tenantId === filters.tenantId);
    }
    if (filters?.configType) {
      entries = entries.filter((e) => e.configType === filters.configType);
    }
    if (filters?.configId) {
      entries = entries.filter((e) => e.configId === filters.configId);
    }
    if (filters?.userId) {
      entries = entries.filter((e) => e.userId === filters.userId);
    }
    if (filters?.action) {
      entries = entries.filter((e) => e.action === filters.action);
    }

    // Sort by date descending
    entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply limit if specified
    if (filters?.limit && filters.limit > 0) {
      entries = entries.slice(0, filters.limit);
    }

    return entries;
  }

  addConfigAuditEntry(entry: ConfigAuditEntry): void {
    this.configAuditEntries.push(entry);
  }
}

// Singleton instance
export const db = new InMemoryDatabase();
