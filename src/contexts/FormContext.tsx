/**
 * Form Context
 *
 * React context for form state management that allows form fields to access
 * form state and validation without prop drilling.
 */

import { createContext, type ReactNode, useContext } from 'react';
import { type UseFormReturn, useForm } from '@/hooks/useForm';
import type { FormContextValue, ValidationRule } from '@/types/form.types';

/**
 * Form context
 */
const FormContext = createContext<FormContextValue | null>(null);

/**
 * Form context provider props
 */
interface FormProviderProps<TValues extends Record<string, unknown> = Record<string, unknown>> {
  /** Form configuration */
  form: UseFormReturn<TValues>;

  /** Child components */
  children: ReactNode;
}

/**
 * Form Provider Component
 *
 * Provides form state to all child components via context
 */
export function FormProvider<TValues extends Record<string, unknown> = Record<string, unknown>>({
  form,
  children,
}: FormProviderProps<TValues>) {
  const contextValue: FormContextValue<TValues> = {
    state: form.state,
    registerField: form.registerField,
    unregisterField: form.unregisterField,
    setValue: form.setValue,
    setValues: form.setValues,
    setError: form.setError,
    clearError: form.clearError,
    setErrors: form.setErrors,
    clearErrors: form.clearErrors,
    setTouched: form.setTouched,
    validateField: form.validateField,
    validateForm: form.validateForm,
    submitForm: async () => {
      // This will be overridden by actual submit handler
      await form.validateForm();
    },
    resetForm: form.resetForm,
    getValue: form.getValue,
    getError: form.getError,
    isTouched: form.isTouched,
    hasError: form.hasError,
  };

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
}

/**
 * useFormContext Hook
 *
 * Access form context from child components
 */
export function useFormContext<
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(): FormContextValue<TValues> {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }

  return context as FormContextValue<TValues>;
}

/**
 * useFormField Hook
 *
 * Hook for individual form fields to access their state
 */
export interface UseFormFieldReturn {
  /** Field value */
  value: unknown;

  /** Field error message */
  error?: string;

  /** Field touched state */
  touched: boolean;

  /** Field has error */
  hasError: boolean;

  /** Set field value */
  setValue: (value: unknown) => void;

  /** Handle field change */
  onChange: (value: unknown) => void;

  /** Handle field blur */
  onBlur: () => void;

  /** Handle field focus */
  onFocus: () => void;
}

export function useFormField(name: string, rules?: ValidationRule): UseFormFieldReturn {
  const form = useFormContext();

  // Register field on mount
  React.useEffect(() => {
    form.registerField(name, rules);
    return () => {
      form.unregisterField(name);
    };
  }, [name, rules, form]);

  const value = form.getValue(name);
  const error = form.getError(name);
  const touched = form.isTouched(name);
  const hasError = form.hasError(name);

  const setValue = (newValue: unknown) => {
    form.setValue(name, newValue);
  };

  const onChange = (newValue: unknown) => {
    form.setValue(name, newValue);
  };

  const onBlur = () => {
    form.setTouched(name, true);
  };

  const onFocus = () => {
    // Clear error on focus for better UX
    if (hasError) {
      form.clearError(name);
    }
  };

  return {
    value,
    error,
    touched,
    hasError,
    setValue,
    onChange,
    onBlur,
    onFocus,
  };
}

// Re-export for convenience
export { useForm };

// Import React for useEffect
import * as React from 'react';
