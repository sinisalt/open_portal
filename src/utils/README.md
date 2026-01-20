# Utils Directory

This directory contains **utility functions and helper modules** used throughout the application.

## Purpose

Utilities provide:
- **Common Functions**: Reusable helper functions
- **Data Transformation**: Format, parse, transform data
- **Validation**: Input validation, schema validation
- **String Operations**: Formatting, sanitization
- **Date/Time**: Date formatting, calculations
- **Object/Array**: Manipulation helpers

## Utility Categories

### Validation
- `validators.js` - Input validation functions
- `schemaValidator.js` - JSON schema validation
- `formValidators.js` - Form-specific validations

### Data Transformation
- `formatters.js` - Data formatting (currency, numbers, dates)
- `parsers.js` - Data parsing (JSON, CSV)
- `transformers.js` - Data structure transformation

### String Utilities
- `stringUtils.js` - String manipulation
- `sanitize.js` - HTML/input sanitization
- `slugify.js` - Create URL-friendly slugs

### Date/Time Utilities
- `dateUtils.js` - Date formatting and calculations
- `timezone.js` - Timezone conversions

### Object/Array Utilities
- `objectUtils.js` - Object manipulation (deep merge, clone)
- `arrayUtils.js` - Array operations (chunk, unique, group)

### URL/Path Utilities
- `urlUtils.js` - URL parsing and building
- `pathUtils.js` - Path resolution and normalization

### Browser Utilities
- `localStorage.js` - localStorage wrapper with error handling
- `sessionStorage.js` - sessionStorage wrapper
- `cookies.js` - Cookie management

### Performance Utilities
- `debounce.js` - Debounce function calls
- `throttle.js` - Throttle function calls
- `memoize.js` - Memoization helper

## Utility Guidelines

1. **Pure Functions**: Utilities should be pure (no side effects)
2. **Single Responsibility**: Each function does one thing well
3. **Immutability**: Don't mutate input parameters
4. **Error Handling**: Handle edge cases gracefully
5. **Documentation**: Document parameters, return values, examples

## Example Utility

```javascript
// formatters.js

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Format a date in a readable format
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (default: 'MM/DD/YYYY')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'MM/DD/YYYY') {
  const d = new Date(date);
  // Format logic...
  return formattedDate;
}
```

## Common Utilities

### Validation
```javascript
// validators.js
export function isEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

### Data Transformation
```javascript
// transformers.js
export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
```

### Array Operations
```javascript
// arrayUtils.js
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique(array) {
  return [...new Set(array)];
}
```

## File Structure

```
utils/
├── validation/
│   ├── validators.js
│   ├── schemaValidator.js
│   └── formValidators.js
├── data/
│   ├── formatters.js
│   ├── parsers.js
│   └── transformers.js
├── string/
│   ├── stringUtils.js
│   ├── sanitize.js
│   └── slugify.js
├── date/
│   ├── dateUtils.js
│   └── timezone.js
├── object/
│   ├── objectUtils.js
│   └── arrayUtils.js
├── url/
│   ├── urlUtils.js
│   └── pathUtils.js
├── browser/
│   ├── localStorage.js
│   ├── sessionStorage.js
│   └── cookies.js
├── performance/
│   ├── debounce.js
│   ├── throttle.js
│   └── memoize.js
└── README.md
```

## Testing

Utility tests should:
- Test all edge cases
- Test error handling
- Test with various input types
- Test boundary conditions
- Be fast and deterministic

Example test:
```javascript
import { formatCurrency } from './formatters';

describe('formatCurrency', () => {
  test('formats USD correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  test('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('handles negative values', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
  });
});
```

## Best Practices

1. **Tree-shakable**: Export individual functions, not default objects
2. **No Side Effects**: Keep functions pure
3. **Composability**: Build complex utilities from simple ones
4. **Error Handling**: Return safe defaults or throw meaningful errors
5. **Documentation**: Include JSDoc comments with examples
6. **Performance**: Optimize hot paths, use memoization when appropriate
7. **TypeScript**: Add type definitions for better IDE support

## Dependencies

- **Minimal**: Avoid heavy dependencies in utilities
- Use native JavaScript APIs when possible
- Consider tree-shaking implications
