/**
 * TextareaWidget Component
 *
 * Multi-line text input widget with validation and helper text support.
 * Built on shadcn/ui Textarea component.
 */

import { useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { TextareaWidgetConfig } from './types';

export function TextareaWidget({ config, bindings, events }: WidgetProps<TextareaWidgetConfig>) {
  const {
    label,
    placeholder,
    rows = 4,
    maxLength,
    showCounter = false,
    required = false,
    disabled = false,
    readOnly = false,
    helperText,
    error,
    autoResize = false,
  } = config;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const value = (bindings?.value as string) ?? '';

  // Auto-resize functionality
  // biome-ignore lint/correctness/useExhaustiveDependencies: value needed for resize on content change
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, autoResize]);

  // Handle change event
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (events?.onChange) {
      events.onChange(e.target.value);
    }
  };

  // Handle blur event
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (events?.onBlur) {
      events.onBlur(e.target.value);
    }
  };

  // Calculate remaining characters
  const remainingChars = maxLength ? maxLength - value.length : null;
  const isOverLimit = remainingChars !== null && remainingChars < 0;

  return (
    <div className={cn('w-full space-y-2', bindings?.className as string)}>
      {label && (
        <Label
          htmlFor={config.id}
          className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}
        >
          {label}
        </Label>
      )}

      <Textarea
        id={config.id}
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(
          error && 'border-red-500 focus-visible:ring-red-500',
          autoResize && 'resize-none overflow-hidden'
        )}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${config.id}-error` : helperText ? `${config.id}-helper` : undefined
        }
      />

      <div className="flex justify-between items-start text-sm">
        <div className="flex-1">
          {error && (
            <p id={`${config.id}-error`} className="text-red-500 mt-1">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p id={`${config.id}-helper`} className="text-gray-600 mt-1">
              {helperText}
            </p>
          )}
        </div>

        {showCounter && maxLength && (
          <p className={cn('text-gray-600 mt-1 ml-2', isOverLimit && 'text-red-500')}>
            {value.length} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

TextareaWidget.displayName = 'TextareaWidget';
