/**
 * CheckboxWidget Component
 *
 * Boolean checkbox input with label, help text, and error states.
 * Uses shadcn/ui Checkbox component built on Radix UI primitives.
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { CheckboxWidgetConfig } from './types';

export function CheckboxWidget({ config, bindings, events }: WidgetProps<CheckboxWidgetConfig>) {
  const { id, label, helpText, disabled, required, indeterminate } = config;

  const checked = (bindings?.value as boolean) ?? false;
  const error = bindings?.error as string | undefined;

  const handleCheckedChange = (value: boolean | 'indeterminate') => {
    if (events?.onChange) {
      // Convert indeterminate to boolean (treat as unchecked)
      events.onChange(value === true);
    }
  };

  return (
    <div className="space-y-2 w-full">
      {/* Checkbox with Label */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id={id}
          checked={indeterminate ? 'indeterminate' : checked}
          onCheckedChange={handleCheckedChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          aria-required={required}
          className={cn(error && 'border-destructive')}
        />

        {label && (
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor={id}
              className={cn('cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {/* Help Text */}
            {helpText && !error && (
              <p id={`${id}-help`} className="text-sm text-muted-foreground">
                {helpText}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error Message (displayed below checkbox) */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive ml-6" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

CheckboxWidget.displayName = 'CheckboxWidget';
