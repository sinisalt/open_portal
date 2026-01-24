/**
 * Form Widget
 *
 * Comprehensive form widget that integrates form state management with action execution.
 * Provides built-in validation, submission handling, and error display.
 */

import { type FormEvent, useCallback, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from '@/contexts/FormContext';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { FormWidgetConfig } from './types';

/**
 * Form Widget Component
 */
export function FormWidget({ config, children, bindings, events }: WidgetProps<FormWidgetConfig>) {
  const {
    id,
    title,
    description,
    initialValues = {},
    validationRules = {},
    validationMode = 'onSubmit',
    validateOnMount = false,
    submitLabel = 'Submit',
    resetLabel,
    submitVariant = 'default',
    resetOnSuccess = false,
    showLoading = true,
    disableOnSubmit = true,
    layout = 'vertical',
    spacing = 'normal',
  } = config;

  // Initialize form state
  const form = useForm({
    initialValues,
    validationRules,
    validationMode,
    validateOnMount,
  });

  const { state } = form;

  // Spacing classes based on spacing prop
  const spacingClass = useMemo(() => {
    switch (spacing) {
      case 'compact':
        return 'space-y-3';
      case 'relaxed':
        return 'space-y-8';
      default:
        return 'space-y-6';
    }
  }, [spacing]);

  // Layout classes
  const layoutClass = useMemo(() => {
    return layout === 'horizontal' ? 'grid grid-cols-2 gap-4' : spacingClass;
  }, [layout, spacingClass]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Use the form's handleSubmit with custom submission logic
      const submitHandler = form.handleSubmit(async values => {
        try {
          // Call the onSubmit event if provided
          if (events?.onSubmit) {
            await events.onSubmit(values);
          }

          // Reset form if configured
          if (resetOnSuccess) {
            form.resetForm();
          }

          // Execute onSuccess action if provided (would integrate with ActionExecutor)
          if (config.onSuccess && events?.onSuccess) {
            events.onSuccess();
          }
        } catch (error) {
          // Execute onError action if provided (would integrate with ActionExecutor)
          if (config.onError && events?.onError) {
            events.onError(error);
          }
          throw error;
        }
      });

      await submitHandler(e);
    },
    [form, events, config.onSuccess, config.onError, resetOnSuccess]
  );

  // Handle form reset
  const handleReset = useCallback(() => {
    form.resetForm();
  }, [form]);

  // Validate on mount if configured
  useEffect(() => {
    if (validateOnMount) {
      form.validateForm();
    }
  }, [validateOnMount, form]);

  // Determine if form is disabled
  const isDisabled = (disableOnSubmit && state.isSubmitting) || bindings?.disabled === true;

  return (
    <FormProvider form={form}>
      <form
        id={id}
        onSubmit={handleSubmit}
        className={cn('w-full', bindings?.loading && 'opacity-50 pointer-events-none')}
        noValidate
      >
        {/* Form Header */}
        {(title || description) && (
          <div className="mb-6">
            {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        )}

        {/* Form Fields - Children are form field widgets */}
        <div className={layoutClass}>{children}</div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={isDisabled}
            className={cn(
              'px-4 py-2 rounded-md font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              getButtonVariantClass(submitVariant),
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {showLoading && state.isSubmitting && (
              <span className="inline-block w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {submitLabel}
          </button>

          {resetLabel && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isDisabled}
              className={cn(
                'px-4 py-2 rounded-md font-medium transition-colors',
                'bg-secondary text-secondary-foreground hover:bg-secondary/90',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {resetLabel}
            </button>
          )}
        </div>

        {/* Form-level errors */}
        {bindings?.error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
            {String(bindings.error)}
          </div>
        )}

        {/* Debug info (only if debug mode is enabled) */}
        {config.debug && (
          <div className="mt-8 p-4 bg-muted rounded-md">
            <h3 className="text-sm font-semibold mb-2">Form Debug Info</h3>
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify(
                {
                  values: state.values,
                  errors: state.errors,
                  touched: state.touched,
                  isDirty: state.isDirty,
                  isValid: state.isValid,
                  isSubmitting: state.isSubmitting,
                  submitCount: state.submitCount,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </form>
    </FormProvider>
  );
}

/**
 * Get button variant class
 */
function getButtonVariantClass(
  variant: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' = 'default'
): string {
  switch (variant) {
    case 'primary':
      return 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary';
    case 'secondary':
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary';
    case 'destructive':
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive';
    case 'outline':
      return 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-primary';
    case 'ghost':
      return 'hover:bg-accent hover:text-accent-foreground focus:ring-primary';
    default:
      return 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary';
  }
}

export default FormWidget;
