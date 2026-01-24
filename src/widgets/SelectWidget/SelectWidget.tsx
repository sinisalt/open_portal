/**
 * SelectWidget Component
 *
 * Dropdown selection widget with support for simple and searchable variants.
 * Uses shadcn/ui Select component built on Radix UI primitives.
 */

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { SelectWidgetConfig } from './types';

export function SelectWidget({ config, bindings, events }: WidgetProps<SelectWidgetConfig>) {
  const {
    id,
    label,
    placeholder,
    helpText,
    options,
    disabled,
    required,
    clearable,
    searchable,
  } = config;

  const value = (bindings?.value as string | number | undefined) ?? '';
  const error = bindings?.error as string | undefined;

  // Convert value to string for Radix Select (it only accepts strings)
  const stringValue = value !== undefined && value !== '' ? String(value) : undefined;

  const handleValueChange = (newValue: string) => {
    if (events?.onChange) {
      // Try to preserve the original type (number or string)
      const option = options.find((opt) => String(opt.value) === newValue);
      events.onChange(option?.value ?? newValue);
    }
  };

  const handleClear = () => {
    if (clearable && events?.onChange) {
      events.onChange('');
    }
  };

  // For searchable variant, we would use Command + Popover
  // For MVP, implementing simple select first
  if (searchable) {
    // TODO: Implement searchable variant with Command component
    console.warn('Searchable select variant not yet implemented. Falling back to simple select.');
  }

  return (
    <div className="space-y-2 w-full">
      {/* Label */}
      {label && (
        <Label htmlFor={id} className={cn(disabled && 'opacity-50')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      {/* Select Field */}
      <div className="relative">
        <Select value={stringValue} onValueChange={handleValueChange} disabled={disabled}>
          <SelectTrigger
            id={id}
            className={cn(
              error && 'border-destructive focus:ring-destructive',
              clearable && stringValue && 'pr-8'
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${id}-error` : helpText ? `${id}-help` : undefined
            }
            aria-required={required}
          >
            <SelectValue placeholder={placeholder || 'Select an option'} />
          </SelectTrigger>

          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear button */}
        {clearable && stringValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear selection"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Help Text */}
      {helpText && !error && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

SelectWidget.displayName = 'SelectWidget';
