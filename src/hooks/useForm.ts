/**
 * useForm Hook
 *
 * Core form state management hook that provides form state, validation,
 * and submission handling.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormConfig, FormState, ValidationRule, ValidationRules } from '@/types/form.types';
import { validateAllFields, validateValue } from '@/utils/validation';

/**
 * Form hook return value
 */
export interface UseFormReturn<TValues = Record<string, unknown>> {
  /** Current form state */
  state: FormState<TValues>;

  /** Register a field with validation rules */
  registerField: (name: string, rules?: ValidationRule) => void;

  /** Unregister a field */
  unregisterField: (name: string) => void;

  /** Set value for a field */
  setValue: (name: string, value: unknown) => void;

  /** Set multiple field values */
  setValues: (values: Partial<TValues>) => void;

  /** Get value for a field */
  getValue: (name: string) => unknown;

  /** Set error for a field */
  setError: (name: string, error: string) => void;

  /** Clear error for a field */
  clearError: (name: string) => void;

  /** Set multiple field errors */
  setErrors: (errors: Record<string, string>) => void;

  /** Clear all errors */
  clearErrors: () => void;

  /** Get error for a field */
  getError: (name: string) => string | undefined;

  /** Check if field has error */
  hasError: (name: string) => boolean;

  /** Mark field as touched */
  setTouched: (name: string, touched?: boolean) => void;

  /** Check if field is touched */
  isTouched: (name: string) => boolean;

  /** Validate a single field */
  validateField: (name: string) => Promise<boolean>;

  /** Validate all fields */
  validateForm: () => Promise<boolean>;

  /** Handle form submission */
  handleSubmit: (
    onSubmit: (values: TValues) => Promise<void> | void
  ) => (e?: React.FormEvent) => Promise<void>;

  /** Reset form to initial values */
  resetForm: () => void;

  /** Check if form is dirty */
  isDirty: () => boolean;

  /** Check if form is valid */
  isValid: () => boolean;
}

/**
 * useForm Hook
 *
 * Provides comprehensive form state management with validation
 */
export function useForm<TValues extends Record<string, unknown> = Record<string, unknown>>(
  config?: Partial<FormConfig<TValues>>
): UseFormReturn<TValues> {
  // Initialize form state
  const [state, setState] = useState<FormState<TValues>>(() => ({
    values: (config?.initialValues || {}) as TValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false,
    isValid: true,
    submitCount: 0,
    initialValues: (config?.initialValues || {}) as TValues,
  }));

  // Store validation rules
  const validationRulesRef = useRef<ValidationRules<TValues>>(config?.validationRules || {});
  const registeredFieldsRef = useRef<Set<string>>(new Set());
  const validationModeRef = useRef(config?.validationMode || 'onSubmit');

  // Update validation rules when config changes
  useEffect(() => {
    if (config?.validationRules) {
      validationRulesRef.current = config.validationRules;
    }
  }, [config?.validationRules]);

  /**
   * Register a field for validation
   */
  const registerField = useCallback((name: string, rules?: ValidationRule) => {
    registeredFieldsRef.current.add(name);
    if (rules) {
      validationRulesRef.current[name as keyof TValues] = rules;
    }
  }, []);

  /**
   * Unregister a field
   */
  const unregisterField = useCallback((name: string) => {
    registeredFieldsRef.current.delete(name);
    delete validationRulesRef.current[name as keyof TValues];
  }, []);

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    async (name: string): Promise<boolean> => {
      const rules = validationRulesRef.current[name as keyof TValues];
      if (!rules) {
        return true;
      }

      const value = state.values[name as keyof TValues];
      const result = await validateValue(value, rules, state.values);

      if (!result.valid && result.error) {
        // Update state directly instead of calling setError to avoid dependency
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, [name]: result.error! },
          isValid: false,
        }));
        return false;
      }

      // Update state directly instead of calling clearError to avoid dependency
      setState(prev => {
        const newErrors = { ...prev.errors };
        delete newErrors[name];
        return {
          ...prev,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
      return true;
    },
    [state.values]
  );

  /**
   * Set value for a field
   */
  const setValue = useCallback(
    (name: string, value: unknown) => {
      setState(prev => {
        const newValues = { ...prev.values, [name]: value };
        const isDirty = JSON.stringify(newValues) !== JSON.stringify(prev.initialValues);

        return {
          ...prev,
          values: newValues,
          isDirty,
        };
      });

      // Validate on change if mode is onChange or all
      if (validationModeRef.current === 'onChange' || validationModeRef.current === 'all') {
        setTimeout(() => {
          validateField(name);
        }, 0);
      }
    },
    [validateField]
  );

  /**
   * Set multiple field values
   */
  const setValues = useCallback((values: Partial<TValues>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const isDirty = JSON.stringify(newValues) !== JSON.stringify(prev.initialValues);

      return {
        ...prev,
        values: newValues,
        isDirty,
      };
    });
  }, []);

  /**
   * Get value for a field
   */
  const getValue = useCallback(
    (name: string): unknown => {
      return state.values[name as keyof TValues];
    },
    [state.values]
  );

  /**
   * Set error for a field
   */
  const setError = useCallback((name: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false,
    }));
  }, []);

  /**
   * Clear error for a field
   */
  const clearError = useCallback((name: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[name];

      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  /**
   * Set multiple field errors
   */
  const setErrors = useCallback((errors: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      isValid: false,
    }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
  }, []);

  /**
   * Get error for a field
   */
  const getError = useCallback(
    (name: string): string | undefined => {
      return state.errors[name];
    },
    [state.errors]
  );

  /**
   * Check if field has error
   */
  const hasError = useCallback(
    (name: string): boolean => {
      return !!state.errors[name];
    },
    [state.errors]
  );

  /**
   * Mark field as touched
   */
  const setTouched = useCallback(
    (name: string, touched = true) => {
      setState(prev => ({
        ...prev,
        touched: { ...prev.touched, [name]: touched },
      }));

      // Validate on blur if mode is onBlur or all
      if (
        touched &&
        (validationModeRef.current === 'onBlur' || validationModeRef.current === 'all')
      ) {
        setTimeout(() => {
          validateField(name);
        }, 0);
      }
    },
    [validateField]
  );

  /**
   * Check if field is touched
   */
  const isTouched = useCallback(
    (name: string): boolean => {
      return !!state.touched[name];
    },
    [state.touched]
  );

  /**
   * Validate all fields
   */
  const validateForm = useCallback(async (): Promise<boolean> => {
    const { valid, errors } = await validateAllFields(
      state.values,
      validationRulesRef.current as Record<string, ValidationRule>
    );

    if (!valid) {
      setState(prev => ({
        ...prev,
        errors,
        isValid: false,
      }));
      return false;
    }

    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
    return true;
  }, [state.values]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (onSubmit: (values: TValues) => Promise<void> | void) => async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {};
      for (const field of registeredFieldsRef.current) {
        allTouched[field] = true;
      }

      setState(prev => ({
        ...prev,
        touched: allTouched,
        isSubmitting: true,
      }));

      try {
        // Validate form
        const isValid = await validateForm();

        if (!isValid) {
          setState(prev => ({
            ...prev,
            isSubmitting: false,
            submitCount: prev.submitCount + 1,
          }));
          return;
        }

        // Submit form
        await onSubmit(state.values);

        setState(prev => ({
          ...prev,
          isSubmitting: false,
          submitCount: prev.submitCount + 1,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          submitCount: prev.submitCount + 1,
        }));
        throw error;
      }
    },
    [state.values, validateForm]
  );

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setState(prev => ({
      values: prev.initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isDirty: false,
      isValid: true,
      submitCount: 0,
      initialValues: prev.initialValues,
    }));
  }, []);

  /**
   * Check if form is dirty
   */
  const isDirtyFn = useCallback((): boolean => {
    return state.isDirty;
  }, [state.isDirty]);

  /**
   * Check if form is valid
   */
  const isValidFn = useCallback((): boolean => {
    return state.isValid;
  }, [state.isValid]);

  return {
    state,
    registerField,
    unregisterField,
    setValue,
    setValues,
    getValue,
    setError,
    clearError,
    setErrors,
    clearErrors,
    getError,
    hasError,
    setTouched,
    isTouched,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
    isDirty: isDirtyFn,
    isValid: isValidFn,
  };
}
