/**
 * Tests for Conditional Visibility System
 */

import {
  evaluateExpression,
  evaluateVisibility,
  extractFieldDependencies,
  getVisibilityDependencies,
  resolveTemplateVariables,
  type VisibilityCondition,
  type VisibilityContext,
} from './conditionalVisibility';

describe('Conditional Visibility System', () => {
  describe('evaluateVisibility', () => {
    it('should return true when no condition is provided', () => {
      expect(evaluateVisibility(undefined)).toBe(true);
      expect(evaluateVisibility(null)).toBe(true);
    });

    it('should handle direct boolean values', () => {
      expect(evaluateVisibility(true)).toBe(true);
      expect(evaluateVisibility(false)).toBe(false);
    });

    it('should evaluate simple template expressions', () => {
      const context: VisibilityContext = {
        formData: { status: 'active' },
      };

      expect(evaluateVisibility('{{formData.status}} === "active"', context)).toBe(true);
      expect(evaluateVisibility('{{formData.status}} === "inactive"', context)).toBe(false);
    });

    it('should evaluate numeric comparisons', () => {
      const context: VisibilityContext = {
        formData: { age: 25 },
      };

      expect(evaluateVisibility('{{formData.age}} >= 18', context)).toBe(true);
      expect(evaluateVisibility('{{formData.age}} < 18', context)).toBe(false);
      expect(evaluateVisibility('{{formData.age}} === 25', context)).toBe(true);
    });

    it('should evaluate complex boolean expressions', () => {
      const context: VisibilityContext = {
        formData: { age: 25, country: 'US' },
      };

      expect(
        evaluateVisibility('{{formData.age}} >= 18 && {{formData.country}} === "US"', context)
      ).toBe(true);

      expect(
        evaluateVisibility('{{formData.age}} >= 18 || {{formData.country}} === "UK"', context)
      ).toBe(true);

      expect(
        evaluateVisibility('{{formData.age}} < 18 && {{formData.country}} === "US"', context)
      ).toBe(false);
    });

    it('should handle permission-based visibility', () => {
      const context: VisibilityContext = {
        permissions: ['admin.view', 'users.edit'],
      };

      const condition: VisibilityCondition = {
        permissions: ['admin.view'],
      };

      expect(evaluateVisibility(condition, context)).toBe(true);

      const restrictedCondition: VisibilityCondition = {
        permissions: ['super.admin'],
      };

      expect(evaluateVisibility(restrictedCondition, context)).toBe(false);
    });

    it('should handle role-based visibility', () => {
      const context: VisibilityContext = {
        roles: ['admin', 'user'],
      };

      const condition: VisibilityCondition = {
        roles: ['admin'],
      };

      expect(evaluateVisibility(condition, context)).toBe(true);

      const restrictedCondition: VisibilityCondition = {
        roles: ['super-admin'],
      };

      expect(evaluateVisibility(restrictedCondition, context)).toBe(false);
    });

    it('should combine permission and expression conditions', () => {
      const context: VisibilityContext = {
        formData: { status: 'active' },
        permissions: ['admin.view'],
      };

      const condition: VisibilityCondition = {
        condition: '{{formData.status}} === "active"',
        permissions: ['admin.view'],
      };

      expect(evaluateVisibility(condition, context)).toBe(true);

      const failedCondition: VisibilityCondition = {
        condition: '{{formData.status}} === "active"',
        permissions: ['super.admin'],
      };

      expect(evaluateVisibility(failedCondition, context)).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const context: VisibilityContext = {
        formData: { value: null, missing: undefined },
      };

      expect(evaluateVisibility('{{formData.value}} === null', context)).toBe(true);
      expect(evaluateVisibility('{{formData.missing}} === null', context)).toBe(true);
      expect(evaluateVisibility('{{formData.nonExistent}} === null', context)).toBe(true);
    });

    it('should handle array values', () => {
      const context: VisibilityContext = {
        formData: { items: [1, 2, 3] },
      };

      expect(evaluateVisibility('{{formData.items}}.length > 0', context)).toBe(true);
      expect(evaluateVisibility('{{formData.items}}.length === 3', context)).toBe(true);
    });

    it('should handle nested object paths', () => {
      const context: VisibilityContext = {
        formData: {
          user: {
            profile: {
              age: 25,
            },
          },
        },
      };

      expect(evaluateVisibility('{{formData.user.profile.age}} >= 18', context)).toBe(true);
    });
  });

  describe('evaluateExpression', () => {
    it('should evaluate boolean string literals', () => {
      expect(evaluateExpression('true', {})).toBe(true);
      expect(evaluateExpression('false', {})).toBe(false);
    });

    it('should handle empty or invalid expressions', () => {
      expect(evaluateExpression('', {})).toBe(false);
      expect(evaluateExpression(null as unknown as string, {})).toBe(false);
    });

    it('should reject unsafe expressions', () => {
      const context: VisibilityContext = {};

      // Should not throw, but should return false for unsafe expressions
      expect(() => evaluateExpression('eval("alert(1)")', context)).not.toThrow();
      expect(evaluateExpression('eval("alert(1)")', context)).toBe(false);
    });
  });

  describe('resolveTemplateVariables', () => {
    it('should resolve string values with quotes', () => {
      const context: VisibilityContext = {
        formData: { name: 'John' },
      };

      const result = resolveTemplateVariables('{{formData.name}} === "John"', context);
      expect(result).toBe('"John" === "John"');
    });

    it('should resolve numeric values', () => {
      const context: VisibilityContext = {
        formData: { age: 25 },
      };

      const result = resolveTemplateVariables('{{formData.age}} >= 18', context);
      expect(result).toBe('25 >= 18');
    });

    it('should resolve boolean values', () => {
      const context: VisibilityContext = {
        formData: { isActive: true },
      };

      const result = resolveTemplateVariables('{{formData.isActive}} === true', context);
      expect(result).toBe('true === true');
    });

    it('should resolve null values', () => {
      const context: VisibilityContext = {
        formData: { value: null },
      };

      const result = resolveTemplateVariables('{{formData.value}} === null', context);
      expect(result).toBe('null === null');
    });

    it('should escape quotes in string values', () => {
      const context: VisibilityContext = {
        formData: { message: 'Say "hello"' },
      };

      const result = resolveTemplateVariables('{{formData.message}}', context);
      expect(result).toBe('"Say \\"hello\\""');
    });

    it('should handle multiple template variables', () => {
      const context: VisibilityContext = {
        formData: { firstName: 'John', lastName: 'Doe' },
      };

      const result = resolveTemplateVariables(
        '{{formData.firstName}} === "John" && {{formData.lastName}} === "Doe"',
        context
      );
      expect(result).toBe('"John" === "John" && "Doe" === "Doe"');
    });
  });

  describe('extractFieldDependencies', () => {
    it('should extract field names from simple expressions', () => {
      const deps = extractFieldDependencies('{{formData.status}} === "active"');
      expect(deps).toEqual(['status']);
    });

    it('should extract multiple field names', () => {
      const deps = extractFieldDependencies(
        '{{formData.age}} >= 18 && {{formData.country}} === "US"'
      );
      expect(deps).toEqual(['age', 'country']);
    });

    it('should extract unique field names', () => {
      const deps = extractFieldDependencies(
        '{{formData.status}} === "active" || {{formData.status}} === "pending"'
      );
      expect(deps).toEqual(['status']);
    });

    it('should handle nested paths correctly', () => {
      const deps = extractFieldDependencies('{{formData.user.profile.age}} >= 18');
      expect(deps).toEqual(['user']);
    });

    it('should return empty array for expressions without formData', () => {
      const deps = extractFieldDependencies('{{pageState.isActive}} === true');
      expect(deps).toEqual([]);
    });
  });

  describe('getVisibilityDependencies', () => {
    it('should return empty array for boolean conditions', () => {
      expect(getVisibilityDependencies(true)).toEqual([]);
      expect(getVisibilityDependencies(false)).toEqual([]);
    });

    it('should extract dependencies from string expressions', () => {
      const deps = getVisibilityDependencies('{{formData.status}} === "active"');
      expect(deps).toEqual(['status']);
    });

    it('should use explicit dependencies if provided', () => {
      const condition: VisibilityCondition = {
        condition: '{{formData.age}} >= 18',
        dependencies: ['age', 'country'],
      };

      expect(getVisibilityDependencies(condition)).toEqual(['age', 'country']);
    });

    it('should extract dependencies from condition expression', () => {
      const condition: VisibilityCondition = {
        condition: '{{formData.age}} >= 18 && {{formData.status}} === "active"',
      };

      expect(getVisibilityDependencies(condition)).toEqual(['age', 'status']);
    });
  });

  describe('Integration Tests', () => {
    it('should handle real-world employment status scenario', () => {
      const context: VisibilityContext = {
        formData: {
          employmentStatus: 'employed',
          companyName: 'Acme Corp',
        },
      };

      // Company name field should be visible when employed
      expect(evaluateVisibility('{{formData.employmentStatus}} === "employed"', context)).toBe(
        true
      );

      // Update context to unemployed
      context.formData.employmentStatus = 'unemployed';
      expect(evaluateVisibility('{{formData.employmentStatus}} === "employed"', context)).toBe(
        false
      );
    });

    it('should handle date range validation scenario', () => {
      const context: VisibilityContext = {
        formData: {
          hasEndDate: true,
          startDate: '2024-01-01',
        },
      };

      // End date field should be visible when hasEndDate is true
      expect(evaluateVisibility('{{formData.hasEndDate}} === true', context)).toBe(true);

      context.formData.hasEndDate = false;
      expect(evaluateVisibility('{{formData.hasEndDate}} === true', context)).toBe(false);
    });

    it('should handle complex multi-condition scenario', () => {
      const context: VisibilityContext = {
        formData: {
          userType: 'business',
          annualRevenue: 1000000,
          country: 'US',
        },
        permissions: ['business.advanced'],
      };

      const condition: VisibilityCondition = {
        condition: '{{formData.userType}} === "business" && {{formData.annualRevenue}} >= 500000',
        permissions: ['business.advanced'],
      };

      expect(evaluateVisibility(condition, context)).toBe(true);

      // Remove permission
      context.permissions = [];
      expect(evaluateVisibility(condition, context)).toBe(false);

      // Restore permission but change data
      context.permissions = ['business.advanced'];
      context.formData.annualRevenue = 100000;
      expect(evaluateVisibility(condition, context)).toBe(false);
    });
  });
});
