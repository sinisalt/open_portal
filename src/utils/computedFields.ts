/**
 * Computed Fields System
 *
 * Provides automatic field value calculation based on expressions and
 * dependencies on other form fields.
 */

import { getNestedValue } from '@/core/actions/templateUtils';

/**
 * Computed field configuration
 */
export interface ComputedFieldConfig {
  /** Expression to compute the value */
  expression: string | ((formData: Record<string, unknown>) => unknown);

  /** Field dependencies for reactive updates */
  dependencies?: string[];

  /** Format function for display value */
  format?: (value: unknown) => string;

  /** Precision for numeric values */
  precision?: number;

  /** Whether to update on every dependency change (default: true) */
  reactive?: boolean;
}

/**
 * Computed field context
 */
export interface ComputedFieldContext {
  /** Form data */
  formData: Record<string, unknown>;

  /** Page state */
  pageState?: Record<string, unknown>;

  /** Datasource data */
  datasources?: Record<string, unknown>;

  /** Custom context data */
  [key: string]: unknown;
}

/**
 * Evaluate a computed field expression
 *
 * Supports:
 * - Template expressions: `{{formData.quantity}} * {{formData.price}}`
 * - Simple math: `{{formData.a}} + {{formData.b}}`
 * - Complex expressions: `({{formData.subtotal}} * {{formData.taxRate}}) + {{formData.shipping}}`
 * - String concatenation: `{{formData.firstName}} + " " + {{formData.lastName}}`
 * - Function expressions: Custom function that receives formData
 *
 * @param config - Computed field configuration
 * @param context - Evaluation context
 * @returns Computed value
 */
export function evaluateComputedField(
  config: ComputedFieldConfig,
  context: ComputedFieldContext
): unknown {
  const { expression, format, precision } = config;

  // If expression is a function, call it directly
  if (typeof expression === 'function') {
    const result = expression(context.formData);
    return formatComputedValue(result, format, precision);
  }

  // Otherwise, evaluate as template expression
  const resolved = resolveComputedExpression(expression, context);
  const evaluated = evaluateComputedExpression(resolved);

  return formatComputedValue(evaluated, format, precision);
}

/**
 * Resolve template variables in computed expression
 *
 * @param expression - Expression with template variables
 * @param context - Evaluation context
 * @returns Expression with resolved values
 */
export function resolveComputedExpression(
  expression: string,
  context: ComputedFieldContext
): string {
  const templatePattern = /\{\{([^}]+)\}\}/g;

  return expression.replace(templatePattern, (_match, path) => {
    const trimmedPath = path.trim();
    const value = getNestedValue(context, trimmedPath);

    // Convert value to JavaScript literal
    if (value === null || value === undefined) {
      return '0'; // Treat null/undefined as 0 for math operations
    }
    if (typeof value === 'string') {
      // For strings, escape quotes and wrap
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'boolean') {
      return String(value);
    }

    return String(value);
  });
}

/**
 * Safely evaluate a computed expression
 *
 * @param expression - JavaScript expression
 * @returns Evaluated result
 */
export function evaluateComputedExpression(expression: string): unknown {
  // Sanitize expression - allow math, comparison, logical operators, ternary, strings, numbers
  const safePattern = /^[\s\d+\-*/<>=!&|()."'\w,[\]%:?]+$/;

  if (!safePattern.test(expression)) {
    console.warn(`Unsafe computed expression: ${expression}`);
    return null;
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
      console.warn(`Computed expression contains dangerous keyword: ${keyword}`);
      return null;
    }
  }

  // Evaluate expression
  try {
    const result = new Function(`'use strict'; return (${expression});`)();
    return result;
  } catch (error) {
    console.error(`Failed to evaluate computed expression: ${expression}`, error);
    return null;
  }
}

/**
 * Format computed value for display
 *
 * @param value - Raw computed value
 * @param format - Format function
 * @param precision - Numeric precision
 * @returns Formatted value
 */
export function formatComputedValue(
  value: unknown,
  format?: (value: unknown) => string,
  precision?: number
): unknown {
  // Apply custom format function if provided
  if (format) {
    return format(value);
  }

  // Apply precision to numbers
  if (typeof value === 'number' && precision !== undefined) {
    return Number(value.toFixed(precision));
  }

  return value;
}

/**
 * Extract field dependencies from computed expression
 *
 * Parses {{formData.field}} patterns to find field names
 *
 * @param expression - Computed expression (string or function)
 * @returns Array of field names
 */
export function getComputedDependencies(
  expression: string | ((formData: Record<string, unknown>) => unknown)
): string[] {
  // If expression is a function, we can't extract dependencies automatically
  if (typeof expression === 'function') {
    return [];
  }

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
 * Check if a field value has changed and affects computed fields
 *
 * @param fieldName - Field that changed
 * @param computedFields - Map of computed field configurations
 * @returns Array of computed field names that should be recalculated
 */
export function getAffectedComputedFields(
  fieldName: string,
  computedFields: Record<string, ComputedFieldConfig>
): string[] {
  const affected: string[] = [];

  for (const [computedFieldName, config] of Object.entries(computedFields)) {
    // Skip non-reactive fields
    if (config.reactive === false) {
      continue;
    }

    // Check explicit dependencies
    if (config.dependencies?.includes(fieldName)) {
      affected.push(computedFieldName);
      continue;
    }

    // Check extracted dependencies (for expression strings)
    if (typeof config.expression === 'string') {
      const deps = getComputedDependencies(config.expression);
      if (deps.includes(fieldName)) {
        affected.push(computedFieldName);
      }
    }
  }

  return affected;
}

/**
 * Update all computed fields in form data
 *
 * @param formData - Current form data
 * @param computedFields - Map of computed field configurations
 * @param context - Additional context data
 * @returns Updated form data with computed values
 */
export function updateComputedFields(
  formData: Record<string, unknown>,
  computedFields: Record<string, ComputedFieldConfig>,
  context?: Partial<ComputedFieldContext>
): Record<string, unknown> {
  const updated = { ...formData };
  const computedContext: ComputedFieldContext = {
    formData: updated,
    ...context,
  };

  for (const [fieldName, config] of Object.entries(computedFields)) {
    const value = evaluateComputedField(config, computedContext);
    updated[fieldName] = value;
  }

  return updated;
}

/**
 * Update specific computed fields based on changed field
 *
 * More efficient than updating all computed fields
 *
 * @param fieldName - Field that changed
 * @param formData - Current form data
 * @param computedFields - Map of computed field configurations
 * @param context - Additional context data
 * @returns Updated form data with affected computed values
 */
export function updateAffectedComputedFields(
  fieldName: string,
  formData: Record<string, unknown>,
  computedFields: Record<string, ComputedFieldConfig>,
  context?: Partial<ComputedFieldContext>
): Record<string, unknown> {
  const affected = getAffectedComputedFields(fieldName, computedFields);

  if (affected.length === 0) {
    return formData;
  }

  const updated = { ...formData };
  const computedContext: ComputedFieldContext = {
    formData: updated,
    ...context,
  };

  for (const computedFieldName of affected) {
    const config = computedFields[computedFieldName];
    const value = evaluateComputedField(config, computedContext);
    updated[computedFieldName] = value;
  }

  return updated;
}

/**
 * Common computed field helpers
 */

/**
 * Create a sum computed field
 *
 * @param fields - Array of field names to sum
 * @param precision - Decimal precision (default: 2)
 */
export function createSumField(fields: string[], precision = 2): ComputedFieldConfig {
  return {
    expression: fields.map(f => `{{formData.${f}}}`).join(' + '),
    dependencies: fields,
    precision,
  };
}

/**
 * Create a product computed field
 *
 * @param field1 - First field name
 * @param field2 - Second field name
 * @param precision - Decimal precision (default: 2)
 */
export function createProductField(
  field1: string,
  field2: string,
  precision = 2
): ComputedFieldConfig {
  return {
    expression: `{{formData.${field1}}} * {{formData.${field2}}}`,
    dependencies: [field1, field2],
    precision,
  };
}

/**
 * Create a percentage computed field
 *
 * @param valueField - Value field name
 * @param totalField - Total field name
 * @param precision - Decimal precision (default: 2)
 */
export function createPercentageField(
  valueField: string,
  totalField: string,
  precision = 2
): ComputedFieldConfig {
  return {
    expression: `({{formData.${valueField}}} / {{formData.${totalField}}}) * 100`,
    dependencies: [valueField, totalField],
    precision,
    format: value => (typeof value === 'number' ? `${value.toFixed(precision)}%` : '0%'),
  };
}

/**
 * Create a concatenation computed field
 *
 * @param fields - Array of field names to concatenate
 * @param separator - Separator string (default: " ")
 */
export function createConcatField(fields: string[], separator = ' '): ComputedFieldConfig {
  return {
    expression: fields.map(f => `{{formData.${f}}}`).join(` + "${separator}" + `),
    dependencies: fields,
  };
}

/**
 * Create a conditional computed field
 *
 * @param conditionField - Field to check condition
 * @param conditionValue - Value to match
 * @param trueValue - Value when condition is true
 * @param falseValue - Value when condition is false
 */
export function createConditionalField(
  conditionField: string,
  conditionValue: unknown,
  trueValue: unknown,
  falseValue: unknown
): ComputedFieldConfig {
  const condValueStr = typeof conditionValue === 'string' ? `"${conditionValue}"` : conditionValue;
  const trueValueStr = typeof trueValue === 'string' ? `"${trueValue}"` : trueValue;
  const falseValueStr = typeof falseValue === 'string' ? `"${falseValue}"` : falseValue;

  return {
    expression: `{{formData.${conditionField}}} === ${condValueStr} ? ${trueValueStr} : ${falseValueStr}`,
    dependencies: [conditionField],
  };
}
