/**
 * Tests for Computed Fields System
 */

import {
  type ComputedFieldConfig,
  type ComputedFieldContext,
  createConcatField,
  createConditionalField,
  createPercentageField,
  createProductField,
  createSumField,
  evaluateComputedExpression,
  evaluateComputedField,
  getAffectedComputedFields,
  getComputedDependencies,
  resolveComputedExpression,
  updateAffectedComputedFields,
  updateComputedFields,
} from './computedFields';

describe('Computed Fields System', () => {
  describe('evaluateComputedField', () => {
    it('should evaluate simple math expressions', () => {
      const config: ComputedFieldConfig = {
        expression: '{{formData.quantity}} * {{formData.price}}',
      };

      const context: ComputedFieldContext = {
        formData: {
          quantity: 5,
          price: 10.5,
        },
      };

      const result = evaluateComputedField(config, context);
      expect(result).toBe(52.5);
    });

    it('should evaluate complex expressions', () => {
      const config: ComputedFieldConfig = {
        expression: '({{formData.subtotal}} * {{formData.taxRate}}) + {{formData.shipping}}',
      };

      const context: ComputedFieldContext = {
        formData: {
          subtotal: 100,
          taxRate: 0.1,
          shipping: 15,
        },
      };

      const result = evaluateComputedField(config, context);
      expect(result).toBe(25); // (100 * 0.1) + 15 = 25
    });

    it('should handle string concatenation', () => {
      const config: ComputedFieldConfig = {
        expression: '{{formData.firstName}} + " " + {{formData.lastName}}',
      };

      const context: ComputedFieldContext = {
        formData: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const result = evaluateComputedField(config, context);
      expect(result).toBe('John Doe');
    });

    it('should use function expressions', () => {
      const config: ComputedFieldConfig = {
        expression: formData => {
          const quantity = Number(formData.quantity) || 0;
          const price = Number(formData.price) || 0;
          return quantity * price;
        },
      };

      const context: ComputedFieldContext = {
        formData: {
          quantity: 3,
          price: 20,
        },
      };

      const result = evaluateComputedField(config, context);
      expect(result).toBe(60);
    });

    it('should apply precision to numeric results', () => {
      const config: ComputedFieldConfig = {
        expression: '{{formData.a}} / {{formData.b}}',
        precision: 2,
      };

      const context: ComputedFieldContext = {
        formData: {
          a: 10,
          b: 3,
        },
      };

      const result = evaluateComputedField(config, context);
      expect(result).toBe(3.33);
    });

    it('should apply custom format function', () => {
      const config: ComputedFieldConfig = {
        expression: '{{formData.value}} * 100',
        format: value => `$${value}`,
      };

      const context: ComputedFieldContext = {
        formData: {
          value: 5,
        },
      };

      const result = evaluateComputedField(config, context);
      expect(result).toBe('$500');
    });

    it('should handle null/undefined values as 0', () => {
      const config: ComputedFieldConfig = {
        expression: '{{formData.a}} + {{formData.b}}',
      };

      const context: ComputedFieldContext = {
        formData: {
          a: 10,
          b: null,
        },
      };

      const result = evaluateComputedField(config, context);
      expect(result).toBe(10);
    });
  });

  describe('resolveComputedExpression', () => {
    it('should resolve numeric values', () => {
      const context: ComputedFieldContext = {
        formData: {
          quantity: 5,
          price: 10,
        },
      };

      const result = resolveComputedExpression(
        '{{formData.quantity}} * {{formData.price}}',
        context
      );
      expect(result).toBe('5 * 10');
    });

    it('should resolve string values with quotes', () => {
      const context: ComputedFieldContext = {
        formData: {
          name: 'John',
        },
      };

      const result = resolveComputedExpression('{{formData.name}}', context);
      expect(result).toBe('"John"');
    });

    it('should handle nested object paths', () => {
      const context: ComputedFieldContext = {
        formData: {
          user: {
            profile: {
              age: 25,
            },
          },
        },
      };

      const result = resolveComputedExpression('{{formData.user.profile.age}} >= 18', context);
      expect(result).toBe('25 >= 18');
    });
  });

  describe('evaluateComputedExpression', () => {
    it('should evaluate math expressions', () => {
      expect(evaluateComputedExpression('5 * 10')).toBe(50);
      expect(evaluateComputedExpression('100 / 4')).toBe(25);
      expect(evaluateComputedExpression('10 + 20 - 5')).toBe(25);
    });

    it('should evaluate comparison expressions', () => {
      expect(evaluateComputedExpression('10 > 5')).toBe(true);
      expect(evaluateComputedExpression('5 >= 5')).toBe(true);
      expect(evaluateComputedExpression('3 < 2')).toBe(false);
    });

    it('should evaluate logical expressions', () => {
      expect(evaluateComputedExpression('true && true')).toBe(true);
      expect(evaluateComputedExpression('true || false')).toBe(true);
      expect(evaluateComputedExpression('!false')).toBe(true);
    });

    it('should evaluate ternary expressions', () => {
      expect(evaluateComputedExpression('10 > 5 ? 100 : 50')).toBe(100);
      expect(evaluateComputedExpression('3 < 2 ? "yes" : "no"')).toBe('no');
    });

    it('should reject unsafe expressions', () => {
      const result = evaluateComputedExpression('eval("alert(1)")');
      expect(result).toBe(null);
    });

    it('should handle invalid expressions gracefully', () => {
      const result = evaluateComputedExpression('invalid expression $#@');
      expect(result).toBe(null);
    });
  });

  describe('getComputedDependencies', () => {
    it('should extract dependencies from string expressions', () => {
      const deps = getComputedDependencies('{{formData.quantity}} * {{formData.price}}');
      expect(deps).toEqual(['quantity', 'price']);
    });

    it('should extract unique dependencies', () => {
      const deps = getComputedDependencies(
        '{{formData.value}} + {{formData.value}} * {{formData.multiplier}}'
      );
      expect(deps).toEqual(['value', 'multiplier']);
    });

    it('should handle nested paths', () => {
      const deps = getComputedDependencies('{{formData.user.age}} >= 18');
      expect(deps).toEqual(['user']);
    });

    it('should return empty array for function expressions', () => {
      const deps = getComputedDependencies(() => 100);
      expect(deps).toEqual([]);
    });
  });

  describe('getAffectedComputedFields', () => {
    it('should find computed fields affected by a field change', () => {
      const computedFields: Record<string, ComputedFieldConfig> = {
        total: {
          expression: '{{formData.quantity}} * {{formData.price}}',
        },
        fullName: {
          expression: '{{formData.firstName}} + " " + {{formData.lastName}}',
        },
      };

      const affected = getAffectedComputedFields('quantity', computedFields);
      expect(affected).toEqual(['total']);
    });

    it('should respect explicit dependencies', () => {
      const computedFields: Record<string, ComputedFieldConfig> = {
        total: {
          expression: formData => Number(formData.a) + Number(formData.b),
          dependencies: ['a', 'b'],
        },
      };

      const affected = getAffectedComputedFields('a', computedFields);
      expect(affected).toEqual(['total']);
    });

    it('should skip non-reactive fields', () => {
      const computedFields: Record<string, ComputedFieldConfig> = {
        total: {
          expression: '{{formData.quantity}} * {{formData.price}}',
          reactive: false,
        },
      };

      const affected = getAffectedComputedFields('quantity', computedFields);
      expect(affected).toEqual([]);
    });
  });

  describe('updateComputedFields', () => {
    it('should update all computed fields', () => {
      const formData = {
        quantity: 5,
        price: 10,
        firstName: 'John',
        lastName: 'Doe',
      };

      const computedFields: Record<string, ComputedFieldConfig> = {
        total: {
          expression: '{{formData.quantity}} * {{formData.price}}',
        },
        fullName: {
          expression: '{{formData.firstName}} + " " + {{formData.lastName}}',
        },
      };

      const updated = updateComputedFields(formData, computedFields);

      expect(updated.total).toBe(50);
      expect(updated.fullName).toBe('John Doe');
    });

    it('should preserve existing field values', () => {
      const formData = {
        quantity: 5,
        price: 10,
        notes: 'Test notes',
      };

      const computedFields: Record<string, ComputedFieldConfig> = {
        total: {
          expression: '{{formData.quantity}} * {{formData.price}}',
        },
      };

      const updated = updateComputedFields(formData, computedFields);

      expect(updated.quantity).toBe(5);
      expect(updated.price).toBe(10);
      expect(updated.notes).toBe('Test notes');
    });
  });

  describe('updateAffectedComputedFields', () => {
    it('should update only affected computed fields', () => {
      const formData = {
        quantity: 5,
        price: 10,
        taxRate: 0.1,
        shipping: 15,
      };

      const computedFields: Record<string, ComputedFieldConfig> = {
        subtotal: {
          expression: '{{formData.quantity}} * {{formData.price}}',
        },
        total: {
          expression: '{{formData.subtotal}} * (1 + {{formData.taxRate}}) + {{formData.shipping}}',
          dependencies: ['subtotal', 'taxRate', 'shipping'],
        },
      };

      // Update quantity - should affect subtotal only
      const updated = updateAffectedComputedFields('quantity', formData, computedFields);

      expect(updated.subtotal).toBe(50);
      expect(updated.total).toBeUndefined(); // Not calculated yet
    });

    it('should return unchanged data when no fields affected', () => {
      const formData = {
        quantity: 5,
        price: 10,
        notes: 'Test',
      };

      const computedFields: Record<string, ComputedFieldConfig> = {
        total: {
          expression: '{{formData.quantity}} * {{formData.price}}',
        },
      };

      const updated = updateAffectedComputedFields('notes', formData, computedFields);

      expect(updated).toBe(formData); // Same reference
    });
  });

  describe('Helper Functions', () => {
    describe('createSumField', () => {
      it('should create a sum field configuration', () => {
        const config = createSumField(['a', 'b', 'c'], 2);

        expect(config.expression).toBe('{{formData.a}} + {{formData.b}} + {{formData.c}}');
        expect(config.dependencies).toEqual(['a', 'b', 'c']);
        expect(config.precision).toBe(2);
      });

      it('should evaluate sum correctly', () => {
        const config = createSumField(['a', 'b', 'c']);
        const context: ComputedFieldContext = {
          formData: { a: 10, b: 20, c: 30 },
        };

        const result = evaluateComputedField(config, context);
        expect(result).toBe(60);
      });
    });

    describe('createProductField', () => {
      it('should create a product field configuration', () => {
        const config = createProductField('quantity', 'price', 2);

        expect(config.expression).toBe('{{formData.quantity}} * {{formData.price}}');
        expect(config.dependencies).toEqual(['quantity', 'price']);
        expect(config.precision).toBe(2);
      });

      it('should evaluate product correctly', () => {
        const config = createProductField('quantity', 'price', 2);
        const context: ComputedFieldContext = {
          formData: { quantity: 5, price: 10.5 },
        };

        const result = evaluateComputedField(config, context);
        expect(result).toBe(52.5);
      });
    });

    describe('createPercentageField', () => {
      it('should create a percentage field configuration', () => {
        const config = createPercentageField('completed', 'total', 1);

        expect(config.dependencies).toEqual(['completed', 'total']);
        expect(config.precision).toBe(1);
      });

      it('should evaluate percentage correctly', () => {
        const config = createPercentageField('completed', 'total', 1);
        const context: ComputedFieldContext = {
          formData: { completed: 75, total: 100 },
        };

        const result = evaluateComputedField(config, context);
        expect(result).toBe('75.0%');
      });
    });

    describe('createConcatField', () => {
      it('should create a concatenation field configuration', () => {
        const config = createConcatField(['firstName', 'lastName'], ' ');

        expect(config.dependencies).toEqual(['firstName', 'lastName']);
      });

      it('should evaluate concatenation correctly', () => {
        const config = createConcatField(['firstName', 'lastName'], ' ');
        const context: ComputedFieldContext = {
          formData: { firstName: 'John', lastName: 'Doe' },
        };

        const result = evaluateComputedField(config, context);
        expect(result).toBe('John Doe');
      });

      it('should support custom separators', () => {
        const config = createConcatField(['city', 'state', 'zip'], ', ');
        const context: ComputedFieldContext = {
          formData: { city: 'Springfield', state: 'IL', zip: '62701' },
        };

        const result = evaluateComputedField(config, context);
        expect(result).toBe('Springfield, IL, 62701');
      });
    });

    describe('createConditionalField', () => {
      it('should create a conditional field configuration', () => {
        const config = createConditionalField('status', 'active', 'Yes', 'No');

        expect(config.dependencies).toEqual(['status']);
      });

      it('should evaluate conditional correctly when true', () => {
        const config = createConditionalField('status', 'active', 'Yes', 'No');
        const context: ComputedFieldContext = {
          formData: { status: 'active' },
        };

        const result = evaluateComputedField(config, context);
        expect(result).toBe('Yes');
      });

      it('should evaluate conditional correctly when false', () => {
        const config = createConditionalField('status', 'active', 'Yes', 'No');
        const context: ComputedFieldContext = {
          formData: { status: 'inactive' },
        };

        const result = evaluateComputedField(config, context);
        expect(result).toBe('No');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex invoice calculation', () => {
      const formData = {
        quantity: 10,
        unitPrice: 25.5,
        taxRate: 0.08,
        discount: 0.1,
      };

      const computedFields: Record<string, ComputedFieldConfig> = {
        subtotal: createProductField('quantity', 'unitPrice', 2),
        discountAmount: {
          expression: '{{formData.subtotal}} * {{formData.discount}}',
          dependencies: ['subtotal', 'discount'],
          precision: 2,
        },
        taxableAmount: {
          expression: '{{formData.subtotal}} - {{formData.discountAmount}}',
          dependencies: ['subtotal', 'discountAmount'],
          precision: 2,
        },
        taxAmount: {
          expression: '{{formData.taxableAmount}} * {{formData.taxRate}}',
          dependencies: ['taxableAmount', 'taxRate'],
          precision: 2,
        },
        total: {
          expression: '{{formData.taxableAmount}} + {{formData.taxAmount}}',
          dependencies: ['taxableAmount', 'taxAmount'],
          precision: 2,
        },
      };

      const updated = updateComputedFields(formData, computedFields);

      expect(updated.subtotal).toBe(255); // 10 * 25.5
      expect(updated.discountAmount).toBe(25.5); // 255 * 0.1
      expect(updated.taxableAmount).toBe(229.5); // 255 - 25.5
      expect(updated.taxAmount).toBe(18.36); // 229.5 * 0.08
      expect(updated.total).toBe(247.86); // 229.5 + 18.36
    });

    it('should handle name concatenation', () => {
      const formData = {
        title: 'Dr.',
        firstName: 'Jane',
        middleName: 'Marie',
        lastName: 'Smith',
      };

      const computedFields: Record<string, ComputedFieldConfig> = {
        fullName: createConcatField(['firstName', 'middleName', 'lastName'], ' '),
        formalName: createConcatField(['title', 'lastName'], ' '),
      };

      const updated = updateComputedFields(formData, computedFields);

      expect(updated.fullName).toBe('Jane Marie Smith');
      expect(updated.formalName).toBe('Dr. Smith');
    });

    it('should handle reactive updates in chain', () => {
      const formData = {
        hours: 40,
        rate: 25,
      };

      const computedFields: Record<string, ComputedFieldConfig> = {
        grossPay: createProductField('hours', 'rate', 2),
        tax: {
          expression: '{{formData.grossPay}} * 0.2',
          dependencies: ['grossPay'],
          precision: 2,
        },
        netPay: {
          expression: '{{formData.grossPay}} - {{formData.tax}}',
          dependencies: ['grossPay', 'tax'],
          precision: 2,
        },
      };

      // First update: calculate all fields
      let updated = updateComputedFields(formData, computedFields);
      expect(updated.grossPay).toBe(1000);
      expect(updated.tax).toBe(200);
      expect(updated.netPay).toBe(800);

      // Change hours - only grossPay should be affected initially
      updated = updateAffectedComputedFields('hours', { ...formData, hours: 50 }, computedFields);
      expect(updated.grossPay).toBe(1250);
    });
  });
});
