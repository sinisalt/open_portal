/**
 * Route Resolver Service
 *
 * Service for resolving URL paths to page configurations with:
 * - Pattern matching (static and dynamic routes)
 * - Parameter extraction
 * - Permission-based filtering
 * - Redirect handling
 */

import type {
  RouteConfig,
  RouteError,
  RouteErrorType,
  RouteMatch,
  RouteParams,
  RouteResolution,
  RouteResolverOptions,
} from '@/types/route.types';

/**
 * Compile a route pattern into a regex and parameter names
 */
function compilePattern(pattern: string): {
  regex: RegExp;
  paramNames: string[];
} {
  // Normalize pattern: remove trailing slash unless it's root
  const normalizedPattern = pattern === '/' ? pattern : pattern.replace(/\/$/, '');

  const paramNames: string[] = [];
  let regexPattern = normalizedPattern;

  // Replace :param with named capture groups
  // Match :paramName or :paramName? (optional)
  regexPattern = regexPattern.replace(
    /\/:([a-zA-Z_][a-zA-Z0-9_]*)(\?)?/g,
    (_, paramName, optional) => {
      paramNames.push(paramName);
      // Optional params: (?:/([^/]+))? (optional slash + param) or required: /([^/]+)
      return optional ? '(?:/([^/]+))?' : '/([^/]+)';
    }
  );

  // Replace * wildcard with greedy capture
  regexPattern = regexPattern.replace(/\*/g, '(.*)');

  // Exact match: must match entire path
  regexPattern = `^${regexPattern}$`;

  return {
    regex: new RegExp(regexPattern),
    paramNames,
  };
}

/**
 * Match a path against a route pattern
 */
function matchRoute(path: string, route: RouteConfig): RouteMatch {
  // Normalize path: remove trailing slash unless it's root
  const normalizedPath = path === '/' ? path : path.replace(/\/$/, '');

  const { regex, paramNames } = compilePattern(route.pattern);
  const match = regex.exec(normalizedPath);

  if (!match) {
    return {
      matches: false,
      params: {},
      route,
    };
  }

  // Extract parameters from regex groups
  const params: RouteParams = {};
  for (let i = 0; i < paramNames.length; i++) {
    const value = match[i + 1]; // match[0] is full match, params start at [1]
    // Only set param if it has a value (handles optional params)
    if (value !== undefined) {
      params[paramNames[i]] = value;
    }
  }

  return {
    matches: true,
    params,
    route,
  };
}

/**
 * Check if user has required permissions for a route
 */
function hasRoutePermissions(route: RouteConfig, userPermissions: string[] = []): boolean {
  // No permissions required
  if (!route.permissions || route.permissions.length === 0) {
    return true;
  }

  // Check if user has all required permissions
  return route.permissions.every(permission => userPermissions.includes(permission));
}

/**
 * Sort routes by priority for matching
 * Higher priority first, then by specificity (fewer wildcards/params)
 */
function sortRoutesByPriority(routes: RouteConfig[]): RouteConfig[] {
  return [...routes].sort((a, b) => {
    // Sort by explicit priority first
    const priorityA = a.priority ?? 0;
    const priorityB = b.priority ?? 0;

    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }

    // Then by specificity (exact > dynamic > wildcard)
    const specificityA = getRouteSpecificity(a.pattern);
    const specificityB = getRouteSpecificity(b.pattern);

    return specificityB - specificityA; // More specific first
  });
}

/**
 * Calculate route specificity for sorting
 * Higher values = more specific
 */
function getRouteSpecificity(pattern: string): number {
  let specificity = 0;

  // Static segments are most specific
  const staticSegments = pattern.split('/').filter(s => s && !s.startsWith(':') && s !== '*');
  specificity += staticSegments.length * 100;

  // Dynamic params are less specific
  const dynamicParams = (pattern.match(/:[a-zA-Z_][a-zA-Z0-9_]*/g) || []).length;
  specificity += dynamicParams * 10;

  // Optional params are even less specific
  const optionalParams = (pattern.match(/:[a-zA-Z_][a-zA-Z0-9_]*\?/g) || []).length;
  specificity -= optionalParams * 5;

  // Wildcards are least specific
  const wildcards = (pattern.match(/\*/g) || []).length;
  specificity -= wildcards * 50;

  return specificity;
}

/**
 * Resolve a path to a route configuration
 */
export function resolveRoute(
  path: string,
  routes: RouteConfig[],
  options: RouteResolverOptions = {}
): RouteResolution {
  const { permissions = [], includeUnauthorized = false } = options;

  // Sort routes by priority
  const sortedRoutes = sortRoutesByPriority(routes);

  // Try to match path against each route
  for (const route of sortedRoutes) {
    const match = matchRoute(path, route);

    if (!match.matches) {
      continue;
    }

    // Check permissions
    const hasPermission = hasRoutePermissions(route, permissions);

    if (!hasPermission && !includeUnauthorized) {
      // User doesn't have permission, continue to next route
      continue;
    }

    // Found a match!
    return {
      pageId: route.pageId,
      params: match.params,
      metadata: route.metadata,
      hasPermission,
      redirect: route.redirect,
      route,
    };
  }

  // No route matched - throw 404 error
  const RouteErrorClass = Error as unknown as new (
    message: string,
    type: string,
    path?: string
  ) => RouteError;

  throw new RouteErrorClass(
    `No route found for path: ${path}`,
    'NOT_FOUND' as RouteErrorType,
    path
  );
}

/**
 * Check if path matches a specific route pattern
 */
export function matchesPattern(path: string, pattern: string): boolean {
  // Normalize path: remove trailing slash unless it's root
  const normalizedPath = path === '/' ? path : path.replace(/\/$/, '');
  const { regex } = compilePattern(pattern);
  return regex.test(normalizedPath);
}

/**
 * Extract parameters from a path using a route pattern
 */
export function extractParams(path: string, pattern: string): RouteParams {
  // Normalize path: remove trailing slash unless it's root
  const normalizedPath = path === '/' ? path : path.replace(/\/$/, '');
  const { regex, paramNames } = compilePattern(pattern);
  const match = regex.exec(normalizedPath);

  if (!match) {
    return {};
  }

  const params: RouteParams = {};
  for (let i = 0; i < paramNames.length; i++) {
    const value = match[i + 1];
    if (value !== undefined) {
      params[paramNames[i]] = value;
    }
  }

  return params;
}

/**
 * Build a path from a pattern and parameters
 */
export function buildPath(pattern: string, params: RouteParams = {}): string {
  let path = pattern;

  // Replace :param with actual values
  path = path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)(\?)?/g, (_, paramName) => {
    const value = params[paramName];
    return value !== undefined ? String(value) : '';
  });

  // Clean up any double slashes
  path = path.replace(/\/+/g, '/');

  // Remove trailing slash unless root
  if (path !== '/') {
    path = path.replace(/\/$/, '');
  }

  return path;
}

/**
 * Validate route configuration
 */
export function validateRouteConfig(route: RouteConfig): boolean {
  // Must have pattern and pageId
  if (!route.pattern || !route.pageId) {
    return false;
  }

  // Pattern must start with /
  if (!route.pattern.startsWith('/')) {
    return false;
  }

  // Can't have both redirect and pageId
  if (route.redirect && route.pageId && route.redirect !== route.pageId) {
    return false;
  }

  return true;
}

/**
 * Filter routes by user permissions
 */
export function filterRoutesByPermission(
  routes: RouteConfig[],
  permissions: string[] = []
): RouteConfig[] {
  return routes.filter(route => hasRoutePermissions(route, permissions));
}

/**
 * Detect circular redirects in route configuration
 */
export function detectCircularRedirects(routes: RouteConfig[]): string[] {
  const circularPaths: string[] = [];

  for (const route of routes) {
    if (!route.redirect) {
      continue;
    }

    const visited = new Set<string>([route.pattern]);
    let currentPattern = route.redirect;
    let depth = 0;
    const maxDepth = routes.length + 1;

    while (depth < maxDepth) {
      if (visited.has(currentPattern)) {
        circularPaths.push(route.pattern);
        break;
      }

      visited.add(currentPattern);

      // Find next redirect
      const nextRoute = routes.find(r => r.pattern === currentPattern);
      if (!nextRoute || !nextRoute.redirect) {
        break;
      }

      currentPattern = nextRoute.redirect;
      depth++;
    }
  }

  return circularPaths;
}
