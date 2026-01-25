/**
 * Tests for Cross-Field Validation System
 */

import {
  type CrossFieldValidationRule,
  createCrossFieldRule,
  executeCrossFieldValidation,
  getCrossFieldDependencies,
  validateAfterDate,
  validateAllOrNone,
  validateAtLeastOne,
  validateBeforeDate,
  validateConditionalRequired,
  validateDateRange,
  validateFieldMatch,
  validateGreaterThan,
  validateLessThan,
  validatePasswordConfirmation,
  validateSum,
} from './crossFieldValidation';

describe('Cross-Field Validation System', () => {
  describe('validateDateRange', () => {
    it('should create a date range validation rule', () => {
      const rule = validateDateRange('endDate', 'startDate', 'Invalid date range');

      expect(rule.dependencies).toEqual(['startDate']);
      expect(rule.message).toBe('Invalid date range');
    });

    it('should validate that end date is after start date', () => {
      const rule = validateDateRange('endDate', 'startDate');
      const formData = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const result = rule.validate('2024-12-31', formData);
      expect(result).toBe(true);
    });

    it('should fail when end date is before start date', () => {
      const rule = validateDateRange('endDate', 'startDate');
      const formData = {
        startDate: '2024-12-31',
        endDate: '2024-01-01',
      };

      const result = rule.validate('2024-01-01', formData);
      expect(result).toBe('End date must be after start date');
    });

    it('should skip validation when dates are empty', () => {
      const rule = validateDateRange('endDate', 'startDate');
      const formData = {
        startDate: '',
        endDate: '',
      };

      const result = rule.validate('', formData);
      expect(result).toBe(true);
    });
  });

  describe('validateAfterDate', () => {
    it('should validate date is after another date', () => {
      const formData = { startDate: '2024-01-01' };
      const result = validateAfterDate('2024-12-31', 'startDate', formData);

      expect(result.valid).toBe(true);
    });

    it('should fail when date is not after', () => {
      const formData = { startDate: '2024-12-31' };
      const result = validateAfterDate('2024-01-01', 'startDate', formData);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('startDate');
    });

    it('should use custom error message', () => {
      const formData = { startDate: '2024-12-31' };
      const result = validateAfterDate('2024-01-01', 'startDate', formData, 'Custom error');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Custom error');
    });
  });

  describe('validateBeforeDate', () => {
    it('should validate date is before another date', () => {
      const formData = { endDate: '2024-12-31' };
      const result = validateBeforeDate('2024-01-01', 'endDate', formData);

      expect(result.valid).toBe(true);
    });

    it('should fail when date is not before', () => {
      const formData = { endDate: '2024-01-01' };
      const result = validateBeforeDate('2024-12-31', 'endDate', formData);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('endDate');
    });
  });

  describe('validateGreaterThan', () => {
    it('should validate number is greater than another field', () => {
      const formData = { minValue: 10 };
      const result = validateGreaterThan(20, 'minValue', formData);

      expect(result.valid).toBe(true);
    });

    it('should fail when number is not greater', () => {
      const formData = { minValue: 20 };
      const result = validateGreaterThan(10, 'minValue', formData);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('minValue');
    });

    it('should skip validation for non-numeric values', () => {
      const formData = { minValue: 'not a number' };
      const result = validateGreaterThan('also not a number', 'minValue', formData);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateLessThan', () => {
    it('should validate number is less than another field', () => {
      const formData = { maxValue: 100 };
      const result = validateLessThan(50, 'maxValue', formData);

      expect(result.valid).toBe(true);
    });

    it('should fail when number is not less', () => {
      const formData = { maxValue: 50 };
      const result = validateLessThan(100, 'maxValue', formData);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('maxValue');
    });
  });

  describe('validateFieldMatch', () => {
    it('should validate fields match', () => {
      const formData = { password: 'secret123' };
      const result = validateFieldMatch('secret123', 'password', formData);

      expect(result.valid).toBe(true);
    });

    it('should fail when fields do not match', () => {
      const formData = { password: 'secret123' };
      const result = validateFieldMatch('different', 'password', formData);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('password');
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('should validate password confirmation matches', () => {
      const formData = { password: 'secret123' };
      const result = validatePasswordConfirmation('secret123', 'password', formData);

      expect(result.valid).toBe(true);
    });

    it('should fail when passwords do not match', () => {
      const formData = { password: 'secret123' };
      const result = validatePasswordConfirmation('different', 'password', formData);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Passwords must match');
    });
  });

  describe('validateAtLeastOne', () => {
    it('should pass when at least one field is filled', () => {
      const formData = {
        phone: '555-1234',
        email: '',
        fax: '',
      };

      const result = validateAtLeastOne(['phone', 'email', 'fax'], formData);
      expect(result.valid).toBe(true);
    });

    it('should fail when no fields are filled', () => {
      const formData = {
        phone: '',
        email: '',
        fax: '',
      };

      const result = validateAtLeastOne(['phone', 'email', 'fax'], formData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('At least one');
    });
  });

  describe('validateAllOrNone', () => {
    it('should pass when all fields are filled', () => {
      const formData = {
        street: '123 Main St',
        city: 'Springfield',
        zip: '12345',
      };

      const result = validateAllOrNone(['street', 'city', 'zip'], formData);
      expect(result.valid).toBe(true);
    });

    it('should pass when no fields are filled', () => {
      const formData = {
        street: '',
        city: '',
        zip: '',
      };

      const result = validateAllOrNone(['street', 'city', 'zip'], formData);
      expect(result.valid).toBe(true);
    });

    it('should fail when some but not all fields are filled', () => {
      const formData = {
        street: '123 Main St',
        city: 'Springfield',
        zip: '',
      };

      const result = validateAllOrNone(['street', 'city', 'zip'], formData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Either fill all or none');
    });
  });

  describe('validateConditionalRequired', () => {
    it('should require field when condition is met', () => {
      const formData = { employmentStatus: 'employed' };

      const result = validateConditionalRequired(
        '',
        'employmentStatus',
        'employed',
        formData,
        'Company name is required'
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Company name is required');
    });

    it('should not require field when condition is not met', () => {
      const formData = { employmentStatus: 'unemployed' };

      const result = validateConditionalRequired('', 'employmentStatus', 'employed', formData);

      expect(result.valid).toBe(true);
    });

    it('should pass when condition is met and field is filled', () => {
      const formData = { employmentStatus: 'employed' };

      const result = validateConditionalRequired(
        'Acme Corp',
        'employmentStatus',
        'employed',
        formData
      );

      expect(result.valid).toBe(true);
    });
  });

  describe('validateSum', () => {
    it('should validate sum equals total of fields', () => {
      const formData = {
        item1: 10,
        item2: 20,
        item3: 30,
      };

      const result = validateSum(60, ['item1', 'item2', 'item3'], formData);
      expect(result.valid).toBe(true);
    });

    it('should fail when sum does not match', () => {
      const formData = {
        item1: 10,
        item2: 20,
        item3: 30,
      };

      const result = validateSum(100, ['item1', 'item2', 'item3'], formData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Must equal the sum');
    });

    it('should handle floating point precision', () => {
      const formData = {
        item1: 0.1,
        item2: 0.2,
      };

      // 0.1 + 0.2 = 0.30000000000000004 in JavaScript
      const result = validateSum(0.3, ['item1', 'item2'], formData);
      expect(result.valid).toBe(true);
    });
  });

  describe('createCrossFieldRule', () => {
    it('should create a custom cross-field rule', () => {
      const rule = createCrossFieldRule(
        ['password'],
        (value, formData) => {
          return value === formData.password;
        },
        'Must match password'
      );

      expect(rule.dependencies).toEqual(['password']);
      expect(rule.message).toBe('Must match password');
    });

    it('should execute custom validation logic', () => {
      const rule = createCrossFieldRule(['age'], (value, formData) => {
        const age = Number(formData.age);
        return age >= 18 ? true : 'Must be 18 or older';
      });

      const formData = { age: 25 };
      const result = rule.validate('anything', formData);
      expect(result).toBe(true);
    });

    it('should use default message when validation returns false', () => {
      const rule = createCrossFieldRule(
        ['field1'],
        (value, formData) => {
          return false;
        },
        'Custom error'
      );

      const result = rule.validate('value', { field1: 'value' });
      expect(result).toBe('Custom error');
    });
  });

  describe('getCrossFieldDependencies', () => {
    it('should extract all dependencies from rules', () => {
      const rules: CrossFieldValidationRule[] = [
        validateDateRange('endDate', 'startDate'),
        createCrossFieldRule(['field1', 'field2'], () => true),
        createCrossFieldRule(['field2', 'field3'], () => true),
      ];

      const deps = getCrossFieldDependencies(rules);
      expect(deps).toEqual(expect.arrayContaining(['startDate', 'field1', 'field2', 'field3']));
      expect(deps.length).toBe(4);
    });
  });

  describe('executeCrossFieldValidation', () => {
    it('should execute all rules and return success', () => {
      const rules: CrossFieldValidationRule[] = [
        createCrossFieldRule(['age'], (value, formData) => {
          return Number(formData.age) >= 18 ? true : 'Must be 18+';
        }),
        createCrossFieldRule(['country'], (value, formData) => {
          return formData.country === 'US' ? true : 'Must be US';
        }),
      ];

      const formData = { age: 25, country: 'US' };
      const result = executeCrossFieldValidation('someField', 'value', rules, formData);

      expect(result.valid).toBe(true);
    });

    it('should fail on first rule that fails', () => {
      const rules: CrossFieldValidationRule[] = [
        createCrossFieldRule(['age'], (value, formData) => {
          return Number(formData.age) >= 18 ? true : 'Must be 18+';
        }),
        createCrossFieldRule(['country'], (value, formData) => {
          return formData.country === 'US' ? true : 'Must be US';
        }),
      ];

      const formData = { age: 15, country: 'US' };
      const result = executeCrossFieldValidation('someField', 'value', rules, formData);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be 18+');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete date range validation scenario', () => {
      const formData = {
        projectStartDate: '2024-01-01',
        projectEndDate: '2024-12-31',
        milestoneDate: '2024-06-30',
      };

      // Validate end date is after start date
      const endDateResult = validateAfterDate(
        formData.projectEndDate,
        'projectStartDate',
        formData,
        'Project end date must be after start date'
      );
      expect(endDateResult.valid).toBe(true);

      // Validate milestone is between start and end
      const milestoneAfterStart = validateAfterDate(
        formData.milestoneDate,
        'projectStartDate',
        formData
      );
      const milestoneBeforeEnd = validateBeforeDate(
        formData.milestoneDate,
        'projectEndDate',
        formData
      );

      expect(milestoneAfterStart.valid).toBe(true);
      expect(milestoneBeforeEnd.valid).toBe(true);
    });

    it('should handle complex employee form validation', () => {
      const formData = {
        employmentStatus: 'employed',
        companyName: '',
        startDate: '',
      };

      // Company name required when employed
      const companyResult = validateConditionalRequired(
        formData.companyName,
        'employmentStatus',
        'employed',
        formData,
        'Company name is required for employed status'
      );
      expect(companyResult.valid).toBe(false);

      // Start date required when employed
      const startDateResult = validateConditionalRequired(
        formData.startDate,
        'employmentStatus',
        'employed',
        formData,
        'Start date is required for employed status'
      );
      expect(startDateResult.valid).toBe(false);
    });

    it('should handle budget allocation validation', () => {
      const formData = {
        total: 1000,
        marketing: 300,
        development: 400,
        operations: 300,
      };

      const result = validateSum(
        formData.total,
        ['marketing', 'development', 'operations'],
        formData,
        'Total must equal sum of allocations'
      );

      expect(result.valid).toBe(true);
    });
  });
});
