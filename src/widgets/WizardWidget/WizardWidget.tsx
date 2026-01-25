/**
 * WizardWidget Component
 *
 * Multi-step modal wizard with navigation, validation, and progress tracking.
 *
 * Features:
 * - Multi-step workflow
 * - Step navigation (next, previous, jump)
 * - Step validation
 * - Progress indicator
 * - Data accumulation across steps
 * - Customizable action buttons
 */

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WidgetListRenderer } from '@/core/renderer/WidgetRenderer';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { WizardState, WizardStep, WizardWidgetConfig } from './types';

/**
 * Progress indicator component
 */
function WizardProgress({
  steps,
  currentStep,
  completedSteps,
  style = 'dots',
  allowJump,
  onJumpToStep,
}: {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<number>;
  style: 'dots' | 'numbers' | 'bar';
  allowJump: boolean;
  onJumpToStep?: (stepIndex: number) => void;
}) {
  if (style === 'bar') {
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = completedSteps.has(index);
        const isClickable = allowJump && (isCompleted || index <= currentStep);

        return (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              onClick={() => isClickable && onJumpToStep?.(index)}
              disabled={!isClickable}
              className={cn(
                'rounded-full transition-all',
                style === 'dots' ? 'w-3 h-3' : 'w-8 h-8 flex items-center justify-center text-xs',
                isActive && 'bg-primary scale-125',
                isCompleted && !isActive && 'bg-primary/60',
                !isActive && !isCompleted && 'bg-secondary',
                isClickable && 'cursor-pointer hover:scale-110',
                !isClickable && 'cursor-not-allowed opacity-50'
              )}
              aria-label={`Step ${index + 1}: ${step.label}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {style === 'numbers' && index + 1}
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn('w-8 h-0.5 mx-1', isCompleted ? 'bg-primary/60' : 'bg-secondary')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function WizardWidget({ config, bindings, events }: WidgetProps<WizardWidgetConfig>) {
  const {
    title,
    description,
    size = 'lg',
    closable = true,
    closeOnBackdrop = false,
    steps = [],
    showProgress = true,
    progressStyle = 'dots',
    allowJump = false,
    labels = {},
  } = config;

  const isOpen = (bindings?.isOpen as boolean) ?? false;

  // Wizard state
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 0,
    completedSteps: new Set(),
    data: {},
    errors: {},
  });

  const currentStepConfig = steps[wizardState.currentStep];
  const isFirstStep = wizardState.currentStep === 0;
  const isLastStep = wizardState.currentStep === steps.length - 1;

  // Default labels
  const nextLabel = labels.next || 'Next';
  const previousLabel = labels.previous || 'Previous';
  const finishLabel = labels.finish || 'Finish';
  const cancelLabel = labels.cancel || 'Cancel';

  // Handle modal close
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && events?.onClose) {
        events.onClose();
      }
    },
    [events]
  );

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    if (!currentStepConfig?.validate) {
      return true;
    }

    const result = currentStepConfig.validate(wizardState.data);

    if (result === true) {
      // Clear any previous errors
      setWizardState(prev => {
        const newErrors = { ...prev.errors };
        delete newErrors[prev.currentStep];
        return { ...prev, errors: newErrors };
      });
      return true;
    }

    // Validation failed
    const errorMessage = typeof result === 'string' ? result : 'Validation failed';
    setWizardState(prev => ({
      ...prev,
      errors: { ...prev.errors, [prev.currentStep]: errorMessage },
    }));

    if (events?.onValidationError) {
      events.onValidationError(wizardState.currentStep, errorMessage);
    }

    return false;
  }, [currentStepConfig, wizardState.data, wizardState.currentStep, events]);

  // Navigate to next step
  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return;
    }

    const newStep = wizardState.currentStep + 1;

    setWizardState(prev => ({
      ...prev,
      currentStep: newStep,
      completedSteps: new Set([...prev.completedSteps, prev.currentStep]),
    }));

    if (events?.onNext) {
      events.onNext(newStep, wizardState.data);
    }
  }, [validateCurrentStep, wizardState.currentStep, wizardState.data, events]);

  // Navigate to previous step
  const handlePrevious = useCallback(() => {
    const newStep = wizardState.currentStep - 1;

    setWizardState(prev => ({
      ...prev,
      currentStep: newStep,
    }));

    if (events?.onPrevious) {
      events.onPrevious(newStep);
    }
  }, [wizardState.currentStep, events]);

  // Jump to specific step
  const handleJumpToStep = useCallback(
    (stepIndex: number) => {
      if (!allowJump) return;

      setWizardState(prev => ({
        ...prev,
        currentStep: stepIndex,
      }));

      if (events?.onJumpToStep) {
        events.onJumpToStep(stepIndex);
      }
    },
    [allowJump, events]
  );

  // Complete wizard
  const handleComplete = useCallback(() => {
    if (!validateCurrentStep()) {
      return;
    }

    if (events?.onComplete) {
      events.onComplete(wizardState.data);
    }
  }, [validateCurrentStep, wizardState.data, events]);

  // Cancel wizard
  const handleCancel = useCallback(() => {
    if (events?.onCancel) {
      events.onCancel();
    }
    if (events?.onClose) {
      events.onClose();
    }
  }, [events]);

  // Handle data changes from child widgets
  const handleDataChange = useCallback((key: string, value: unknown) => {
    setWizardState(prev => ({
      ...prev,
      data: { ...prev.data, [key]: value },
    }));
  }, []);

  // Create bindings for child widgets
  const childBindings = useMemo(
    () =>
      Object.fromEntries(
        (currentStepConfig?.widgets || []).map(widget => [
          widget.id,
          {
            value: wizardState.data[widget.id],
          },
        ])
      ),
    [currentStepConfig, wizardState.data]
  );

  // Create events for child widgets
  const childEvents = useMemo(
    () =>
      Object.fromEntries(
        (currentStepConfig?.widgets || []).map(widget => [
          widget.id,
          {
            onChange: (value: unknown) => handleDataChange(widget.id, value),
          },
        ])
      ),
    [currentStepConfig, handleDataChange]
  );

  // Prevent default event when condition is met
  const preventDefaultIf = (condition: boolean) => (e: Event) => {
    if (condition) {
      e.preventDefault();
    }
  };

  // Size class mapping
  const sizeClasses: Record<string, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    full: 'sm:max-w-[95vw]',
  };

  if (!currentStepConfig) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeOnBackdrop ? handleOpenChange : undefined}>
      <DialogContent
        className={cn(sizeClasses[size], 'max-h-[90vh] flex flex-col')}
        onEscapeKeyDown={preventDefaultIf(!closable)}
        onPointerDownOutside={preventDefaultIf(!closeOnBackdrop)}
        onInteractOutside={preventDefaultIf(!closeOnBackdrop)}
        hideCloseButton={!closable}
      >
        {/* Header */}
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Progress indicator */}
        {showProgress && (
          <div className="px-1">
            <WizardProgress
              steps={steps}
              currentStep={wizardState.currentStep}
              completedSteps={wizardState.completedSteps}
              style={progressStyle}
              allowJump={allowJump}
              onJumpToStep={handleJumpToStep}
            />
          </div>
        )}

        {/* Current step content */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{currentStepConfig.label}</h3>
            {currentStepConfig.description && (
              <p className="text-sm text-muted-foreground mt-1">{currentStepConfig.description}</p>
            )}
          </div>

          {/* Validation error */}
          {wizardState.errors[wizardState.currentStep] && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                {wizardState.errors[wizardState.currentStep]}
              </p>
            </div>
          )}

          {/* Step widgets */}
          <div className="space-y-4">
            <WidgetListRenderer
              configs={currentStepConfig.widgets}
              bindings={childBindings}
              events={childEvents}
            />
          </div>
        </div>

        {/* Footer with navigation */}
        <DialogFooter>
          <div className="flex justify-between w-full gap-2">
            <Button variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button variant="outline" onClick={handlePrevious}>
                  {previousLabel}
                </Button>
              )}
              {!isLastStep ? (
                <Button onClick={handleNext}>{nextLabel}</Button>
              ) : (
                <Button onClick={handleComplete}>{finishLabel}</Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

WizardWidget.displayName = 'WizardWidget';
