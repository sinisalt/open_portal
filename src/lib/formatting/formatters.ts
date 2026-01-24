/**
 * Formatting Utilities
 *
 * Utilities for formatting numbers, currency, dates, and other data types.
 * Used by data display widgets (Table, KPI) for consistent data presentation.
 */

import { format as formatDate } from 'date-fns';

/**
 * Format options for numbers
 */
export interface NumberFormatOptions {
  decimals?: number;
  locale?: string;
  useGrouping?: boolean;
}

/**
 * Format options for currency
 */
export interface CurrencyFormatOptions {
  currency?: string;
  decimals?: number;
  locale?: string;
}

/**
 * Format options for percentages
 */
export interface PercentFormatOptions {
  decimals?: number;
  locale?: string;
}

/**
 * Format options for dates
 */
export interface DateFormatOptions {
  format?: string;
  locale?: string;
}

/**
 * Format a number with locale-aware formatting
 *
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | string | null | undefined,
  options?: NumberFormatOptions
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(numValue)) {
    return '—';
  }

  const { decimals = 0, locale = 'en-US', useGrouping = true } = options || {};

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping,
    }).format(numValue);
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(value);
  }
}

/**
 * Format a currency value with locale-aware formatting
 *
 * @param value - The currency value to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options?: CurrencyFormatOptions
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(numValue)) {
    return '—';
  }

  const { currency = 'USD', decimals = 2, locale = 'en-US' } = options || {};

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numValue);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return String(value);
  }
}

/**
 * Format a percentage value with locale-aware formatting
 *
 * @param value - The percentage value to format (e.g., 0.25 for 25%)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number | string | null | undefined,
  options?: PercentFormatOptions
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(numValue)) {
    return '—';
  }

  const { decimals = 0, locale = 'en-US' } = options || {};

  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numValue);
  } catch (error) {
    console.error('Error formatting percent:', error);
    return String(value);
  }
}

/**
 * Format a date value with date-fns
 *
 * @param value - The date value to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDateValue(
  value: Date | string | number | null | undefined,
  options?: DateFormatOptions
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  // TODO: Support date-fns locale by importing locale objects and wiring up options.locale
  const { format = 'PP' } = options || {};

  try {
    const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    // Use date-fns format
    return formatDate(date, format);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(value);
  }
}

/**
 * Format a value based on format type
 *
 * @param value - The value to format
 * @param format - Format type
 * @param formatOptions - Format-specific options
 * @returns Formatted value string
 */
export function formatValue(
  value: unknown,
  format: 'text' | 'number' | 'currency' | 'percent' | 'date' = 'text',
  formatOptions?:
    | NumberFormatOptions
    | CurrencyFormatOptions
    | PercentFormatOptions
    | DateFormatOptions
): string {
  switch (format) {
    case 'number':
      return formatNumber(
        value as number | string | null | undefined,
        formatOptions as NumberFormatOptions
      );

    case 'currency':
      return formatCurrency(
        value as number | string | null | undefined,
        formatOptions as CurrencyFormatOptions
      );

    case 'percent':
      return formatPercent(
        value as number | string | null | undefined,
        formatOptions as PercentFormatOptions
      );

    case 'date':
      return formatDateValue(
        value as Date | string | number | null | undefined,
        formatOptions as DateFormatOptions
      );

    default:
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '—';
      }
      // Convert to string (text format)
      return String(value);
  }
}
