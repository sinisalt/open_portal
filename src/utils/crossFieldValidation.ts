/**
 * Cross-Field Validation System
 *
 * Provides validation rules that depend on multiple form fields, including
 * field comparison, date range validation, and custom cross-field logic.
 */

import type { ValidationResult } from '@/types/form.types';

/**
 * Cross-field validation rule configuration
 */
export interface CrossFieldValidationRule {
  /** Fields this validation depends on */
  dependencies: string[];

  /** Validation function */
  validate: (value: unknown, formData: Record<string, unknown>) => string | true;

  /** Error message */
  message?: string;
}

/**
 * Compare two date values
 *
 * @param date1 - First date (string or Date)
 * @param date2 - Second date (string or Date)
 * @returns Comparison result (-1, 0, 1)
 */
function compareDates(date1: unknown, date2: unknown): number {
  const d1 = date1 instanceof Date ? date1 : new Date(date1 as string);
  const d2 = date2 instanceof Date ? date2 : new Date(date2 as string);

  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
    return 0;
  }

  return d1.getTime() - d2.getTime();
}

/**
 * Validate that end date is after start date
 *
 * @param endDateField - End date field name
 * @param startDateField - Start date field name
 * @param message - Custom error message
 */
export function validateDateRange(
  endDateField: string,
  startDateField: string,
  message?: string
): CrossFieldValidationRule {
  return {
    dependencies: [startDateField],
    validate: (endDateValue, formData) => {
      const startDateValue = formData[startDateField];

      // Skip validation if either date is empty
      if (!endDateValue || !startDateValue) {
        return true;
      }

      const comparison = compareDates(endDateValue, startDateValue);

      if (comparison <= 0) {
        return message || `End date must be after start date`;
      }

      return true;
    },
    message,
  };
}

/**
 * Validate that a date is after another date
 *
 * @param value - Date value to validate
 * @param otherField - Field name to compare against
 * @param formData - Form data
 * @param message - Custom error message
 */
export function validateAfterDate(
  value: unknown,
  otherField: string,
  formData: Record<string, unknown>,
  message?: string
): ValidationResult {
  const otherValue = formData[otherField];

  if (!value || !otherValue) {
    return { valid: true };
  }

  const comparison = compareDates(value, otherValue);

  if (comparison <= 0) {
    return {
      valid: false,
      error: message || `Must be after ${otherField}`,
    };
  }

  return { valid: true };
}

/**
 * Validate that a date is before another date
 *
 * @param value - Date value to validate
 * @param otherField - Field name to compare against
 * @param formData - Form data
 * @param message - Custom error message
 */
export function validateBeforeDate(
  value: unknown,
  otherField: string,
  formData: Record<string, unknown>,
  message?: string
): ValidationResult {
  const otherValue = formData[otherField];

  if (!value || !otherValue) {
    return { valid: true };
  }

  const comparison = compareDates(value, otherValue);

  if (comparison >= 0) {
    return {
      valid: false,
      error: message || `Must be before ${otherField}`,
    };
  }

  return { valid: true };
}

/**
 * Validate that a number is greater than another field
 *
 * @param value - Value to validate
 * @param otherField - Field name to compare against
 * @param formData - Form data
 * @param message - Custom error message
 */
export function validateGreaterThan(
  value: unknown,
  otherField: string,
  formData: Record<string, unknown>,
  message?: string
): ValidationResult {
  const otherValue = formData[otherField];

  if (value === null || value === undefined || otherValue === null || otherValue === undefined) {
    return { valid: true };
  }

  const numValue = Number(value);
  const numOther = Number(otherValue);

  if (Number.isNaN(numValue) || Number.isNaN(numOther)) {
    return { valid: true };
  }

  if (numValue <= numOther) {
    return {
      valid: false,
      error: message || `Must be greater than ${otherField}`,
    };
  }

  return { valid: true };
}

/**
 * Validate that a number is less than another field
 *
 * @param value - Value to validate
 * @param otherField - Field name to compare against
 * @param formData - Form data
 * @param message - Custom error message
 */
export function validateLessThan(
  value: unknown,
  otherField: string,
  formData: Record<string, unknown>,
  message?: string
): ValidationResult {
  const otherValue = formData[otherField];

  if (value === null || value === undefined || otherValue === null || otherValue === undefined) {
    return { valid: true };
  }

  const numValue = Number(value);
  const numOther = Number(otherValue);

  if (Number.isNaN(numValue) || Number.isNaN(numOther)) {
    return { valid: true };
  }

  if (numValue >= numOther) {
    return {
      valid: false,
      error: message || `Must be less than ${otherField}`,
    };
  }

  return { valid: true };
}

/**
 * Validate that values in two fields match
 *
 * @param value - Value to validate
 * @param otherField - Field name to compare against
 * @param formData - Form data
 * @param message - Custom error message
 */
export function validateFieldMatch(
  value: unknown,
  otherField: string,
  formData: Record<string, unknown>,
  message?: string
): ValidationResult {
  const otherValue = formData[otherField];

  if (value !== otherValue) {
    return {
      valid: false,
      error: message || `Must match ${otherField}`,
    };
  }

  return { valid: true };
}

/**
 * Validate password confirmation
 *
 * @param confirmValue - Confirmation password value
 * @param passwordField - Password field name
 * @param formData - Form data
 */
export function validatePasswordConfirmation(
  confirmValue: unknown,
  passwordField: string,
  formData: Record<string, unknown>
): ValidationResult {
  return validateFieldMatch(confirmValue, passwordField, formData, 'Passwords must match');
}

/**
 * Validate that at least one of multiple fields is filled
 *
 * @param fields - Array of field names
 * @param formData - Form data
 * @param message - Custom error message
 */
export function validateAtLeastOne(
  fields: string[],
  formData: Record<string, unknown>,
  message?: string
): ValidationResult {
  const hasValue = fields.some(field => {
    const value = formData[field];
    return value !== null && value !== undefined && value !== '';
  });

  if (!hasValue) {
    return {
      valid: false,
      error: message || `At least one of ${fields.join(', ')} is required`,
    };
  }

  return { valid: true };
}

/**
 * Validate that either all or none of the fields are filled
 *
 * @param fields - Array of field names
 * @param formData - Form data
 * @param message - Custom error message
 */
export function validateAllOrNone(
  fields: string[],
  formData: Record<string, unknown>,
  message?: string
): ValidationResult {
  const filledFields = fields.filter(field => {
    const value = formData[field];
    return value !== null && value !== undefined && value !== '';
  });

  if (filledFields.length > 0 && filledFields.length < fields.length) {
    return {
      valid: false,
      error: message || `Either fill all or none of ${fields.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate conditional required field
 *
 * Field is required only if a condition based on another field is met
 *
 * @param value - Value to validate
 * @param conditionField - Field name for condition
 * @param conditionValue - Value that triggers requirement
 * @param formData - Form data
 * @param message - Custom error message
 */
export function validateConditionalRequired(
  value: unknown,
  conditionField: string,
  conditionValue: unknown,
  formData: Record<string, unknown>,
  message?: string
): ValidationResult {
  const fieldValue = formData[conditionField];

  // If condition is met, field is required
  if (fieldValue === conditionValue) {
    const isEmpty = value === null || value === undefined || value === '';

    if (isEmpty) {
      return {
        valid: false,
        error: message || 'This field is required',
      };
    }
  }

  return { valid: true };
}

/**
 * Validate sum of multiple fields
 *
 * @param value - Value to validate (expected sum)
 * @param fields - Fields to sum
 * @param formData - Form data
 * @param message - Custom error message
 */
export function validateSum(
  value: unknown,
  fields: string[],
  formData: Record<string, unknown>,
  message?: string
): ValidationResult {
  const numValue = Number(value);

  if (Number.isNaN(numValue)) {
    return { valid: true };
  }

  const sum = fields.reduce((acc, field) => {
    const fieldValue = formData[field];
    const num = Number(fieldValue);
    return acc + (Number.isNaN(num) ? 0 : num);
  }, 0);

  if (Math.abs(numValue - sum) > 0.01) {
    // Allow small floating point differences
    return {
      valid: false,
      error: message || `Must equal the sum of ${fields.join(', ')} (${sum})`,
    };
  }

  return { valid: true };
}

/**
 * Create a custom cross-field validation rule
 *
 * @param dependencies - Array of field names this validation depends on
 * @param validate - Validation function
 * @param message - Error message
 */
export function createCrossFieldRule(
  dependencies: string[],
  validate: (value: unknown, formData: Record<string, unknown>) => boolean | string,
  message?: string
): CrossFieldValidationRule {
  return {
    dependencies,
    validate: (value, formData) => {
      const result = validate(value, formData);

      if (result === false) {
        return message || 'Validation failed';
      }

      return result;
    },
    message,
  };
}

/**
 * Get all field dependencies for cross-field validations
 *
 * @param rules - Array of cross-field validation rules
 */
export function getCrossFieldDependencies(rules: CrossFieldValidationRule[]): string[] {
  const deps = new Set<string>();

  for (const rule of rules) {
    for (const dep of rule.dependencies) {
      deps.add(dep);
    }
  }

  return Array.from(deps);
}

/**
 * Execute cross-field validation rules
 *
 * @param fieldName - Field being validated
 * @param value - Field value
 * @param rules - Cross-field validation rules
 * @param formData - Complete form data
 */
export function executeCrossFieldValidation(
  fieldName: string,
  value: unknown,
  rules: CrossFieldValidationRule[],
  formData: Record<string, unknown>
): ValidationResult {
  for (const rule of rules) {
    const result = rule.validate(value, formData);

    if (result !== true) {
      return {
        valid: false,
        error: result,
      };
    }
  }

  return { valid: true };
}
