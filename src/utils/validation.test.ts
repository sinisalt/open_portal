/**
 * Validation Utilities Tests
 */

import type { ValidationRule } from '@/types/form.types';
import {
  validateAllFields,
  validateEmail,
  validateMax,
  validateMaxLength,
  validateMin,
  validateMinLength,
  validatePattern,
  validatePhone,
  validateRequired,
  validateUrl,
  validateValue,
} from './validation';

describe('Validation Utilities', () => {
  describe('validateRequired', () => {
    it('should return valid for non-empty string', () => {
      const result = validateRequired('test');
      expect(result.valid).toBe(true);
    });

    it('should return invalid for empty string', () => {
      const result = validateRequired('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    it('should return invalid for null', () => {
      const result = validateRequired(null);
      expect(result.valid).toBe(false);
    });

    it('should return invalid for undefined', () => {
      const result = validateRequired(undefined);
      expect(result.valid).toBe(false);
    });

    it('should return invalid for empty array', () => {
      const result = validateRequired([]);
      expect(result.valid).toBe(false);
    });

    it('should use custom error message', () => {
      const result = validateRequired('', 'Custom required message');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Custom required message');
    });

    it('should return valid for number 0', () => {
      const result = validateRequired(0);
      expect(result.valid).toBe(true);
    });

    it('should return valid for boolean false', () => {
      const result = validateRequired(false);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateMinLength', () => {
    it('should return valid for string meeting minimum length', () => {
      const result = validateMinLength('test', 3);
      expect(result.valid).toBe(true);
    });

    it('should return invalid for string below minimum length', () => {
      const result = validateMinLength('ab', 3);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be at least 3 characters');
    });

    it('should use custom error message', () => {
      const result = validateMinLength('ab', 3, 'Too short');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Too short');
    });

    it('should skip validation for empty value', () => {
      const result = validateMinLength('', 3);
      expect(result.valid).toBe(true);
    });

    it('should skip validation for null', () => {
      const result = validateMinLength(null, 3);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateMaxLength', () => {
    it('should return valid for string within maximum length', () => {
      const result = validateMaxLength('test', 10);
      expect(result.valid).toBe(true);
    });

    it('should return invalid for string exceeding maximum length', () => {
      const result = validateMaxLength('toolongstring', 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be no more than 5 characters');
    });

    it('should use custom error message', () => {
      const result = validateMaxLength('toolongstring', 5, 'Too long');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Too long');
    });

    it('should skip validation for empty value', () => {
      const result = validateMaxLength('', 5);
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePattern', () => {
    it('should return valid for matching regex pattern', () => {
      const result = validatePattern('abc123', /^[a-z0-9]+$/);
      expect(result.valid).toBe(true);
    });

    it('should return invalid for non-matching regex pattern', () => {
      const result = validatePattern('ABC', /^[a-z]+$/);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid format');
    });

    it('should accept string pattern', () => {
      const result = validatePattern('abc', '^[a-z]+$');
      expect(result.valid).toBe(true);
    });

    it('should use custom error message', () => {
      const result = validatePattern('ABC', /^[a-z]+$/, 'Lowercase only');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Lowercase only');
    });

    it('should skip validation for empty value', () => {
      const result = validatePattern('', /^[a-z]+$/);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateMin', () => {
    it('should return valid for number meeting minimum', () => {
      const result = validateMin(10, 5);
      expect(result.valid).toBe(true);
    });

    it('should return invalid for number below minimum', () => {
      const result = validateMin(3, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be at least 5');
    });

    it('should use custom error message', () => {
      const result = validateMin(3, 5, 'Too small');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Too small');
    });

    it('should skip validation for empty value', () => {
      const result = validateMin('', 5);
      expect(result.valid).toBe(true);
    });

    it('should handle string numbers', () => {
      const result = validateMin('10', 5);
      expect(result.valid).toBe(true);
    });

    it('should return invalid for non-numeric value', () => {
      const result = validateMin('abc', 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be a valid number');
    });
  });

  describe('validateMax', () => {
    it('should return valid for number within maximum', () => {
      const result = validateMax(5, 10);
      expect(result.valid).toBe(true);
    });

    it('should return invalid for number exceeding maximum', () => {
      const result = validateMax(15, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be no more than 10');
    });

    it('should use custom error message', () => {
      const result = validateMax(15, 10, 'Too large');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Too large');
    });

    it('should skip validation for empty value', () => {
      const result = validateMax('', 10);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('should return valid for correct email format', () => {
      expect(validateEmail('test@example.com').valid).toBe(true);
      expect(validateEmail('user.name@domain.co.uk').valid).toBe(true);
      expect(validateEmail('user+tag@example.com').valid).toBe(true);
    });

    it('should return invalid for incorrect email format', () => {
      expect(validateEmail('invalid').valid).toBe(false);
      expect(validateEmail('test@').valid).toBe(false);
      expect(validateEmail('@example.com').valid).toBe(false);
      expect(validateEmail('test @example.com').valid).toBe(false);
    });

    it('should use custom error message', () => {
      const result = validateEmail('invalid', 'Bad email');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Bad email');
    });

    it('should skip validation for empty value', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateUrl', () => {
    it('should return valid for correct URL format', () => {
      expect(validateUrl('https://example.com').valid).toBe(true);
      expect(validateUrl('http://example.com').valid).toBe(true);
      expect(validateUrl('https://www.example.com/path').valid).toBe(true);
      expect(validateUrl('https://example.com/path?query=value').valid).toBe(true);
    });

    it('should return invalid for incorrect URL format', () => {
      expect(validateUrl('invalid').valid).toBe(false);
      expect(validateUrl('example.com').valid).toBe(false);
      expect(validateUrl('ftp://example.com').valid).toBe(false);
    });

    it('should use custom error message', () => {
      const result = validateUrl('invalid', 'Bad URL');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Bad URL');
    });

    it('should skip validation for empty value', () => {
      const result = validateUrl('');
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePhone', () => {
    it('should return valid for correct phone format', () => {
      expect(validatePhone('1234567890').valid).toBe(true);
      expect(validatePhone('+1234567890').valid).toBe(true);
      expect(validatePhone('123-456-7890').valid).toBe(true);
      expect(validatePhone('(123) 456-7890').valid).toBe(true);
      expect(validatePhone('+1 (123) 456-7890').valid).toBe(true);
    });

    it('should return invalid for incorrect phone format', () => {
      expect(validatePhone('abc').valid).toBe(false);
      expect(validatePhone('12').valid).toBe(false);
    });

    it('should use custom error message', () => {
      const result = validatePhone('invalid', 'Bad phone');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Bad phone');
    });

    it('should skip validation for empty value', () => {
      const result = validatePhone('');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateValue', () => {
    it('should validate required rule', async () => {
      const rules: ValidationRule = { required: true };
      const result = await validateValue('', rules);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    it('should validate multiple rules in order', async () => {
      const rules: ValidationRule = {
        required: true,
        minLength: { value: 5, message: 'Too short' },
      };

      // Should fail on required first
      const result1 = await validateValue('', rules);
      expect(result1.valid).toBe(false);
      expect(result1.error).toBe('This field is required');

      // Should fail on minLength
      const result2 = await validateValue('abc', rules);
      expect(result2.valid).toBe(false);
      expect(result2.error).toBe('Too short');
    });

    it('should validate custom function', async () => {
      const rules: ValidationRule = {
        custom: value => {
          if (value !== 'valid') {
            return 'Must be "valid"';
          }
          return true;
        },
      };

      const result1 = await validateValue('invalid', rules);
      expect(result1.valid).toBe(false);
      expect(result1.error).toBe('Must be "valid"');

      const result2 = await validateValue('valid', rules);
      expect(result2.valid).toBe(true);
    });

    it('should validate async validation', async () => {
      const rules: ValidationRule = {
        asyncValidation: async value => {
          await new Promise(resolve => setTimeout(resolve, 10));
          if (value !== 'async-valid') {
            return 'Async validation failed';
          }
          return true;
        },
      };

      const result1 = await validateValue('invalid', rules);
      expect(result1.valid).toBe(false);
      expect(result1.error).toBe('Async validation failed');

      const result2 = await validateValue('async-valid', rules);
      expect(result2.valid).toBe(true);
    });

    it('should pass all values to custom validation', async () => {
      const allValues = { field1: 'value1', field2: 'value2' };
      const rules: ValidationRule = {
        custom: (_value, values) => {
          if (values?.field1 !== 'value1') {
            return 'Invalid cross-field validation';
          }
          return true;
        },
      };

      const result = await validateValue('test', rules, allValues);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateAllFields', () => {
    it('should validate all fields and return errors', async () => {
      const values = {
        email: 'invalid',
        age: '15',
        name: '',
      };

      const rules = {
        email: { email: true },
        age: { min: { value: 18, message: 'Must be 18+' } },
        name: { required: 'Name is required' },
      };

      const result = await validateAllFields(values, rules);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
      expect(result.errors.age).toBe('Must be 18+');
      expect(result.errors.name).toBe('Name is required');
    });

    it('should return valid when all fields pass', async () => {
      const values = {
        email: 'test@example.com',
        age: '25',
        name: 'John Doe',
      };

      const rules = {
        email: { email: true },
        age: { min: { value: 18, message: 'Must be 18+' } },
        name: { required: 'Name is required' },
      };

      const result = await validateAllFields(values, rules);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should handle empty rules object', async () => {
      const values = { field1: 'value1' };
      const rules = {};

      const result = await validateAllFields(values, rules);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });
});
