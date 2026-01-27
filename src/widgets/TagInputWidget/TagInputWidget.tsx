/**
 * TagInputWidget Component
 *
 * Generic tag/chip input component with autocomplete support.
 * Allows adding/removing tags via keyboard shortcuts and click interactions.
 */

import * as Icons from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/types/widget.types';
import type { TagInputWidgetConfig, TagSuggestion } from './types';

export function TagInputWidget({ config, bindings, events }: WidgetProps<TagInputWidgetConfig>) {
  const {
    label,
    placeholder = 'Type and press Enter...',
    tags: configTags = [],
    datasourceId,
    maxTags,
    allowCustom = true,
    helpText,
    disabled = false,
    className,
    error,
  } = config;

  // State
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(configTags);
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Icons
  const XIcon = Icons.X as React.ComponentType<{ className?: string }>;

  // Sync tags with config/bindings
  useEffect(() => {
    if (bindings?.tags && Array.isArray(bindings.tags)) {
      const newTags = bindings.tags as string[];
      setTags(prevTags => {
        // Only update if tags have changed
        if (JSON.stringify(prevTags) !== JSON.stringify(newTags)) {
          return newTags;
        }
        return prevTags;
      });
    }
  }, [bindings?.tags]);

  // Initialize tags from config on first mount only
  useEffect(() => {
    if (!bindings?.tags && configTags && configTags.length > 0) {
      setTags(configTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bindings?.tags, configTags]);

  // Load suggestions from datasource
  useEffect(() => {
    if (datasourceId && bindings?.suggestions) {
      const suggestionData = bindings.suggestions as TagSuggestion[] | string[];
      if (Array.isArray(suggestionData)) {
        const formattedSuggestions = suggestionData.map(item =>
          typeof item === 'string' ? { value: item, label: item } : item
        );
        setSuggestions(formattedSuggestions);
      }
    }
  }, [datasourceId, bindings?.suggestions]);

  // Validate tag
  const validateTag = useCallback(
    (tag: string): string | null => {
      const trimmedTag = tag.trim();

      if (!trimmedTag) {
        return 'Tag cannot be empty';
      }

      if (tags.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) {
        return 'Tag already exists';
      }

      if (maxTags && tags.length >= maxTags) {
        return `Maximum ${maxTags} tags allowed`;
      }

      return null;
    },
    [tags, maxTags]
  );

  // Add tag
  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim();

      // Check for empty tag first and show error
      if (!trimmedTag) {
        setValidationError('Tag cannot be empty');
        return;
      }

      const error = validateTag(trimmedTag);
      if (error) {
        setValidationError(error);
        return;
      }

      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setInputValue('');
      setValidationError(null);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);

      // Trigger onChange event
      if (events?.onChange) {
        events.onChange(newTags);
      }
    },
    [tags, validateTag, events]
  );

  // Remove tag
  const removeTag = useCallback(
    (index: number) => {
      const newTags = tags.filter((_, i) => i !== index);
      setTags(newTags);

      // Trigger onChange event
      if (events?.onChange) {
        events.onChange(newTags);
      }
    },
    [tags, events]
  );

  // Filter suggestions based on input
  const getFilteredSuggestions = useCallback(() => {
    if (!inputValue.trim() || !suggestions.length) return [];

    const input = inputValue.toLowerCase();
    return suggestions.filter(
      suggestion =>
        suggestion.value.toLowerCase().includes(input) &&
        !tags.some(tag => tag.toLowerCase() === suggestion.value.toLowerCase())
    );
  }, [inputValue, suggestions, tags]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setValidationError(null);

    // Show suggestions if datasource available
    if (datasourceId && suggestions.length > 0) {
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const filteredSuggestions = getFilteredSuggestions();

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (showSuggestions && selectedSuggestionIndex >= 0) {
          // Select suggestion
          const selectedSuggestion = filteredSuggestions[selectedSuggestionIndex];
          if (selectedSuggestion) {
            addTag(selectedSuggestion.value);
          }
        } else if (allowCustom) {
          // Add custom tag
          addTag(inputValue);
        }
        break;

      case ',':
        if (allowCustom) {
          e.preventDefault();
          addTag(inputValue);
        }
        break;

      case 'Backspace':
        if (!inputValue && tags.length > 0) {
          // Remove last tag if input is empty
          removeTag(tags.length - 1);
        }
        break;

      case 'Escape':
        setInputValue('');
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        setValidationError(null);
        break;

      case 'ArrowDown':
        if (showSuggestions && filteredSuggestions.length > 0) {
          e.preventDefault();
          setSelectedSuggestionIndex(prev =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        if (showSuggestions && filteredSuggestions.length > 0) {
          e.preventDefault();
          setSelectedSuggestionIndex(prev =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
        }
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: TagSuggestion) => {
    addTag(suggestion.value);
    inputRef.current?.focus();
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay to allow suggestion click to register
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  // Handle input focus
  const handleFocus = () => {
    if (datasourceId && suggestions.length > 0 && inputValue) {
      setShowSuggestions(true);
    }
  };

  const filteredSuggestions = getFilteredSuggestions();
  const hasError = error || validationError;

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <Label htmlFor={config.id} className={disabled ? 'text-muted-foreground' : ''}>
          {label}
        </Label>
      )}

      {/* Tags and Input Container */}
      <div
        className={cn(
          'flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50',
          hasError && 'border-destructive focus-within:ring-destructive'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Render tags */}
        {tags.map((tag, index) => (
          <Badge
            // biome-ignore lint/suspicious/noArrayIndexKey: Tags are unique but we need index for removal
            key={`${tag}-${index}`}
            variant="secondary"
            className="gap-1 pr-1"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="ml-1 rounded-full hover:bg-black/10 p-0.5 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <XIcon className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Input */}
        {(!maxTags || tags.length < maxTags) && (
          <input
            ref={inputRef}
            id={config.id}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
            className={cn(
              'flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
              'min-w-[120px]',
              disabled && 'cursor-not-allowed'
            )}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError ? `${config.id}-error` : helpText ? `${config.id}-help` : undefined
            }
          />
        )}
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="relative z-50 max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          role="listbox"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.value}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                'hover:bg-accent hover:text-accent-foreground',
                index === selectedSuggestionIndex && 'bg-accent text-accent-foreground'
              )}
              role="option"
              aria-selected={index === selectedSuggestionIndex}
              tabIndex={-1}
            >
              {suggestion.label || suggestion.value}
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      {helpText && !hasError && (
        <p id={`${config.id}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {hasError && (
        <p id={`${config.id}-error`} className="text-sm text-destructive" role="alert">
          {error || validationError}
        </p>
      )}

      {/* Max Tags Indicator */}
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {tags.length} / {maxTags} tags
        </p>
      )}
    </div>
  );
}

TagInputWidget.displayName = 'TagInputWidget';
