/**
 * TextInputWidget Component
 *
 * Single-line text input widget with support for various input types.
 * Uses shadcn/ui Input component built on native HTML input element.
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { TextInputWidgetConfig } from './types';

export function TextInputWidget({ config, bindings, events }: WidgetProps<TextInputWidgetConfig>) {
  const {
    id,
    label,
    placeholder,
    helpText,
    inputType = 'text',
    maxLength,
    disabled,
    readonly,
    required,
    autoFocus,
    icon,
    iconPosition,
  } = config;

  const value = (bindings?.value as string) ?? '';
  const error = bindings?.error as string | undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (events?.onChange) {
      events.onChange(e.target.value);
    }
  };

  const handleBlur = () => {
    if (events?.onBlur) {
      events.onBlur();
    }
  };

  const handleFocus = () => {
    if (events?.onFocus) {
      events.onFocus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && events?.onEnter) {
      events.onEnter();
    }
  };

  // Icon support is stubbed for MVP
  if (icon) {
    console.warn('TextInput icon support not yet implemented in MVP.');
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

      {/* Input Field */}
      <Input
        id={id}
        type={inputType}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readonly}
        autoFocus={autoFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        aria-required={required}
      />

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

TextInputWidget.displayName = 'TextInputWidget';
