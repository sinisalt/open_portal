# Advanced Form Features Guide

## Overview

OpenPortal provides advanced form capabilities that enable sophisticated user interactions through configuration rather than custom code. This guide covers the three main advanced features:

1. **Conditional Field Visibility** - Show/hide fields based on conditions
2. **Cross-Field Validation** - Validate fields based on other field values
3. **Computed Fields** - Automatically calculate field values

## Conditional Field Visibility

### Basic Concept

Conditional visibility allows you to show or hide form fields based on:
- Other field values
- User permissions
- User roles
- Complex boolean expressions

### Configuration

```typescript
{
  type: "TextInput",
  props: { label: "Company Name" },
  visibility: {
    // Simple condition based on another field
    condition: "{{formData.employmentStatus}} === 'employed'"
  }
}
```

### Condition Types

#### 1. Simple Field Comparison

```typescript
visibility: {
  condition: "{{formData.userType}} === 'business'"
}
```

#### 2. Numeric Comparisons

```typescript
visibility: {
  condition: "{{formData.age}} >= 18"
}
```

#### 3. Complex Boolean Expressions

```typescript
visibility: {
  condition: "{{formData.age}} >= 18 && {{formData.country}} === 'US'"
}
```

#### 4. Permission-Based

```typescript
visibility: {
  permissions: ["admin.view", "users.edit"]
}
```

#### 5. Role-Based

```typescript
visibility: {
  roles: ["admin", "manager"]
}
```

#### 6. Combined Conditions

```typescript
visibility: {
  condition: "{{formData.userType}} === 'premium'",
  permissions: ["premium.access"],
  roles: ["premium_user"]
}
```

### Field Dependencies

Specify which fields trigger visibility updates:

```typescript
visibility: {
  condition: "{{formData.quantity}} > 10 && {{formData.discount}} > 0",
  dependencies: ["quantity", "discount"]  // Explicitly list dependencies
}
```

### Best Practices

1. **Keep Conditions Simple**: Complex logic should be moved to the backend
2. **Specify Dependencies**: Always include explicit dependencies for better performance
3. **Test Edge Cases**: Test with null/undefined values
4. **Use Permissions**: Prefer permission-based visibility for security-sensitive fields

## Cross-Field Validation

### Basic Concept

Cross-field validation allows you to validate a field based on the values of other fields in the form.

### Common Use Cases

#### 1. Date Range Validation

Ensure end date is after start date:

```typescript
{
  type: "DatePicker",
  props: { label: "End Date" },
  validation: {
    custom: (value, formData) => {
      if (!value || !formData.startDate) return true;
      
      const endDate = new Date(value as string);
      const startDate = new Date(formData.startDate as string);
      
      if (endDate <= startDate) {
        return "End date must be after start date";
      }
      
      return true;
    }
  }
}
```

#### 2. Password Confirmation

```typescript
{
  type: "TextInput",
  props: { label: "Confirm Password", inputType: "password" },
  validation: {
    custom: (value, formData) => {
      if (value !== formData.password) {
        return "Passwords must match";
      }
      return true;
    }
  }
}
```

#### 3. Conditional Required Fields

```typescript
{
  type: "TextInput",
  props: { label: "Company Name" },
  validation: {
    custom: (value, formData) => {
      // Required only if employed
      if (formData.employmentStatus === 'employed' && !value) {
        return "Company name is required for employed status";
      }
      return true;
    }
  }
}
```

#### 4. Numeric Range Validation

```typescript
{
  type: "TextInput",
  props: { label: "Maximum Value" },
  validation: {
    custom: (value, formData) => {
      const min = Number(formData.minValue);
      const max = Number(value);
      
      if (max <= min) {
        return "Maximum must be greater than minimum";
      }
      
      return true;
    }
  }
}
```

#### 5. Sum Validation

```typescript
{
  type: "TextInput",
  props: { label: "Total" },
  validation: {
    custom: (value, formData) => {
      const sum = Number(formData.item1) + Number(formData.item2) + Number(formData.item3);
      const total = Number(value);
      
      if (Math.abs(total - sum) > 0.01) {
        return `Total must equal sum of items (${sum})`;
      }
      
      return true;
    }
  }
}
```

### Available Helper Functions

Use the cross-field validation utilities:

```typescript
import { 
  validateAfterDate,
  validateBeforeDate,
  validateGreaterThan,
  validateLessThan,
  validateFieldMatch,
  validatePasswordConfirmation,
  validateAtLeastOne,
  validateAllOrNone,
  validateConditionalRequired,
  validateSum
} from '@/utils/crossFieldValidation';

// Example usage
validation: {
  custom: (value, formData) => {
    const result = validateAfterDate(value, 'startDate', formData);
    return result.valid ? true : result.error;
  }
}
```

## Computed Fields

### Basic Concept

Computed fields automatically calculate their value based on expressions and other field values.

### Configuration

```typescript
{
  type: "TextInput",
  props: { label: "Total", readonly: true },
  computed: {
    expression: "{{formData.quantity}} * {{formData.price}}",
    dependencies: ["quantity", "price"],
    precision: 2
  }
}
```

### Expression Types

#### 1. Simple Math

```typescript
computed: {
  expression: "{{formData.quantity}} * {{formData.price}}"
}
```

#### 2. Complex Calculations

```typescript
computed: {
  expression: "({{formData.subtotal}} * {{formData.taxRate}}) + {{formData.shipping}}",
  precision: 2
}
```

#### 3. String Concatenation

```typescript
computed: {
  expression: '{{formData.firstName}} + " " + {{formData.lastName}}'
}
```

#### 4. Conditional Expressions

```typescript
computed: {
  expression: '{{formData.isPremium}} === true ? 0 : {{formData.baseFee}}',
  precision: 2
}
```

#### 5. Function Expressions

For complex logic, use a function:

```typescript
computed: {
  expression: (formData) => {
    const quantity = Number(formData.quantity) || 0;
    const price = Number(formData.price) || 0;
    const discount = Number(formData.discount) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = subtotal * discount;
    return subtotal - discountAmount;
  },
  dependencies: ["quantity", "price", "discount"],
  precision: 2
}
```

### Helper Functions

Use built-in helper functions for common calculations:

```typescript
import {
  createSumField,
  createProductField,
  createPercentageField,
  createConcatField,
  createConditionalField
} from '@/utils/computedFields';

// Sum multiple fields
const totalConfig = createSumField(['item1', 'item2', 'item3'], 2);

// Product of two fields
const subtotalConfig = createProductField('quantity', 'price', 2);

// Percentage calculation
const progressConfig = createPercentageField('completed', 'total', 1);

// String concatenation
const fullNameConfig = createConcatField(['firstName', 'lastName'], ' ');

// Conditional value
const feeConfig = createConditionalField('memberType', 'premium', 0, 10);
```

### Formatting

Apply custom formatting to computed values:

```typescript
computed: {
  expression: "{{formData.amount}} * 100",
  format: (value) => `$${Number(value).toFixed(2)}`
}
```

### Reactive Updates

By default, computed fields update automatically when dependencies change. To disable:

```typescript
computed: {
  expression: "{{formData.a}} + {{formData.b}}",
  reactive: false  // Won't update on dependency changes
}
```

## Real-World Examples

### Example 1: Invoice Form

```typescript
const invoiceForm = {
  fields: [
    // Input fields
    { id: "quantity", type: "TextInput", props: { label: "Quantity" } },
    { id: "unitPrice", type: "TextInput", props: { label: "Unit Price" } },
    { id: "discount", type: "TextInput", props: { label: "Discount %" } },
    { id: "taxRate", type: "TextInput", props: { label: "Tax Rate" } },
    
    // Computed fields
    {
      id: "subtotal",
      type: "TextInput",
      props: { label: "Subtotal", readonly: true },
      computed: createProductField("quantity", "unitPrice", 2)
    },
    {
      id: "discountAmount",
      type: "TextInput",
      props: { label: "Discount Amount", readonly: true },
      computed: {
        expression: "{{formData.subtotal}} * ({{formData.discount}} / 100)",
        dependencies: ["subtotal", "discount"],
        precision: 2
      }
    },
    {
      id: "taxableAmount",
      type: "TextInput",
      props: { label: "Taxable Amount", readonly: true },
      computed: {
        expression: "{{formData.subtotal}} - {{formData.discountAmount}}",
        dependencies: ["subtotal", "discountAmount"],
        precision: 2
      }
    },
    {
      id: "taxAmount",
      type: "TextInput",
      props: { label: "Tax", readonly: true },
      computed: {
        expression: "{{formData.taxableAmount}} * {{formData.taxRate}}",
        dependencies: ["taxableAmount", "taxRate"],
        precision: 2
      }
    },
    {
      id: "total",
      type: "TextInput",
      props: { label: "Total", readonly: true },
      computed: {
        expression: "{{formData.taxableAmount}} + {{formData.taxAmount}}",
        dependencies: ["taxableAmount", "taxAmount"],
        precision: 2,
        format: (value) => `$${Number(value).toFixed(2)}`
      }
    }
  ]
};
```

### Example 2: Employee Registration Form

```typescript
const employeeForm = {
  fields: [
    {
      id: "employmentStatus",
      type: "Select",
      props: { label: "Employment Status" },
      options: [
        { value: "employed", label: "Employed" },
        { value: "unemployed", label: "Unemployed" },
        { value: "self-employed", label: "Self-Employed" }
      ]
    },
    
    // Conditionally visible
    {
      id: "companyName",
      type: "TextInput",
      props: { label: "Company Name" },
      visibility: {
        condition: "{{formData.employmentStatus}} === 'employed'",
        dependencies: ["employmentStatus"]
      },
      validation: {
        custom: (value, formData) => {
          if (formData.employmentStatus === 'employed' && !value) {
            return "Company name is required for employed status";
          }
          return true;
        }
      }
    },
    
    {
      id: "startDate",
      type: "DatePicker",
      props: { label: "Employment Start Date" },
      visibility: {
        condition: "{{formData.employmentStatus}} === 'employed'",
        dependencies: ["employmentStatus"]
      }
    },
    
    // Cross-field validation
    {
      id: "endDate",
      type: "DatePicker",
      props: { label: "Employment End Date" },
      visibility: {
        condition: "{{formData.employmentStatus}} === 'employed'",
        dependencies: ["employmentStatus"]
      },
      validation: {
        custom: (value, formData) => {
          if (!value || !formData.startDate) return true;
          
          const end = new Date(value as string);
          const start = new Date(formData.startDate as string);
          
          if (end <= start) {
            return "End date must be after start date";
          }
          
          return true;
        }
      }
    }
  ]
};
```

## Performance Considerations

### 1. Dependency Specification

Always specify dependencies explicitly for better performance:

```typescript
// Good
computed: {
  expression: "{{formData.a}} + {{formData.b}}",
  dependencies: ["a", "b"]  // Explicit
}

// Avoid
computed: {
  expression: "{{formData.a}} + {{formData.b}}"
  // No dependencies - will be extracted but less efficient
}
```

### 2. Reactive Updates

Disable reactive updates for non-critical computed fields:

```typescript
computed: {
  expression: "{{formData.a}} + {{formData.b}}",
  reactive: false  // Calculate only on form load
}
```

### 3. Complex Calculations

Use function expressions for complex calculations to avoid re-parsing:

```typescript
// Better performance for complex logic
computed: {
  expression: (formData) => {
    // Complex calculation logic
    return result;
  },
  dependencies: ["field1", "field2"]
}
```

### 4. Validation Optimization

Cache validation results when possible:

```typescript
const validationCache = new Map();

validation: {
  custom: (value, formData) => {
    const cacheKey = `${value}-${formData.otherField}`;
    
    if (validationCache.has(cacheKey)) {
      return validationCache.get(cacheKey);
    }
    
    const result = performExpensiveValidation(value, formData);
    validationCache.set(cacheKey, result);
    
    return result;
  }
}
```

## Security Considerations

### 1. Expression Sanitization

All expressions are automatically sanitized to prevent code injection. Dangerous keywords are blocked:
- `eval`, `Function`, `constructor`
- `window`, `document`, `process`
- `import`, `require`

### 2. Permission Enforcement

Always enforce permissions server-side:

```typescript
// Client-side visibility (UX only)
visibility: {
  permissions: ["admin.view"]
}

// Must be enforced on backend
POST /api/endpoint
Authorization: Bearer <token>
// Backend validates token has admin.view permission
```

### 3. Validation

All validation must be replicated on the backend:

```typescript
// Frontend validation (UX only)
validation: {
  custom: (value, formData) => {
    return value > formData.minValue;
  }
}

// Backend must also validate
// Never trust client-side validation alone
```

## Testing

### Unit Testing Computed Fields

```typescript
import { evaluateComputedField } from '@/utils/computedFields';

test('should calculate total correctly', () => {
  const config = {
    expression: '{{formData.quantity}} * {{formData.price}}',
    precision: 2
  };
  
  const context = {
    formData: { quantity: 5, price: 10.5 }
  };
  
  const result = evaluateComputedField(config, context);
  expect(result).toBe(52.50);
});
```

### Integration Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FormWidget } from '@/widgets/FormWidget';

test('should show/hide fields based on condition', () => {
  const config = {
    // Form config with conditional fields
  };
  
  render(<FormWidget config={config} />);
  
  // Initially hidden
  expect(screen.queryByLabelText('Company Name')).not.toBeInTheDocument();
  
  // Select employed status
  fireEvent.change(screen.getByLabelText('Employment Status'), {
    target: { value: 'employed' }
  });
  
  // Now visible
  expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

#### 1. Computed field not updating

**Problem**: Computed field doesn't update when dependency changes

**Solution**: Check dependencies are specified correctly
```typescript
computed: {
  expression: "{{formData.a}} + {{formData.b}}",
  dependencies: ["a", "b"]  // Make sure these match field IDs
}
```

#### 2. Conditional visibility not working

**Problem**: Field always visible or never visible

**Solution**: Check expression syntax and formData path
```typescript
// Wrong
condition: "{{status}} === 'active'"

// Correct
condition: "{{formData.status}} === 'active'"
```

#### 3. Cross-field validation fires too early

**Problem**: Validation error shows before user fills related field

**Solution**: Check for null/undefined values first
```typescript
validation: {
  custom: (value, formData) => {
    // Skip validation if either field is empty
    if (!value || !formData.otherField) return true;
    
    // Now perform validation
    return value > formData.otherField;
  }
}
```

## Additional Resources

- [Form Widget Documentation](/documentation/widget-catalog.md#form-widgets)
- [Validation Utilities API](/src/utils/validation.ts)
- [Conditional Visibility API](/src/utils/conditionalVisibility.ts)
- [Cross-Field Validation API](/src/utils/crossFieldValidation.ts)
- [Computed Fields API](/src/utils/computedFields.ts)
- [Advanced Form Demo](/src/demos/AdvancedFormFeaturesDemo.tsx)
