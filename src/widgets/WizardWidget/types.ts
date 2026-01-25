/**
 * WizardWidget Type Definitions
 *
 * Types for multi-step wizard workflows in modals.
 */

import type { WidgetConfig } from '@/types/page.types';
import type { BaseWidgetConfig } from '@/types/widget.types';
import type { ModalAction } from '@/widgets/ModalWidget/types';

/**
 * Wizard step configuration
 */
export interface WizardStep {
  /** Unique step identifier */
  id: string;

  /** Step label/title */
  label: string;

  /** Step description */
  description?: string;

  /** Widget configurations for this step */
  widgets: WidgetConfig[];

  /** Whether this step is optional */
  optional?: boolean;

  /** Validation function for this step */
  validate?: (data: Record<string, unknown>) => boolean | string;

  /** Custom action buttons for this step (overrides wizard defaults) */
  actions?: ModalAction[];
}

/**
 * Wizard widget configuration
 */
export interface WizardWidgetConfig extends BaseWidgetConfig {
  type: 'Wizard';

  /** Wizard title */
  title?: string;

  /** Wizard description */
  description?: string;

  /** Modal size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /** Whether to show close button (X) */
  closable?: boolean;

  /** Whether clicking backdrop closes the wizard */
  closeOnBackdrop?: boolean;

  /** Wizard steps */
  steps: WizardStep[];

  /** Whether to show progress indicator */
  showProgress?: boolean;

  /** Progress indicator style */
  progressStyle?: 'dots' | 'numbers' | 'bar';

  /** Whether to allow jumping to any step */
  allowJump?: boolean;

  /** Custom labels for navigation buttons */
  labels?: {
    next?: string;
    previous?: string;
    finish?: string;
    cancel?: string;
  };
}

/**
 * Wizard state
 */
export interface WizardState {
  /** Current step index */
  currentStep: number;

  /** Completed steps */
  completedSteps: Set<number>;

  /** Wizard data accumulated from all steps */
  data: Record<string, unknown>;

  /** Validation errors by step */
  errors: Record<number, string>;
}

/**
 * Wizard events
 */
export interface WizardEvents {
  /** Called when wizard moves to next step */
  onNext?: (stepIndex: number, stepData: Record<string, unknown>) => void;

  /** Called when wizard moves to previous step */
  onPrevious?: (stepIndex: number) => void;

  /** Called when jumping to a specific step */
  onJumpToStep?: (stepIndex: number) => void;

  /** Called when wizard is completed */
  onComplete?: (data: Record<string, unknown>) => void;

  /** Called when wizard is cancelled */
  onCancel?: () => void;

  /** Called when wizard is closed */
  onClose?: () => void;

  /** Called when step validation fails */
  onValidationError?: (stepIndex: number, error: string) => void;
}
