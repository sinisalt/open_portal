/**
 * Template Interpolation Utility
 *
 * Resolves template expressions in action parameters using context data
 */

import type { ActionContext } from '@/types/action.types';

/**
 * Template pattern for interpolation (e.g., {{pageState.value}})
 */
const TEMPLATE_PATTERN = /\{\{([^}]+)\}\}/g;

/**
 * Get value from nested object path
 * @param obj - Object to query
 * @param path - Dot-separated path (e.g., "user.name")
 * @returns Value at path or undefined
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!path || typeof path !== 'string') {
    return undefined;
  }

  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Set value in nested object path
 * @param obj - Object to modify
 * @param path - Dot-separated path (e.g., "user.name")
 * @param value - Value to set
 * @param merge - Whether to merge objects (default: true)
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
  merge = true
): void {
  if (!path || typeof path !== 'string') {
    return;
  }

  const parts = path.split('.');
  const lastPart = parts.pop();

  if (!lastPart) {
    return;
  }

  let current: Record<string, unknown> = obj;

  // Navigate to parent
  for (const part of parts) {
    if (!(part in current)) {
      current[part] = {};
    }

    const next = current[part];
    if (typeof next !== 'object' || next === null) {
      current[part] = {};
    }

    current = current[part] as Record<string, unknown>;
  }

  // Set value
  if (merge && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const existing = current[lastPart];
    if (typeof existing === 'object' && existing !== null && !Array.isArray(existing)) {
      current[lastPart] = { ...existing, ...(value as Record<string, unknown>) };
    } else {
      current[lastPart] = value;
    }
  } else {
    current[lastPart] = value;
  }
}

/**
 * Resolve template expression
 * @param template - Template string (e.g., "{{pageState.value}}")
 * @param context - Action context
 * @returns Resolved value
 */
export function resolveTemplate(template: string, context: ActionContext): unknown {
  if (!template || typeof template !== 'string') {
    return template;
  }

  // Check if entire string is a single template expression
  const singleMatch = template.match(/^\{\{([^}]+)\}\}$/);
  if (singleMatch) {
    const path = singleMatch[1].trim();
    return resolveContextPath(path, context);
  }

  // Replace all template expressions in string
  return template.replace(TEMPLATE_PATTERN, (match, path) => {
    const value = resolveContextPath(path.trim(), context);
    return String(value ?? '');
  });
}

/**
 * Resolve context path (e.g., "pageState.value" or "user.name")
 * @param path - Context path
 * @param context - Action context
 * @returns Resolved value
 */
function resolveContextPath(path: string, context: ActionContext): unknown {
  // Split into context type and property path
  const [contextType, ...rest] = path.split('.');
  const propertyPath = rest.join('.');

  switch (contextType) {
    case 'pageState':
      return propertyPath ? getNestedValue(context.pageState, propertyPath) : context.pageState;

    case 'formData':
      return propertyPath ? getNestedValue(context.formData, propertyPath) : context.formData;

    case 'widgetStates':
      return propertyPath
        ? getNestedValue(context.widgetStates, propertyPath)
        : context.widgetStates;

    case 'user':
      return propertyPath ? getNestedValue(context.user, propertyPath) : context.user;

    case 'permissions':
      return context.permissions;

    case 'tenant':
      return propertyPath ? getNestedValue(context.tenant, propertyPath) : context.tenant;

    case 'routeParams':
      return propertyPath ? getNestedValue(context.routeParams, propertyPath) : context.routeParams;

    case 'queryParams':
      return propertyPath ? getNestedValue(context.queryParams, propertyPath) : context.queryParams;

    case 'currentPath':
      return context.currentPath;

    case 'trigger':
      return propertyPath ? getNestedValue(context.trigger, propertyPath) : context.trigger;

    default:
      // Try to resolve from root context
      return getNestedValue(context, path);
  }
}

/**
 * Resolve all templates in an object recursively
 * @param obj - Object with potential template strings
 * @param context - Action context
 * @returns Object with resolved templates
 */
export function resolveTemplatesInObject<T>(obj: T, context: ActionContext): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return resolveTemplate(obj, context) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveTemplatesInObject(item, context)) as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveTemplatesInObject(value, context);
    }
    return result as T;
  }

  return obj;
}

/**
 * Evaluate condition expression
 * @param condition - Condition string (e.g., "{{pageState.isAdmin}}" or "{{user.id}} === '123'")
 * @param context - Action context
 * @returns Boolean result
 */
export function evaluateCondition(condition: string, context: ActionContext): boolean {
  if (!condition || typeof condition !== 'string') {
    return true;
  }

  // First resolve any templates in the condition
  const resolved = resolveTemplate(condition, context);

  // If resolved to a boolean, return it
  if (typeof resolved === 'boolean') {
    return resolved;
  }

  // If resolved to a string, try to evaluate as boolean
  if (typeof resolved === 'string') {
    const lower = resolved.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }

  // Otherwise, return truthy value
  return Boolean(resolved);
}
