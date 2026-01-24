/**
 * Form Widget Type Definitions
 */

import type { ActionConfig } from '@/types/action.types';
import type { ValidationRules } from '@/types/form.types';
import type { BaseWidgetConfig } from '@/types/widget.types';

/**
 * Form widget configuration
 */
export interface FormWidgetConfig extends BaseWidgetConfig {
  type: 'Form';

  /** Form title (optional) */
  title?: string;

  /** Form description (optional) */
  description?: string;

  /** Initial form values */
  initialValues?: Record<string, unknown>;

  /** Validation rules for form fields */
  validationRules?: ValidationRules;

  /** When to trigger validation (default: onSubmit) */
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all';

  /** Validate on mount (default: false) */
  validateOnMount?: boolean;

  /** Submit button label (default: 'Submit') */
  submitLabel?: string;

  /** Reset button label (optional, no reset button if not provided) */
  resetLabel?: string;

  /** Submit button variant */
  submitVariant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';

  /** Submit action configuration */
  onSubmit: ActionConfig;

  /** Success handler action (executed after successful submission) */
  onSuccess?: ActionConfig;

  /** Error handler action (executed after failed submission) */
  onError?: ActionConfig;

  /** Reset form after successful submission (default: false) */
  resetOnSuccess?: boolean;

  /** Show loading spinner during submission (default: true) */
  showLoading?: boolean;

  /** Disable form during submission (default: true) */
  disableOnSubmit?: boolean;

  /** Form layout direction */
  layout?: 'vertical' | 'horizontal';

  /** Form field spacing */
  spacing?: 'compact' | 'normal' | 'relaxed';
}
