import { randomUUID } from 'node:crypto';
import type {
  ConfigAuditEntry,
  ConfigDeployment,
  ConfigValidationRule,
  ConfigVersion,
} from '../models/database.js';
import { db } from '../models/database.js';

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    rule: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    path?: string;
  }>;
  warnings: Array<{
    rule: string;
    message: string;
    path?: string;
  }>;
}

/**
 * Diff Result
 */
export interface DiffResult {
  configType: string;
  configId: string;
  fromVersion: string;
  toVersion: string;
  changes: Array<{
    path: string;
    type: 'added' | 'removed' | 'modified';
    oldValue?: unknown;
    newValue?: unknown;
  }>;
}

/**
 * Configuration Governance Service
 * Handles validation, versioning, deployment, and rollback of configurations
 */
export class ConfigGovernanceService {
  /**
   * Validate a configuration against all applicable rules
   */
  validateConfig(
    configType: 'page' | 'route' | 'branding' | 'menu',
    config: Record<string, unknown>,
  ): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Get all active validation rules for this config type
    const rules = db.getConfigValidationRules({
      configType,
      isActive: true,
    });

    for (const rule of rules) {
      const ruleResult = this.applyValidationRule(rule, config);
      if (!ruleResult.valid) {
        result.valid = false;
        result.errors.push({
          rule: rule.name,
          severity: rule.severity,
          message: ruleResult.message || 'Validation failed',
          path: ruleResult.path,
        });
      } else if (ruleResult.warning) {
        result.warnings.push({
          rule: rule.name,
          message: ruleResult.warning,
          path: ruleResult.path,
        });
      }
    }

    return result;
  }

  /**
   * Apply a single validation rule
   */
  private applyValidationRule(
    rule: ConfigValidationRule,
    config: Record<string, unknown>,
  ): { valid: boolean; message?: string; warning?: string; path?: string } {
    switch (rule.ruleType) {
      case 'schema':
        return this.validateSchema(rule, config);
      case 'lint':
        return this.validateLint(rule, config);
      case 'custom':
        return this.validateCustom(rule, config);
      default:
        return { valid: true };
    }
  }

  /**
   * Validate against JSON Schema
   */
  private validateSchema(
    rule: ConfigValidationRule,
    config: Record<string, unknown>,
  ): { valid: boolean; message?: string; path?: string } {
    // Simplified schema validation
    const schema = rule.rule as { required?: string[]; properties?: Record<string, unknown> };

    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in config)) {
          return {
            valid: false,
            message: `Required field '${field}' is missing`,
            path: field,
          };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Validate linting rules
   */
  private validateLint(
    rule: ConfigValidationRule,
    config: Record<string, unknown>,
  ): { valid: boolean; message?: string; warning?: string; path?: string } {
    // Simplified linting validation
    const lintRule = rule.rule as {
      check?: string;
      maxLength?: number;
      pattern?: string;
      field?: string;
    };

    if (lintRule.check === 'naming-convention' && lintRule.field) {
      const value = config[lintRule.field];
      if (typeof value === 'string' && lintRule.pattern) {
        const regex = new RegExp(lintRule.pattern);
        if (!regex.test(value)) {
          if (rule.severity === 'error') {
            return {
              valid: false,
              message: `Field '${lintRule.field}' does not match naming convention`,
              path: lintRule.field,
            };
          }
          // For warning severity
          return {
            valid: true,
            warning: `Field '${lintRule.field}' should match naming convention`,
            path: lintRule.field,
          };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Validate custom rules
   */
  private validateCustom(
    _rule: ConfigValidationRule,
    _config: Record<string, unknown>,
  ): { valid: boolean; message?: string; path?: string } {
    // In a real implementation, this would execute custom validation logic
    // For now, we just return true
    return { valid: true };
  }

  /**
   * Create a new configuration version
   */
  createVersion(
    tenantId: string,
    configType: 'page' | 'route' | 'branding' | 'menu',
    configId: string,
    config: Record<string, unknown>,
    changedBy: string,
    environment: 'dev' | 'staging' | 'prod' = 'dev',
    changeDescription?: string,
  ): ConfigVersion {
    // Validate the configuration first
    const validationResult = this.validateConfig(configType, config);

    const version: ConfigVersion = {
      id: randomUUID(),
      tenantId,
      configType,
      configId,
      version: this.generateVersionNumber(tenantId, configType, configId, environment),
      config,
      changeDescription,
      changedBy,
      deploymentStatus: 'draft',
      environment,
      validationStatus: validationResult.valid ? 'passed' : 'failed',
      validationErrors: validationResult.valid
        ? undefined
        : validationResult.errors.map((e) => e.message),
      createdAt: new Date(),
    };

    const created = db.createConfigVersion(version);

    // Create audit entry
    this.addAuditEntry({
      id: randomUUID(),
      tenantId,
      configType,
      configId,
      action: 'create',
      versionId: version.id,
      userId: changedBy,
      createdAt: new Date(),
    });

    return created;
  }

  /**
   * Generate semantic version number
   */
  private generateVersionNumber(
    tenantId: string,
    configType: string,
    configId: string,
    environment: string,
  ): string {
    const versions = db.getConfigVersions({
      tenantId,
      configType,
      configId,
      environment,
    });

    if (versions.length === 0) {
      return '1.0.0';
    }

    // Get the latest version
    const latestVersion = versions[0].version;
    const [major, minor, patch] = latestVersion.split('.').map(Number);

    // Increment patch version
    return `${major}.${minor}.${patch + 1}`;
  }

  /**
   * Get diff between two configuration versions
   */
  getDiff(versionId1: string, versionId2: string): DiffResult | null {
    const version1 = db.getConfigVersionById(versionId1);
    const version2 = db.getConfigVersionById(versionId2);

    if (!version1 || !version2) {
      return null;
    }

    const changes = this.compareConfigs(version1.config, version2.config);

    return {
      configType: version1.configType,
      configId: version1.configId,
      fromVersion: version1.version,
      toVersion: version2.version,
      changes,
    };
  }

  /**
   * Compare two configurations and return differences
   */
  private compareConfigs(
    config1: Record<string, unknown>,
    config2: Record<string, unknown>,
    prefix = '',
  ): Array<{
    path: string;
    type: 'added' | 'removed' | 'modified';
    oldValue?: unknown;
    newValue?: unknown;
  }> {
    const changes: Array<{
      path: string;
      type: 'added' | 'removed' | 'modified';
      oldValue?: unknown;
      newValue?: unknown;
    }> = [];

    // Check for removed or modified keys
    for (const key in config1) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (!(key in config2)) {
        changes.push({
          path,
          type: 'removed',
          oldValue: config1[key],
        });
      } else if (JSON.stringify(config1[key]) !== JSON.stringify(config2[key])) {
        if (
          typeof config1[key] === 'object' &&
          config1[key] !== null &&
          typeof config2[key] === 'object' &&
          config2[key] !== null
        ) {
          // Recurse for nested objects
          changes.push(
            ...this.compareConfigs(
              config1[key] as Record<string, unknown>,
              config2[key] as Record<string, unknown>,
              path,
            ),
          );
        } else {
          changes.push({
            path,
            type: 'modified',
            oldValue: config1[key],
            newValue: config2[key],
          });
        }
      }
    }

    // Check for added keys
    for (const key in config2) {
      if (!(key in config1)) {
        const path = prefix ? `${prefix}.${key}` : key;
        changes.push({
          path,
          type: 'added',
          newValue: config2[key],
        });
      }
    }

    return changes;
  }

  /**
   * Deploy a configuration version
   */
  async deployVersion(
    versionIds: string[],
    deployedBy: string,
    deploymentNotes?: string,
  ): Promise<ConfigDeployment> {
    // Validate all versions exist and have passed validation
    const versions = versionIds.map((id) => db.getConfigVersionById(id)).filter(Boolean);

    if (versions.length !== versionIds.length) {
      throw new Error('One or more versions not found');
    }

    for (const version of versions) {
      if (version && version.validationStatus === 'failed') {
        throw new Error(`Version ${version.id} has failed validation`);
      }
    }

    // Get tenant ID from first version
    const tenantId = versions[0]?.tenantId || '';
    const environment = versions[0]?.environment || 'dev';

    // Create deployment
    const deployment: ConfigDeployment = {
      id: randomUUID(),
      tenantId,
      versionIds,
      environment,
      status: 'deployed',
      deployedBy,
      deploymentNotes,
      createdAt: new Date(),
      deployedAt: new Date(),
    };

    const created = db.createConfigDeployment(deployment);

    // Update version deployment status
    for (const versionId of versionIds) {
      db.updateConfigVersion(versionId, {
        deploymentStatus: 'deployed',
      });

      // Create audit entry
      const version = db.getConfigVersionById(versionId);
      if (version) {
        this.addAuditEntry({
          id: randomUUID(),
          tenantId: version.tenantId,
          configType: version.configType,
          configId: version.configId,
          action: 'deploy',
          versionId,
          deploymentId: deployment.id,
          userId: deployedBy,
          createdAt: new Date(),
        });
      }
    }

    return created;
  }

  /**
   * Rollback a deployment
   */
  async rollbackDeployment(deploymentId: string, rolledBackBy: string): Promise<ConfigDeployment> {
    const deployment = db.getConfigDeploymentById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    // Get all versions from this deployment
    const versions = deployment.versionIds.map((id) => db.getConfigVersionById(id)).filter(Boolean);

    // Create rollback deployment
    const rollbackDeployment: ConfigDeployment = {
      id: randomUUID(),
      tenantId: deployment.tenantId,
      versionIds: deployment.versionIds,
      environment: deployment.environment,
      status: 'rolled_back',
      deployedBy: rolledBackBy,
      rollbackFromDeploymentId: deploymentId,
      deploymentNotes: `Rollback from deployment ${deploymentId}`,
      createdAt: new Date(),
      deployedAt: new Date(),
    };

    const created = db.createConfigDeployment(rollbackDeployment);

    // Update original deployment status
    db.updateConfigDeployment(deploymentId, {
      status: 'rolled_back',
    });

    // Update version deployment status
    for (const version of versions) {
      if (version) {
        db.updateConfigVersion(version.id, {
          deploymentStatus: 'rolled_back',
        });

        // Create audit entry
        this.addAuditEntry({
          id: randomUUID(),
          tenantId: version.tenantId,
          configType: version.configType,
          configId: version.configId,
          action: 'rollback',
          versionId: version.id,
          deploymentId: rollbackDeployment.id,
          userId: rolledBackBy,
          createdAt: new Date(),
        });
      }
    }

    return created;
  }

  /**
   * Approve a deployment
   */
  approveDeployment(deploymentId: string, approvedBy: string): ConfigDeployment | null {
    const deployment = db.getConfigDeploymentById(deploymentId);
    if (!deployment || deployment.status !== 'pending') {
      return null;
    }

    const updated = db.updateConfigDeployment(deploymentId, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
    });

    // Create audit entry
    if (updated) {
      this.addAuditEntry({
        id: randomUUID(),
        tenantId: updated.tenantId,
        configType: 'page', // Generic for deployment approval
        configId: deploymentId,
        action: 'approve',
        deploymentId,
        userId: approvedBy,
        createdAt: new Date(),
      });
    }

    return updated || null;
  }

  /**
   * Reject a deployment
   */
  rejectDeployment(deploymentId: string, rejectedBy: string): ConfigDeployment | null {
    const deployment = db.getConfigDeploymentById(deploymentId);
    if (!deployment || deployment.status !== 'pending') {
      return null;
    }

    const updated = db.updateConfigDeployment(deploymentId, {
      status: 'rejected',
    });

    // Create audit entry
    if (updated) {
      this.addAuditEntry({
        id: randomUUID(),
        tenantId: updated.tenantId,
        configType: 'page', // Generic for deployment rejection
        configId: deploymentId,
        action: 'reject',
        deploymentId,
        userId: rejectedBy,
        createdAt: new Date(),
      });
    }

    return updated || null;
  }

  /**
   * Add configuration audit entry
   */
  private addAuditEntry(entry: ConfigAuditEntry): void {
    db.addConfigAuditEntry(entry);
  }

  /**
   * Get configuration audit trail
   */
  getAuditTrail(filters?: {
    tenantId?: string;
    configType?: string;
    configId?: string;
    userId?: string;
    action?: string;
    limit?: number;
  }): ConfigAuditEntry[] {
    return db.getConfigAuditEntries(filters);
  }

  /**
   * Promote configuration to next environment
   */
  async promoteToEnvironment(
    versionId: string,
    targetEnvironment: 'staging' | 'prod',
    promotedBy: string,
  ): Promise<ConfigVersion> {
    const version = db.getConfigVersionById(versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    // Validate promotion path
    if (version.environment === 'dev' && targetEnvironment === 'prod') {
      throw new Error('Cannot promote directly from dev to prod. Must go through staging.');
    }

    if (version.environment === targetEnvironment) {
      throw new Error(`Version is already in ${targetEnvironment} environment`);
    }

    // Re-validate configuration for target environment
    // Validation result stored in the new version
    this.validateConfig(version.configType, version.config);

    // Create new version in target environment
    const promotedVersion = this.createVersion(
      version.tenantId,
      version.configType,
      version.configId,
      version.config,
      promotedBy,
      targetEnvironment,
      `Promoted from ${version.environment} (version ${version.version})`,
    );

    return promotedVersion;
  }
}
