import { randomUUID } from 'node:crypto';
import type { ConfigDeployment, ConfigValidationRule } from '../models/database';
import { db } from '../models/database';
import { ConfigGovernanceService } from './configGovernanceService';

describe('ConfigGovernanceService', () => {
  let service: ConfigGovernanceService;
  const testTenantId = 'test-tenant-001';
  const testUserId = 'test-user-001';

  beforeEach(() => {
    service = new ConfigGovernanceService();
  });

  describe('Validation', () => {
    beforeEach(() => {
      // Add a test validation rule
      const rule: ConfigValidationRule = {
        id: randomUUID(),
        name: 'Test Schema Rule',
        description: 'Test required fields',
        configType: 'page',
        ruleType: 'schema',
        rule: {
          required: ['layout', 'widgets'],
        },
        severity: 'error',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.createConfigValidationRule(rule);
    });

    test('should validate a valid configuration', () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [{ id: 'widget-1', type: 'text' }],
      };

      const result = service.validateConfig('page', config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for missing required fields', () => {
      const config = {
        layout: { type: 'grid' },
        // Missing 'widgets' field
      };

      const result = service.validateConfig('page', config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('widgets');
    });

    test('should validate with warnings for lint rules', () => {
      // Add a lint rule
      const lintRule: ConfigValidationRule = {
        id: randomUUID(),
        name: 'Naming Convention',
        description: 'Check naming',
        configType: 'page',
        ruleType: 'lint',
        rule: {
          check: 'naming-convention',
          field: 'pageId',
          pattern: '^[a-z-]+$',
        },
        severity: 'warning',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.createConfigValidationRule(lintRule);

      const config = {
        pageId: 'InvalidPageID',
        layout: { type: 'grid' },
        widgets: [],
      };

      const result = service.validateConfig('page', config);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Version Management', () => {
    test('should create a new version', () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [{ id: 'widget-1', type: 'text' }],
      };

      const version = service.createVersion(
        testTenantId,
        'page',
        'test-page-1',
        config,
        testUserId,
        'dev',
        'Initial version',
      );

      expect(version.id).toBeDefined();
      expect(version.tenantId).toBe(testTenantId);
      expect(version.configType).toBe('page');
      expect(version.configId).toBe('test-page-1');
      expect(version.version).toBe('1.0.0');
      expect(version.deploymentStatus).toBe('draft');
      expect(version.environment).toBe('dev');
    });

    test('should increment version numbers', () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [],
      };

      // Create first version
      service.createVersion(testTenantId, 'page', 'test-page-2', config, testUserId, 'dev');

      // Create second version
      const version2 = service.createVersion(
        testTenantId,
        'page',
        'test-page-2',
        config,
        testUserId,
        'dev',
      );

      expect(version2.version).toBe('1.0.1');
    });

    test('should validate config when creating version', () => {
      // Add validation rule
      const rule: ConfigValidationRule = {
        id: randomUUID(),
        name: 'Test Rule',
        description: 'Test',
        configType: 'page',
        ruleType: 'schema',
        rule: {
          required: ['layout'],
        },
        severity: 'error',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.createConfigValidationRule(rule);

      const invalidConfig = {
        widgets: [], // Missing 'layout'
      };

      const version = service.createVersion(
        testTenantId,
        'page',
        'test-page-3',
        invalidConfig,
        testUserId,
        'dev',
      );

      expect(version.validationStatus).toBe('failed');
      expect(version.validationErrors).toBeDefined();
      expect(version.validationErrors?.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Diff', () => {
    test('should calculate diff between versions', () => {
      const config1 = {
        title: 'Original Title',
        widgets: [{ id: 'widget-1' }],
      };

      const config2 = {
        title: 'Updated Title',
        widgets: [{ id: 'widget-1' }, { id: 'widget-2' }],
        newField: 'new value',
      };

      const version1 = service.createVersion(
        testTenantId,
        'page',
        'test-page-4',
        config1,
        testUserId,
        'dev',
      );

      const version2 = service.createVersion(
        testTenantId,
        'page',
        'test-page-4',
        config2,
        testUserId,
        'dev',
      );

      const diff = service.getDiff(version1.id, version2.id);

      expect(diff).toBeDefined();
      expect(diff?.changes.length).toBeGreaterThan(0);

      // Check for modified title
      const titleChange = diff?.changes.find((c) => c.path === 'title');
      expect(titleChange).toBeDefined();
      expect(titleChange?.type).toBe('modified');

      // Check for added field
      const newFieldChange = diff?.changes.find((c) => c.path === 'newField');
      expect(newFieldChange).toBeDefined();
      expect(newFieldChange?.type).toBe('added');
    });

    test('should return null for non-existent versions', () => {
      const diff = service.getDiff('non-existent-1', 'non-existent-2');
      expect(diff).toBeNull();
    });
  });

  describe('Deployment', () => {
    test('should deploy a valid version', async () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [],
      };

      // Create version with passing validation
      const version = service.createVersion(
        testTenantId,
        'page',
        'test-page-5',
        config,
        testUserId,
        'dev',
      );

      // Mark as passed validation
      db.updateConfigVersion(version.id, { validationStatus: 'passed' });

      const deployment = await service.deployVersion([version.id], testUserId, 'Initial deploy');

      expect(deployment.id).toBeDefined();
      expect(deployment.status).toBe('deployed');
      expect(deployment.deployedBy).toBe(testUserId);
      expect(deployment.versionIds).toContain(version.id);

      // Check version status updated
      const updatedVersion = db.getConfigVersionById(version.id);
      expect(updatedVersion?.deploymentStatus).toBe('deployed');
    });

    test('should reject deployment of failed validation', async () => {
      const config = {
        widgets: [], // Missing required fields
      };

      // Add validation rule
      const rule: ConfigValidationRule = {
        id: randomUUID(),
        name: 'Test Rule',
        description: 'Test',
        configType: 'page',
        ruleType: 'schema',
        rule: {
          required: ['layout'],
        },
        severity: 'error',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.createConfigValidationRule(rule);

      const version = service.createVersion(
        testTenantId,
        'page',
        'test-page-6',
        config,
        testUserId,
        'dev',
      );

      await expect(service.deployVersion([version.id], testUserId)).rejects.toThrow(
        'failed validation',
      );
    });

    test('should deploy multiple versions together', async () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [],
      };

      const version1 = service.createVersion(
        testTenantId,
        'page',
        'test-page-7',
        config,
        testUserId,
        'dev',
      );
      db.updateConfigVersion(version1.id, { validationStatus: 'passed' });

      const version2 = service.createVersion(
        testTenantId,
        'route',
        'test-route-1',
        { pattern: '/test', pageId: 'test-page-7' },
        testUserId,
        'dev',
      );
      db.updateConfigVersion(version2.id, { validationStatus: 'passed' });

      const deployment = await service.deployVersion([version1.id, version2.id], testUserId);

      expect(deployment.versionIds).toHaveLength(2);
      expect(deployment.status).toBe('deployed');
    });
  });

  describe('Rollback', () => {
    test('should rollback a deployment', async () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [],
      };

      const version = service.createVersion(
        testTenantId,
        'page',
        'test-page-8',
        config,
        testUserId,
        'dev',
      );
      db.updateConfigVersion(version.id, { validationStatus: 'passed' });

      const deployment = await service.deployVersion([version.id], testUserId);

      const rollback = await service.rollbackDeployment(deployment.id, testUserId);

      expect(rollback.status).toBe('rolled_back');
      expect(rollback.rollbackFromDeploymentId).toBe(deployment.id);

      // Check original deployment status updated
      const originalDeployment = db.getConfigDeploymentById(deployment.id);
      expect(originalDeployment?.status).toBe('rolled_back');

      // Check version status updated
      const rolledBackVersion = db.getConfigVersionById(version.id);
      expect(rolledBackVersion?.deploymentStatus).toBe('rolled_back');
    });

    test('should reject rollback of non-existent deployment', async () => {
      await expect(service.rollbackDeployment('non-existent', testUserId)).rejects.toThrow(
        'Deployment not found',
      );
    });
  });

  describe('Approval Workflow', () => {
    test('should approve a pending deployment', () => {
      const deployment: ConfigDeployment = {
        id: randomUUID(),
        tenantId: testTenantId,
        versionIds: ['version-1'],
        environment: 'prod',
        status: 'pending',
        createdAt: new Date(),
      };
      db.createConfigDeployment(deployment);

      const approved = service.approveDeployment(deployment.id, testUserId);

      expect(approved).toBeDefined();
      expect(approved?.status).toBe('approved');
      expect(approved?.approvedBy).toBe(testUserId);
      expect(approved?.approvedAt).toBeDefined();
    });

    test('should reject a pending deployment', () => {
      const deployment: ConfigDeployment = {
        id: randomUUID(),
        tenantId: testTenantId,
        versionIds: ['version-1'],
        environment: 'prod',
        status: 'pending',
        createdAt: new Date(),
      };
      db.createConfigDeployment(deployment);

      const rejected = service.rejectDeployment(deployment.id, testUserId);

      expect(rejected).toBeDefined();
      expect(rejected?.status).toBe('rejected');
    });

    test('should not approve non-pending deployment', () => {
      const deployment: ConfigDeployment = {
        id: randomUUID(),
        tenantId: testTenantId,
        versionIds: ['version-1'],
        environment: 'prod',
        status: 'deployed',
        createdAt: new Date(),
      };
      db.createConfigDeployment(deployment);

      const result = service.approveDeployment(deployment.id, testUserId);
      expect(result).toBeNull();
    });
  });

  describe('Environment Promotion', () => {
    test('should promote from dev to staging', async () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [],
      };

      const devVersion = service.createVersion(
        testTenantId,
        'page',
        'test-page-9',
        config,
        testUserId,
        'dev',
      );

      const stagingVersion = await service.promoteToEnvironment(
        devVersion.id,
        'staging',
        testUserId,
      );

      expect(stagingVersion.environment).toBe('staging');
      expect(stagingVersion.configId).toBe('test-page-9');
      expect(stagingVersion.config).toEqual(config);
      expect(stagingVersion.changeDescription).toContain('Promoted from dev');
    });

    test('should promote from staging to prod', async () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [],
      };

      const stagingVersion = service.createVersion(
        testTenantId,
        'page',
        'test-page-10',
        config,
        testUserId,
        'staging',
      );

      const prodVersion = await service.promoteToEnvironment(stagingVersion.id, 'prod', testUserId);

      expect(prodVersion.environment).toBe('prod');
      expect(prodVersion.configId).toBe('test-page-10');
    });

    test('should reject promotion from dev to prod', async () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [],
      };

      const devVersion = service.createVersion(
        testTenantId,
        'page',
        'test-page-11',
        config,
        testUserId,
        'dev',
      );

      await expect(service.promoteToEnvironment(devVersion.id, 'prod', testUserId)).rejects.toThrow(
        'Cannot promote directly from dev to prod',
      );
    });

    test('should reject promotion to same environment', async () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [],
      };

      const devVersion = service.createVersion(
        testTenantId,
        'page',
        'test-page-12',
        config,
        testUserId,
        'dev',
      );

      await expect(
        service.promoteToEnvironment(devVersion.id, 'staging', testUserId),
      ).resolves.toBeDefined();

      // Try to promote to staging again
      const stagingVersion = service.createVersion(
        testTenantId,
        'page',
        'test-page-12',
        config,
        testUserId,
        'staging',
      );

      await expect(
        service.promoteToEnvironment(stagingVersion.id, 'staging', testUserId),
      ).rejects.toThrow('already in staging');
    });
  });

  describe('Audit Trail', () => {
    test('should create audit entries for version creation', () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [],
      };

      service.createVersion(testTenantId, 'page', 'test-page-13', config, testUserId, 'dev');

      const auditTrail = service.getAuditTrail({
        tenantId: testTenantId,
        action: 'create',
        limit: 10,
      });

      expect(auditTrail.length).toBeGreaterThan(0);
      const entry = auditTrail.find((e) => e.configId === 'test-page-13');
      expect(entry).toBeDefined();
      expect(entry?.action).toBe('create');
      expect(entry?.userId).toBe(testUserId);
    });

    test('should create audit entries for deployments', async () => {
      const config = {
        layout: { type: 'grid' },
        widgets: [],
      };

      const version = service.createVersion(
        testTenantId,
        'page',
        'test-page-14',
        config,
        testUserId,
        'dev',
      );
      db.updateConfigVersion(version.id, { validationStatus: 'passed' });

      await service.deployVersion([version.id], testUserId);

      const auditTrail = service.getAuditTrail({
        tenantId: testTenantId,
        action: 'deploy',
        limit: 10,
      });

      expect(auditTrail.length).toBeGreaterThan(0);
      const entry = auditTrail.find((e) => e.configId === 'test-page-14');
      expect(entry).toBeDefined();
      expect(entry?.action).toBe('deploy');
    });

    test('should filter audit trail by config type', () => {
      const config = { layout: { type: 'grid' }, widgets: [] };

      service.createVersion(testTenantId, 'page', 'test-page-15', config, testUserId, 'dev');
      service.createVersion(testTenantId, 'route', 'test-route-2', {}, testUserId, 'dev');

      const pageAudit = service.getAuditTrail({
        tenantId: testTenantId,
        configType: 'page',
      });

      expect(pageAudit.every((e) => e.configType === 'page')).toBe(true);
    });
  });
});
