import express from 'express';
import { type AuthRequest, authenticateToken } from '../middleware/auth.js';
import { UiConfigService } from '../services/uiConfigService.js';

const router = express.Router();
const uiConfigService = new UiConfigService();

/**
 * GET /ui/bootstrap
 * Initial app configuration including user, permissions, menu, and defaults
 */
router.get('/bootstrap', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const bootstrapConfig = uiConfigService.getBootstrapConfig(userId);
    if (!bootstrapConfig) {
      res.status(404).json({ error: 'User configuration not found' });
      return;
    }

    // Generate ETag for caching
    const etag = uiConfigService.generateETag(bootstrapConfig);

    // Check if client has cached version
    const clientEtag = req.headers['if-none-match'];
    if (clientEtag && clientEtag === etag) {
      res.status(304).end();
      return;
    }

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'private, max-age=300'); // Cache for 5 minutes
    res.json(bootstrapConfig);
  } catch (error) {
    console.error('Error fetching bootstrap config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /ui/branding
 * Tenant branding configuration
 * Query params: ?tenantId=xxx (optional, defaults to authenticated user's tenant)
 */
router.get('/branding', authenticateToken, (req: AuthRequest, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || req.user?.tenantId;
    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID is required' });
      return;
    }

    // Verify user has access to this tenant
    if (req.user?.tenantId !== tenantId) {
      res.status(403).json({ error: 'Access denied to tenant branding' });
      return;
    }

    const brandingConfig = uiConfigService.getBrandingConfig(tenantId);
    if (!brandingConfig) {
      res.status(404).json({ error: 'Branding configuration not found' });
      return;
    }

    // Generate ETag for caching
    const etag = uiConfigService.generateETag(brandingConfig);

    // Check if client has cached version
    const clientEtag = req.headers['if-none-match'];
    if (clientEtag && clientEtag === etag) {
      res.status(304).end();
      return;
    }

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.json(brandingConfig);
  } catch (error) {
    console.error('Error fetching branding config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /ui/routes/resolve
 * Route to page mapping
 * Query params: ?path=/dashboard
 */
router.get('/routes/resolve', authenticateToken, (req: AuthRequest, res) => {
  try {
    const path = req.query.path as string;
    if (!path) {
      res.status(400).json({ error: 'Path parameter is required' });
      return;
    }

    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get user permissions
    const userPermissions = req.user?.roles || [];
    const permissions = getUserPermissionsFromRoles(userPermissions);

    const routeConfig = uiConfigService.resolveRoute(path, tenantId, permissions);
    if (!routeConfig) {
      res.status(404).json({ error: 'Route not found or access denied' });
      return;
    }

    res.json(routeConfig);
  } catch (error) {
    console.error('Error resolving route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /ui/pages/:pageId
 * Page configuration by page ID
 */
router.get('/pages/:pageId', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { pageId } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get user permissions
    const userPermissions = req.user?.roles || [];
    const permissions = getUserPermissionsFromRoles(userPermissions);

    const pageConfig = uiConfigService.getPageConfig(pageId, tenantId, permissions);
    if (!pageConfig) {
      res.status(404).json({ error: 'Page configuration not found or access denied' });
      return;
    }

    // Generate ETag for caching
    const etag = uiConfigService.generateETag(pageConfig);

    // Check if client has cached version
    const clientEtag = req.headers['if-none-match'];
    if (clientEtag && clientEtag === etag) {
      res.status(304).end();
      return;
    }

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'private, max-age=600'); // Cache for 10 minutes
    res.json(pageConfig);
  } catch (error) {
    console.error('Error fetching page config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Helper function to get permissions from roles
 */
function getUserPermissionsFromRoles(roles: string[]): string[] {
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
    ],
    user: ['dashboard.view', 'users.view', 'settings.view'],
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

export default router;
