import { randomUUID } from 'node:crypto';
import express from 'express';
import { type AuthRequest, authenticateToken } from '../middleware/auth.js';
import { db } from '../models/database.js';
import { ConfigGovernanceService } from '../services/configGovernanceService.js';

const router = express.Router();
const configService = new ConfigGovernanceService();

/**
 * Helper to check if user is admin
 */
function isAdmin(req: AuthRequest): boolean {
  return req.user?.roles?.includes('admin') || false;
}

/**
 * POST /config/validate
 * Validate a configuration against all applicable rules
 */
router.post('/validate', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { configType, config } = req.body;

    if (!configType || !config) {
      res.status(400).json({ error: 'configType and config are required' });
      return;
    }

    if (!['page', 'route', 'branding', 'menu'].includes(configType)) {
      res.status(400).json({ error: 'Invalid configType' });
      return;
    }

    const result = configService.validateConfig(configType, config);
    res.json(result);
  } catch (error) {
    console.error('Error validating configuration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /config/versions
 * Create a new configuration version
 */
router.post('/versions', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { configType, configId, config, environment, changeDescription } = req.body;

    if (!configType || !configId || !config) {
      res.status(400).json({ error: 'configType, configId, and config are required' });
      return;
    }

    if (!['page', 'route', 'branding', 'menu'].includes(configType)) {
      res.status(400).json({ error: 'Invalid configType' });
      return;
    }

    if (environment && !['dev', 'staging', 'prod'].includes(environment)) {
      res.status(400).json({ error: 'Invalid environment' });
      return;
    }

    const version = configService.createVersion(
      tenantId,
      configType,
      configId,
      config,
      userId,
      environment || 'dev',
      changeDescription,
    );

    res.status(201).json(version);
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /config/versions
 * List configuration versions
 */
router.get('/versions', authenticateToken, (req: AuthRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { configType, configId, environment } = req.query;

    const filters: {
      tenantId: string;
      configType?: string;
      configId?: string;
      environment?: string;
    } = { tenantId };

    if (configType) filters.configType = configType as string;
    if (configId) filters.configId = configId as string;
    if (environment) filters.environment = environment as string;

    const versions = db.getConfigVersions(filters);
    res.json({ versions });
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /config/versions/:id
 * Get a specific configuration version
 */
router.get('/versions/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const version = db.getConfigVersionById(id);
    if (!version) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    // Check tenant access
    if (version.tenantId !== tenantId && !isAdmin(req)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(version);
  } catch (error) {
    console.error('Error fetching version:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /config/diff
 * Get diff between two configuration versions
 */
router.get('/diff', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { fromVersion, toVersion } = req.query;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!fromVersion || !toVersion) {
      res.status(400).json({ error: 'fromVersion and toVersion are required' });
      return;
    }

    const diff = configService.getDiff(fromVersion as string, toVersion as string);
    if (!diff) {
      res.status(404).json({ error: 'One or both versions not found' });
      return;
    }

    res.json(diff);
  } catch (error) {
    console.error('Error getting diff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /config/deploy
 * Deploy one or more configuration versions
 */
router.post('/deploy', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Only admins can deploy
    if (!isAdmin(req)) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { versionIds, deploymentNotes } = req.body;

    if (!versionIds || !Array.isArray(versionIds) || versionIds.length === 0) {
      res.status(400).json({ error: 'versionIds array is required' });
      return;
    }

    const deployment = await configService.deployVersion(versionIds, userId, deploymentNotes);
    res.status(201).json(deployment);
  } catch (error) {
    console.error('Error deploying versions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * POST /config/rollback
 * Rollback a deployment
 */
router.post('/rollback', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Only admins can rollback
    if (!isAdmin(req)) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { deploymentId } = req.body;

    if (!deploymentId) {
      res.status(400).json({ error: 'deploymentId is required' });
      return;
    }

    const deployment = await configService.rollbackDeployment(deploymentId, userId);
    res.json(deployment);
  } catch (error) {
    console.error('Error rolling back deployment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * POST /config/promote
 * Promote a configuration to the next environment
 */
router.post('/promote', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Only admins can promote
    if (!isAdmin(req)) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { versionId, targetEnvironment } = req.body;

    if (!versionId || !targetEnvironment) {
      res.status(400).json({ error: 'versionId and targetEnvironment are required' });
      return;
    }

    if (!['staging', 'prod'].includes(targetEnvironment)) {
      res.status(400).json({ error: 'Invalid targetEnvironment' });
      return;
    }

    const promotedVersion = await configService.promoteToEnvironment(
      versionId,
      targetEnvironment,
      userId,
    );
    res.status(201).json(promotedVersion);
  } catch (error) {
    console.error('Error promoting version:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * GET /config/deployments
 * List deployments
 */
router.get('/deployments', authenticateToken, (req: AuthRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { environment, status } = req.query;

    const filters: {
      tenantId: string;
      environment?: string;
      status?: string;
    } = { tenantId };

    if (environment) filters.environment = environment as string;
    if (status) filters.status = status as string;

    const deployments = db.getConfigDeployments(filters);
    res.json({ deployments });
  } catch (error) {
    console.error('Error fetching deployments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /config/deployments/:id
 * Get a specific deployment
 */
router.get('/deployments/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const deployment = db.getConfigDeploymentById(id);
    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' });
      return;
    }

    // Check tenant access
    if (deployment.tenantId !== tenantId && !isAdmin(req)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(deployment);
  } catch (error) {
    console.error('Error fetching deployment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /config/approve
 * Approve a pending deployment
 */
router.post('/approve', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Only admins can approve
    if (!isAdmin(req)) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { deploymentId } = req.body;

    if (!deploymentId) {
      res.status(400).json({ error: 'deploymentId is required' });
      return;
    }

    const deployment = configService.approveDeployment(deploymentId, userId);
    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found or not in pending status' });
      return;
    }

    res.json(deployment);
  } catch (error) {
    console.error('Error approving deployment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /config/reject
 * Reject a pending deployment
 */
router.post('/reject', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Only admins can reject
    if (!isAdmin(req)) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { deploymentId } = req.body;

    if (!deploymentId) {
      res.status(400).json({ error: 'deploymentId is required' });
      return;
    }

    const deployment = configService.rejectDeployment(deploymentId, userId);
    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found or not in pending status' });
      return;
    }

    res.json(deployment);
  } catch (error) {
    console.error('Error rejecting deployment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /config/audit
 * Get configuration audit trail
 */
router.get('/audit', authenticateToken, (req: AuthRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { configType, configId, userId, action, limit } = req.query;

    const filters: {
      tenantId: string;
      configType?: string;
      configId?: string;
      userId?: string;
      action?: string;
      limit?: number;
    } = { tenantId };

    if (configType) filters.configType = configType as string;
    if (configId) filters.configId = configId as string;
    if (userId) filters.userId = userId as string;
    if (action) filters.action = action as string;
    if (limit !== undefined) {
      const parsedLimit = Number.parseInt(limit as string, 10);
      if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
        res.status(400).json({ error: 'limit must be a positive integer' });
        return;
      }
      filters.limit = parsedLimit;
    }

    const auditTrail = configService.getAuditTrail(filters);
    res.json({ entries: auditTrail });
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /config/rules
 * List validation rules
 */
router.get('/rules', authenticateToken, (req: AuthRequest, res) => {
  try {
    // Only admins can view rules
    if (!isAdmin(req)) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { configType, isActive } = req.query;

    const filters: {
      configType?: string;
      isActive?: boolean;
    } = {};

    if (configType) filters.configType = configType as string;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const rules = db.getConfigValidationRules(filters);
    res.json({ rules });
  } catch (error) {
    console.error('Error fetching validation rules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /config/rules
 * Create a validation rule
 */
router.post('/rules', authenticateToken, (req: AuthRequest, res) => {
  try {
    // Only admins can create rules
    if (!isAdmin(req)) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { name, description, configType, ruleType, rule, severity } = req.body;

    if (!name || !configType || !ruleType || !rule || !severity) {
      res.status(400).json({
        error: 'name, configType, ruleType, rule, and severity are required',
      });
      return;
    }

    const validationRule = {
      id: randomUUID(),
      name,
      description: description || '',
      configType,
      ruleType,
      rule,
      severity,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = db.createConfigValidationRule(validationRule);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating validation rule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
