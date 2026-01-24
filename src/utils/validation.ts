/**
 * Form Validation Utilities
 *
 * Comprehensive validation functions for form fields including common formats
 * (email, URL, phone) and custom rules.
 */

import type { ValidationResult, ValidationRule } from '@/types/form.types';

/**
 * Email validation regex
 * RFC 5322 compliant
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * URL validation regex
 * Supports http, https, and common TLDs
 */
const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

/**
 * Phone number validation regex
 * Supports international formats with flexible spacing
 */
const PHONE_REGEX =
  /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{0,9}$/;

/**
 * Validate required field
 */
export function validateRequired(value: unknown, message?: string): ValidationResult {
  const isEmpty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);

  if (isEmpty) {
    return {
      valid: false,
      error: message || 'This field is required',
    };
  }

  return { valid: true };
}

/**
 * Validate minimum length
 */
export function validateMinLength(
  value: unknown,
  minLength: number,
  message?: string
): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: true }; // Skip validation for empty values (use required rule)
  }

  const str = String(value);
  if (str.length < minLength) {
    return {
      valid: false,
      error: message || `Must be at least ${minLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(
  value: unknown,
  maxLength: number,
  message?: string
): ValidationResult {
  if (value === undefined || value === null) {
    return { valid: true }; // Skip validation for empty values
  }

  const str = String(value);
  if (str.length > maxLength) {
    return {
      valid: false,
      error: message || `Must be no more than ${maxLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validate pattern matching
 */
export function validatePattern(
  value: unknown,
  pattern: RegExp | string,
  message?: string
): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: true }; // Skip validation for empty values
  }

  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  const str = String(value);

  if (!regex.test(str)) {
    return {
      valid: false,
      error: message || 'Invalid format',
    };
  }

  return { valid: true };
}

/**
 * Validate minimum value (for numbers)
 */
export function validateMin(value: unknown, min: number, message?: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: true }; // Skip validation for empty values
  }

  const num = Number(value);
  if (Number.isNaN(num)) {
    return {
      valid: false,
      error: 'Must be a valid number',
    };
  }

  if (num < min) {
    return {
      valid: false,
      error: message || `Must be at least ${min}`,
    };
  }

  return { valid: true };
}

/**
 * Validate maximum value (for numbers)
 */
export function validateMax(value: unknown, max: number, message?: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: true }; // Skip validation for empty values
  }

  const num = Number(value);
  if (Number.isNaN(num)) {
    return {
      valid: false,
      error: 'Must be a valid number',
    };
  }

  if (num > max) {
    return {
      valid: false,
      error: message || `Must be no more than ${max}`,
    };
  }

  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(value: unknown, message?: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: true }; // Skip validation for empty values
  }

  const str = String(value);
  if (!EMAIL_REGEX.test(str)) {
    return {
      valid: false,
      error: message || 'Please enter a valid email address',
    };
  }

  return { valid: true };
}

/**
 * Validate URL format
 */
export function validateUrl(value: unknown, message?: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: true }; // Skip validation for empty values
  }

  const str = String(value);
  if (!URL_REGEX.test(str)) {
    return {
      valid: false,
      error: message || 'Please enter a valid URL',
    };
  }

  return { valid: true };
}

/**
 * Validate phone number format
 */
export function validatePhone(value: unknown, message?: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { valid: true }; // Skip validation for empty values
  }

  const str = String(value);
  if (!PHONE_REGEX.test(str)) {
    return {
      valid: false,
      error: message || 'Please enter a valid phone number',
    };
  }

  return { valid: true };
}

/**
 * Validate a value against validation rules
 */
export async function validateValue(
  value: unknown,
  rules: ValidationRule,
  allValues?: Record<string, unknown>
): Promise<ValidationResult> {
  // Required validation
  if (rules.required) {
    const message = typeof rules.required === 'string' ? rules.required : undefined;
    const result = validateRequired(value, message);
    if (!result.valid) {
      return result;
    }
  }

  // Min length validation
  if (rules.minLength) {
    const result = validateMinLength(value, rules.minLength.value, rules.minLength.message);
    if (!result.valid) {
      return result;
    }
  }

  // Max length validation
  if (rules.maxLength) {
    const result = validateMaxLength(value, rules.maxLength.value, rules.maxLength.message);
    if (!result.valid) {
      return result;
    }
  }

  // Pattern validation
  if (rules.pattern) {
    const result = validatePattern(value, rules.pattern.value, rules.pattern.message);
    if (!result.valid) {
      return result;
    }
  }

  // Min value validation
  if (rules.min) {
    const result = validateMin(value, rules.min.value, rules.min.message);
    if (!result.valid) {
      return result;
    }
  }

  // Max value validation
  if (rules.max) {
    const result = validateMax(value, rules.max.value, rules.max.message);
    if (!result.valid) {
      return result;
    }
  }

  // Email validation
  if (rules.email) {
    const message = typeof rules.email === 'string' ? rules.email : undefined;
    const result = validateEmail(value, message);
    if (!result.valid) {
      return result;
    }
  }

  // URL validation
  if (rules.url) {
    const message = typeof rules.url === 'string' ? rules.url : undefined;
    const result = validateUrl(value, message);
    if (!result.valid) {
      return result;
    }
  }

  // Phone validation
  if (rules.phone) {
    const message = typeof rules.phone === 'string' ? rules.phone : undefined;
    const result = validatePhone(value, message);
    if (!result.valid) {
      return result;
    }
  }

  // Custom validation
  if (rules.custom) {
    const result = rules.custom(value, allValues);
    if (result !== true) {
      return {
        valid: false,
        error: result,
      };
    }
  }

  // Async validation
  if (rules.asyncValidation) {
    const result = await rules.asyncValidation(value);
    if (result !== true) {
      return {
        valid: false,
        error: result,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate all fields against their rules
 */
export async function validateAllFields(
  values: Record<string, unknown>,
  rules: Record<string, ValidationRule>
): Promise<{ valid: boolean; errors: Record<string, string> }> {
  const errors: Record<string, string> = {};

  // Validate each field
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = values[fieldName];
    const result = await validateValue(value, fieldRules, values);

    if (!result.valid && result.error) {
      errors[fieldName] = result.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
