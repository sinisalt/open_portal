/**
 * Conditional Visibility System
 *
 * Evaluates conditional expressions for widget visibility based on form state,
 * permissions, and other contextual data.
 */

import { getNestedValue } from '@/core/actions/templateUtils';

/**
 * Visibility condition configuration
 */
export interface VisibilityCondition {
  /** Condition expression (supports boolean or template expressions) */
  condition?: string | boolean;

  /** Field dependencies for reactive updates */
  dependencies?: string[];

  /** Permission-based visibility */
  permissions?: string[];

  /** Role-based visibility */
  roles?: string[];
}

/**
 * Visibility evaluation context
 */
export interface VisibilityContext {
  /** Form data */
  formData?: Record<string, unknown>;

  /** Page state */
  pageState?: Record<string, unknown>;

  /** User permissions */
  permissions?: string[];

  /** User roles */
  roles?: string[];

  /** Datasource data */
  datasources?: Record<string, unknown>;

  /** Custom context data */
  [key: string]: unknown;
}

/**
 * Evaluate a conditional visibility expression
 *
 * Supports:
 * - Boolean values: `true`, `false`
 * - Simple comparisons: `{{formData.status}} === 'active'`
 * - Complex expressions: `{{formData.age}} >= 18 && {{formData.country}} === 'US'`
 * - Template references: `{{formData.field}}`
 *
 * @param condition - Visibility condition configuration
 * @param context - Evaluation context
 * @returns true if widget should be visible, false otherwise
 */
export function evaluateVisibility(
  condition: VisibilityCondition | string | boolean | undefined,
  context: VisibilityContext = {}
): boolean {
  // If no condition, widget is visible by default
  if (condition === undefined || condition === null) {
    return true;
  }

  // Handle direct boolean
  if (typeof condition === 'boolean') {
    return condition;
  }

  // Handle string expression
  if (typeof condition === 'string') {
    return evaluateExpression(condition, context);
  }

  // Handle condition object
  const conditionObj = condition as VisibilityCondition;

  // Check permissions
  if (conditionObj.permissions && conditionObj.permissions.length > 0) {
    const hasPermission = conditionObj.permissions.some(permission =>
      context.permissions?.includes(permission)
    );
    if (!hasPermission) {
      return false;
    }
  }

  // Check roles
  if (conditionObj.roles && conditionObj.roles.length > 0) {
    const hasRole = conditionObj.roles.some(role => context.roles?.includes(role));
    if (!hasRole) {
      return false;
    }
  }

  // Check condition expression
  if (conditionObj.condition !== undefined) {
    return evaluateVisibility(conditionObj.condition, context);
  }

  return true;
}

/**
 * Evaluate a template expression and convert to boolean
 *
 * @param expression - Expression string
 * @param context - Evaluation context
 * @returns Evaluated boolean result
 */
export function evaluateExpression(expression: string, context: VisibilityContext): boolean {
  if (!expression || typeof expression !== 'string') {
    return false;
  }

  // Resolve all template variables first
  const resolved = resolveTemplateVariables(expression, context);

  // Handle simple boolean strings
  if (resolved === 'true') {
    return true;
  }
  if (resolved === 'false') {
    return false;
  }

  // Try to evaluate as JavaScript expression (safely)
  try {
    return evaluateSafeExpression(resolved);
  } catch (error) {
    console.warn(`Failed to evaluate visibility expression: ${expression}`, error);
    return false;
  }
}

/**
 * Resolve template variables in expression
 *
 * Replaces {{path}} with actual values from context
 *
 * @param expression - Expression with template variables
 * @param context - Evaluation context
 * @returns Expression with resolved values
 */
export function resolveTemplateVariables(expression: string, context: VisibilityContext): string {
  const templatePattern = /\{\{([^}]+)\}\}/g;

  return expression.replace(templatePattern, (match, path) => {
    const trimmedPath = path.trim();
    const value = getNestedValue(context, trimmedPath);

    // Convert value to JavaScript literal
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'string') {
      // Escape quotes and wrap in quotes
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  });
}

/**
 * Safely evaluate a JavaScript expression
 *
 * Uses Function constructor with restricted scope to prevent arbitrary code execution
 *
 * @param expression - JavaScript expression to evaluate
 * @returns Evaluation result as boolean
 */
export function evaluateSafeExpression(expression: string): boolean {
  // Sanitize expression - only allow safe operators and literals
  const safePattern = /^[\s\d+\-*/<>=!&|()."'\w,[\]]+$/;

  if (!safePattern.test(expression)) {
    throw new Error(`Unsafe expression: ${expression}`);
  }

  // Disallow dangerous keywords
  const dangerousKeywords = [
    'eval',
    'Function',
    'constructor',
    'prototype',
    '__proto__',
    'import',
    'require',
    'process',
    'global',
    'window',
    'document',
  ];

  for (const keyword of dangerousKeywords) {
    if (expression.includes(keyword)) {
      throw new Error(`Expression contains dangerous keyword: ${keyword}`);
    }
  }

  // Evaluate in isolated scope
  try {
    // Create a function that returns the expression result
    // biome-ignore lint/security/noGlobalEval: Safe evaluation with sanitization
    const result = new Function(`'use strict'; return (${expression});`)();
    return Boolean(result);
  } catch (error) {
    throw new Error(`Failed to evaluate expression: ${expression} - ${error}`);
  }
}

/**
 * Get field dependencies from visibility condition
 *
 * Extracts field names from template expressions for reactive updates
 *
 * @param condition - Visibility condition
 * @returns Array of field names that condition depends on
 */
export function getVisibilityDependencies(
  condition: VisibilityCondition | string | boolean | undefined
): string[] {
  if (!condition || typeof condition === 'boolean') {
    return [];
  }

  if (typeof condition === 'string') {
    return extractFieldDependencies(condition);
  }

  const conditionObj = condition as VisibilityCondition;

  // Use explicit dependencies if provided
  if (conditionObj.dependencies && conditionObj.dependencies.length > 0) {
    return conditionObj.dependencies;
  }

  // Extract from condition expression
  if (conditionObj.condition && typeof conditionObj.condition === 'string') {
    return extractFieldDependencies(conditionObj.condition);
  }

  return [];
}

/**
 * Extract field dependencies from template expression
 *
 * Parses {{formData.field}} patterns to find field names
 *
 * @param expression - Template expression
 * @returns Array of field names
 */
export function extractFieldDependencies(expression: string): string[] {
  const templatePattern = /\{\{formData\.([^}.\s]+)(?:\.[^}]*)?\}\}/g;
  const dependencies = new Set<string>();

  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: Idiomatic regex pattern matching
  while ((match = templatePattern.exec(expression)) !== null) {
    dependencies.add(match[1]);
  }

  return Array.from(dependencies);
}

/**
 * Check if widget should be visible based on multiple conditions
 *
 * All conditions must evaluate to true for widget to be visible (AND logic)
 *
 * @param conditions - Array of visibility conditions
 * @param context - Evaluation context
 * @returns true if all conditions pass
 */
export function evaluateMultipleConditions(
  conditions: (VisibilityCondition | string | boolean)[],
  context: VisibilityContext
): boolean {
  return conditions.every(condition => evaluateVisibility(condition, context));
}

/**
 * Check if any condition evaluates to true (OR logic)
 *
 * @param conditions - Array of visibility conditions
 * @param context - Evaluation context
 * @returns true if any condition passes
 */
export function evaluateAnyCondition(
  conditions: (VisibilityCondition | string | boolean)[],
  context: VisibilityContext
): boolean {
  return conditions.some(condition => evaluateVisibility(condition, context));
}
