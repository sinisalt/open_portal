/**
 * Formatting Utilities Tests
 */

import {
  formatCurrency,
  formatDateValue,
  formatNumber,
  formatPercent,
  formatValue,
} from './formatters';

describe('formatNumber', () => {
  it('formats numbers with default options', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1234.5678)).toBe('1,235');
  });

  it('formats numbers with decimals', () => {
    expect(formatNumber(1234.5678, { decimals: 2 })).toBe('1,234.57');
    expect(formatNumber(1234.5, { decimals: 2 })).toBe('1,234.50');
  });

  it('formats numbers without grouping', () => {
    expect(formatNumber(1234, { useGrouping: false })).toBe('1234');
  });

  it('handles string input', () => {
    expect(formatNumber('1234.56', { decimals: 2 })).toBe('1,234.56');
  });

  it('handles null/undefined', () => {
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber('')).toBe('—');
  });

  it('handles NaN', () => {
    expect(formatNumber(Number.NaN)).toBe('—');
    expect(formatNumber('invalid')).toBe('—');
  });
});

describe('formatCurrency', () => {
  it('formats currency with default options', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats currency with different currency codes', () => {
    expect(formatCurrency(1234.56, { currency: 'EUR' })).toMatch(/€|EUR/);
  });

  it('formats currency with custom decimals', () => {
    expect(formatCurrency(1234, { decimals: 0 })).toBe('$1,234');
    expect(formatCurrency(1234.567, { decimals: 3 })).toBe('$1,234.567');
  });

  it('handles string input', () => {
    expect(formatCurrency('1234.56')).toBe('$1,234.56');
  });

  it('handles null/undefined', () => {
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(undefined)).toBe('—');
    expect(formatCurrency('')).toBe('—');
  });

  it('handles NaN', () => {
    expect(formatCurrency(Number.NaN)).toBe('—');
    expect(formatCurrency('invalid')).toBe('—');
  });
});

describe('formatPercent', () => {
  it('formats percentages with default options', () => {
    expect(formatPercent(0.25)).toBe('25%');
    expect(formatPercent(0.5)).toBe('50%');
    expect(formatPercent(1)).toBe('100%');
  });

  it('formats percentages with decimals', () => {
    expect(formatPercent(0.2567, { decimals: 2 })).toBe('25.67%');
    expect(formatPercent(0.25, { decimals: 1 })).toBe('25.0%');
  });

  it('handles string input', () => {
    expect(formatPercent('0.25')).toBe('25%');
  });

  it('handles null/undefined', () => {
    expect(formatPercent(null)).toBe('—');
    expect(formatPercent(undefined)).toBe('—');
    expect(formatPercent('')).toBe('—');
  });

  it('handles NaN', () => {
    expect(formatPercent(Number.NaN)).toBe('—');
    expect(formatPercent('invalid')).toBe('—');
  });
});

describe('formatDateValue', () => {
  const testDate = new Date('2024-01-15T12:00:00Z');

  it('formats dates with default format', () => {
    const result = formatDateValue(testDate);
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('formats dates with custom format', () => {
    expect(formatDateValue(testDate, { format: 'yyyy-MM-dd' })).toBe('2024-01-15');
    expect(formatDateValue(testDate, { format: 'MM/dd/yyyy' })).toBe('01/15/2024');
  });

  it('handles string input', () => {
    const result = formatDateValue('2024-01-15');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('handles timestamp input', () => {
    const result = formatDateValue(testDate.getTime());
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('handles null/undefined', () => {
    expect(formatDateValue(null)).toBe('—');
    expect(formatDateValue(undefined)).toBe('—');
    expect(formatDateValue('')).toBe('—');
  });

  it('handles invalid dates', () => {
    expect(formatDateValue('invalid')).toBe('—');
    expect(formatDateValue(Number.NaN)).toBe('—');
  });
});

describe('formatValue', () => {
  it('formats text values', () => {
    expect(formatValue('hello', 'text')).toBe('hello');
    expect(formatValue(123, 'text')).toBe('123');
    expect(formatValue(true, 'text')).toBe('true');
  });

  it('formats number values', () => {
    expect(formatValue(1234, 'number')).toBe('1,234');
    expect(formatValue(1234.56, 'number', { decimals: 2 })).toBe('1,234.56');
  });

  it('formats currency values', () => {
    expect(formatValue(1234.56, 'currency')).toBe('$1,234.56');
    expect(formatValue(1234, 'currency', { currency: 'EUR' })).toMatch(/€|EUR/);
  });

  it('formats percent values', () => {
    expect(formatValue(0.25, 'percent')).toBe('25%');
    expect(formatValue(0.2567, 'percent', { decimals: 2 })).toBe('25.67%');
  });

  it('formats date values', () => {
    const testDate = new Date('2024-01-15T12:00:00Z');
    const result = formatValue(testDate, 'date');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('handles null/undefined', () => {
    expect(formatValue(null, 'text')).toBe('—');
    expect(formatValue(undefined, 'text')).toBe('—');
  });

  it('defaults to text format', () => {
    expect(formatValue('test')).toBe('test');
    expect(formatValue(123)).toBe('123');
  });
});
