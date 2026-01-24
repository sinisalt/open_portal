/**
 * Form Type Definitions
 *
 * Core types for the form state management system, including form state,
 * validation rules, and form configuration.
 */

import type { ActionConfig } from './action.types';

/**
 * Form state structure
 */
export interface FormState<TValues = Record<string, unknown>> {
  /** Current form values */
  values: TValues;

  /** Field-level error messages */
  errors: Record<string, string>;

  /** Fields that have been touched (blurred) */
  touched: Record<string, boolean>;

  /** Form submission in progress */
  isSubmitting: boolean;

  /** Form has been modified from initial values */
  isDirty: boolean;

  /** Form validation state */
  isValid: boolean;

  /** Number of submission attempts */
  submitCount: number;

  /** Initial form values (for reset) */
  initialValues: TValues;
}

/**
 * Validation rule types
 */
export interface ValidationRule {
  /** Required field validation */
  required?: boolean | string;

  /** Minimum length validation */
  minLength?: {
    value: number;
    message: string;
  };

  /** Maximum length validation */
  maxLength?: {
    value: number;
    message: string;
  };

  /** Pattern matching validation (regex) */
  pattern?: {
    value: RegExp | string;
    message: string;
  };

  /** Minimum value validation (for numbers) */
  min?: {
    value: number;
    message: string;
  };

  /** Maximum value validation (for numbers) */
  max?: {
    value: number;
    message: string;
  };

  /** Email format validation */
  email?: boolean | string;

  /** URL format validation */
  url?: boolean | string;

  /** Phone number format validation */
  phone?: boolean | string;

  /** Custom validation function */
  custom?: (value: unknown, values?: Record<string, unknown>) => string | true;

  /** Async validation function */
  asyncValidation?: (value: unknown) => Promise<string | true>;
}

/**
 * Field validation rules mapped by field name
 */
export type ValidationRules<TValues = Record<string, unknown>> = {
  [K in keyof TValues]?: ValidationRule;
};

/**
 * Validation mode - when to trigger validation
 */
export type ValidationMode = 'onChange' | 'onBlur' | 'onSubmit' | 'all';

/**
 * Form configuration
 */
export interface FormConfig<TValues = Record<string, unknown>> {
  /** Unique form identifier */
  id: string;

  /** Initial form values */
  initialValues: TValues;

  /** Validation rules for fields */
  validationRules?: ValidationRules<TValues>;

  /** When to trigger validation */
  validationMode?: ValidationMode;

  /** Validate on mount */
  validateOnMount?: boolean;

  /** Submit action configuration */
  onSubmit: ActionConfig;

  /** Success handler action */
  onSuccess?: ActionConfig;

  /** Error handler action */
  onError?: ActionConfig;

  /** Reset form after successful submission */
  resetOnSuccess?: boolean;

  /** Enable debug mode */
  debug?: boolean;
}

/**
 * Form field registration
 */
export interface FormFieldRegistration {
  /** Field name */
  name: string;

  /** Validation rules */
  rules?: ValidationRule;

  /** Default value */
  defaultValue?: unknown;

  /** Whether field is disabled */
  disabled?: boolean;
}

/**
 * Form context value
 */
export interface FormContextValue<TValues = Record<string, unknown>> {
  /** Form state */
  state: FormState<TValues>;

  /** Register a field */
  registerField: (name: string, rules?: ValidationRule) => void;

  /** Unregister a field */
  unregisterField: (name: string) => void;

  /** Set field value */
  setValue: (name: string, value: unknown) => void;

  /** Set multiple field values */
  setValues: (values: Partial<TValues>) => void;

  /** Set field error */
  setError: (name: string, error: string) => void;

  /** Clear field error */
  clearError: (name: string) => void;

  /** Set multiple field errors */
  setErrors: (errors: Record<string, string>) => void;

  /** Clear all errors */
  clearErrors: () => void;

  /** Mark field as touched */
  setTouched: (name: string, touched?: boolean) => void;

  /** Validate a single field */
  validateField: (name: string) => Promise<boolean>;

  /** Validate all fields */
  validateForm: () => Promise<boolean>;

  /** Submit form */
  submitForm: () => Promise<void>;

  /** Reset form to initial values */
  resetForm: () => void;

  /** Get field value */
  getValue: (name: string) => unknown;

  /** Get field error */
  getError: (name: string) => string | undefined;

  /** Check if field is touched */
  isTouched: (name: string) => boolean;

  /** Check if field has error */
  hasError: (name: string) => boolean;
}

/**
 * Form submission result
 */
export interface FormSubmitResult {
  /** Submission successful */
  success: boolean;

  /** Result data */
  data?: unknown;

  /** Error message */
  error?: string;

  /** Field-level errors */
  fieldErrors?: Record<string, string>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Validation passed */
  valid: boolean;

  /** Error message */
  error?: string;
}

/**
 * Server validation error response
 */
export interface ServerValidationError {
  /** Error message */
  message: string;

  /** Field-level errors */
  fieldErrors?: Record<string, string>;

  /** Error code */
  code?: string;
}
