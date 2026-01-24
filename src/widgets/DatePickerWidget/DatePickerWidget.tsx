/**
 * DatePickerWidget Component
 *
 * Date selection widget with calendar popover.
 * Uses shadcn/ui Calendar and Popover components built on Radix UI primitives.
 */

import { format, isValid, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { DatePickerWidgetConfig } from './types';

export function DatePickerWidget({
  config,
  bindings,
  events,
}: WidgetProps<DatePickerWidgetConfig>) {
  const {
    id,
    label,
    placeholder,
    helpText,
    format: dateFormat = 'PPP', // Default: Jan 1, 2024
    minDate,
    maxDate,
    disabled,
    required,
    showTime,
  } = config;

  const value = bindings?.value as string | undefined;
  const error = bindings?.error as string | undefined;

  // Parse date value
  let selectedDate: Date | undefined;
  if (value) {
    try {
      const parsed = parseISO(value);
      selectedDate = isValid(parsed) ? parsed : undefined;
    } catch {
      selectedDate = undefined;
    }
  }

  // Parse min/max dates
  const minDateObj = minDate ? parseISO(minDate) : undefined;
  const maxDateObj = maxDate ? parseISO(maxDate) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (events?.onChange) {
      // Convert to ISO 8601 string
      events.onChange(date ? date.toISOString() : '');
    }
  };

  // Disabled date matcher
  const isDateDisabled = (date: Date) => {
    if (minDateObj && date < minDateObj) return true;
    if (maxDateObj && date > maxDateObj) return true;
    return false;
  };

  // Show time picker warning
  if (showTime) {
    console.warn('Time picker not yet implemented. Showing date picker only.');
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

      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
              error && 'border-destructive focus:ring-destructive'
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
            aria-required={required}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, dateFormat) : placeholder || 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={isDateDisabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>

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

DatePickerWidget.displayName = 'DatePickerWidget';
