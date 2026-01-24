# Form State Management Guide

## Overview

OpenPortal provides a comprehensive form state management system that handles validation, submission, error display, and integration with the action system. The form system is built on three core components:

1. **Validation Utilities** - Client-side validation rules
2. **useForm Hook** - Form state management
3. **FormWidget** - UI component with action integration

## Table of Contents

- [Quick Start](#quick-start)
- [Form State Structure](#form-state-structure)
- [Validation Rules](#validation-rules)
- [Using the useForm Hook](#using-the-useform-hook)
- [Using the FormWidget](#using-the-formwidget)
- [Validation Modes](#validation-modes)
- [Error Handling](#error-handling)
- [Form Submission](#form-submission)
- [Advanced Patterns](#advanced-patterns)

## Quick Start

### Basic Form with Validation

```typescript
import { FormWidget, TextInputWidget } from '@/widgets';
import type { FormWidgetConfig, TextInputWidgetConfig } from '@/widgets';

const formConfig: FormWidgetConfig = {
  id: 'login-form',
  type: 'Form',
  initialValues: {
    email: '',
    password: '',
  },
  validationRules: {
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email',
    },
    password: {
      required: 'Password is required',
      minLength: { value: 8, message: 'Password must be at least 8 characters' },
    },
  },
  onSubmit: {
    id: 'login-submit',
    type: 'apiCall',
    params: {
      url: '/api/auth/login',
      method: 'POST',
    },
  },
};

function LoginForm() {
  const handleSubmit = async (values) => {
    console.log('Form submitted:', values);
  };

  return (
    <FormWidget config={formConfig} events={{ onSubmit: handleSubmit }}>
      <TextInputWidget config={{ id: 'email', type: 'TextInput', label: 'Email' }} />
      <TextInputWidget
        config={{ id: 'password', type: 'TextInput', label: 'Password', inputType: 'password' }}
      />
    </FormWidget>
  );
}
```

## Form State Structure

The form state contains all information about the form:

```typescript
interface FormState {
  // Current field values
  values: Record<string, unknown>;

  // Field-level error messages
  errors: Record<string, string>;

  // Fields that have been touched (blurred)
  touched: Record<string, boolean>;

  // Form is currently submitting
  isSubmitting: boolean;

  // Form has been modified from initial values
  isDirty: boolean;

  // All validation rules pass
  isValid: boolean;

  // Number of submission attempts
  submitCount: number;

  // Initial form values (for reset)
  initialValues: Record<string, unknown>;
}
```

## Validation Rules

### Built-in Validation Rules

#### Required Field

```typescript
{
  required: true; // Default message
  // OR
  required: 'Custom error message';
}
```

#### String Length

```typescript
{
  minLength: {
    value: 5,
    message: 'Must be at least 5 characters'
  },
  maxLength: {
    value: 100,
    message: 'Must be no more than 100 characters'
  }
}
```

#### Number Range

```typescript
{
  min: {
    value: 0,
    message: 'Must be at least 0'
  },
  max: {
    value: 100,
    message: 'Must be no more than 100'
  }
}
```

#### Pattern Matching

```typescript
{
  pattern: {
    value: /^[A-Z0-9]+$/,
    message: 'Only uppercase letters and numbers allowed'
  }
}
```

#### Email Validation

```typescript
{
  email: true; // Default message
  // OR
  email: 'Please enter a valid email address';
}
```

#### URL Validation

```typescript
{
  url: true; // Default message
  // OR
  url: 'Please enter a valid URL';
}
```

#### Phone Number Validation

```typescript
{
  phone: true; // Default message
  // OR
  phone: 'Please enter a valid phone number';
}
```

### Custom Validation

#### Synchronous Custom Validation

```typescript
{
  custom: (value, allValues) => {
    if (value !== allValues.password) {
      return 'Passwords must match';
    }
    return true; // Validation passed
  };
}
```

#### Asynchronous Custom Validation

```typescript
{
  asyncValidation: async (value) => {
    const response = await fetch(`/api/check-username?username=${value}`);
    const data = await response.json();

    if (!data.available) {
      return 'Username is already taken';
    }
    return true; // Validation passed
  };
}
```

### Cross-Field Validation

```typescript
const validationRules = {
  age: {
    custom: (value, allValues) => {
      const age = Number(value);
      const country = allValues.country;

      if (country === 'us' && age < 21) {
        return 'Must be at least 21 in the US';
      }
      if (age < 18) {
        return 'Must be at least 18';
      }
      return true;
    },
  },
};
```

## Using the useForm Hook

The `useForm` hook provides programmatic access to form state and methods.

### Basic Usage

```typescript
import { useForm } from '@/hooks/useForm';

function MyForm() {
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
    },
    validationRules: {
      name: { required: true },
      email: { required: true, email: true },
    },
    validationMode: 'onBlur',
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    console.log('Submitted:', values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.state.values.name}
        onChange={(e) => form.setValue('name', e.target.value)}
        onBlur={() => form.setTouched('name')}
      />
      {form.state.errors.name && <span>{form.state.errors.name}</span>}

      <button type="submit" disabled={form.state.isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

### Form Methods

```typescript
// Field Management
form.registerField(name, rules); // Register field with validation
form.unregisterField(name); // Unregister field

// Value Management
form.setValue(name, value); // Set single field value
form.setValues({ name: 'John', email: 'john@example.com' }); // Set multiple values
form.getValue(name); // Get field value

// Error Management
form.setError(name, error); // Set field error
form.clearError(name); // Clear field error
form.setErrors({ name: 'Error 1', email: 'Error 2' }); // Set multiple errors
form.clearErrors(); // Clear all errors
form.getError(name); // Get field error
form.hasError(name); // Check if field has error

// Touch Management
form.setTouched(name, true); // Mark field as touched
form.isTouched(name); // Check if field is touched

// Validation
form.validateField(name); // Validate single field
form.validateForm(); // Validate all fields

// Form Actions
form.handleSubmit(onSubmit); // Create submit handler
form.resetForm(); // Reset to initial values
form.isDirty(); // Check if form is modified
form.isValid(); // Check if form is valid
```

## Using the FormWidget

The FormWidget is a container component that provides built-in form management.

### Configuration Options

```typescript
interface FormWidgetConfig {
  id: string; // Unique form identifier
  type: 'Form';
  title?: string; // Form title
  description?: string; // Form description

  // Initial Values
  initialValues?: Record<string, unknown>;

  // Validation
  validationRules?: ValidationRules;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all';
  validateOnMount?: boolean;

  // Buttons
  submitLabel?: string; // Default: 'Submit'
  resetLabel?: string; // No reset button if not provided
  submitVariant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';

  // Actions
  onSubmit: ActionConfig; // Submit action
  onSuccess?: ActionConfig; // Success handler
  onError?: ActionConfig; // Error handler

  // Behavior
  resetOnSuccess?: boolean; // Reset after successful submission
  showLoading?: boolean; // Show loading spinner (default: true)
  disableOnSubmit?: boolean; // Disable form during submission (default: true)

  // Layout
  layout?: 'vertical' | 'horizontal';
  spacing?: 'compact' | 'normal' | 'relaxed';

  // Debug
  debug?: boolean; // Show debug info
}
```

### Example with All Options

```typescript
const formConfig: FormWidgetConfig = {
  id: 'user-profile-form',
  type: 'Form',
  title: 'Edit Profile',
  description: 'Update your profile information',

  initialValues: {
    name: 'John Doe',
    email: 'john@example.com',
  },

  validationRules: {
    name: {
      required: 'Name is required',
      minLength: { value: 2, message: 'Name must be at least 2 characters' },
    },
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email',
    },
  },

  validationMode: 'onBlur',
  validateOnMount: false,

  submitLabel: 'Save Changes',
  resetLabel: 'Cancel',
  submitVariant: 'primary',

  onSubmit: {
    id: 'save-profile',
    type: 'apiCall',
    params: {
      url: '/api/users/profile',
      method: 'PUT',
    },
  },

  onSuccess: {
    id: 'show-success-toast',
    type: 'showToast',
    params: {
      message: 'Profile updated successfully!',
      variant: 'success',
    },
  },

  onError: {
    id: 'show-error-toast',
    type: 'showToast',
    params: {
      message: 'Failed to update profile',
      variant: 'error',
    },
  },

  resetOnSuccess: false,
  showLoading: true,
  disableOnSubmit: true,
  layout: 'vertical',
  spacing: 'normal',
  debug: false,
};
```

## Validation Modes

### onSubmit (Default)

Validation runs only when the form is submitted.

```typescript
validationMode: 'onSubmit';
```

**Use when:** You want to minimize validation noise and only validate when user attempts to submit.

### onBlur

Validation runs when a field loses focus (after user has touched the field).

```typescript
validationMode: 'onBlur';
```

**Use when:** You want to provide immediate feedback after user finishes editing a field.

### onChange

Validation runs every time a field value changes.

```typescript
validationMode: 'onChange';
```

**Use when:** You need real-time validation feedback (e.g., password strength indicators).

### all

Validation runs on both change and blur events.

```typescript
validationMode: 'all';
```

**Use when:** You need the most comprehensive validation feedback.

## Error Handling

### Field-Level Errors

Errors are displayed below each field automatically when using form widgets:

```typescript
<TextInputWidget
  config={{
    id: 'email',
    type: 'TextInput',
    label: 'Email',
    required: true,
  }}
  bindings={{
    value: form.state.values.email,
    error: form.state.errors.email,
  }}
/>
```

### Form-Level Errors

Display errors that apply to the entire form:

```typescript
<FormWidget
  config={formConfig}
  bindings={{
    error: 'Failed to submit form. Please try again.',
  }}
/>
```

### Server-Side Validation Errors

Map server errors to form fields:

```typescript
const handleSubmit = async (values) => {
  try {
    await submitToServer(values);
  } catch (error) {
    if (error.fieldErrors) {
      form.setErrors(error.fieldErrors);
    } else {
      form.setError('_form', error.message);
    }
  }
};
```

## Form Submission

### Basic Submission

```typescript
const handleSubmit = async (values) => {
  console.log('Form values:', values);
  // Perform submission logic
};

<FormWidget config={formConfig} events={{ onSubmit: handleSubmit }} />;
```

### With Loading State

```typescript
const handleSubmit = async (values) => {
  setIsLoading(true);
  try {
    await api.post('/users', values);
  } finally {
    setIsLoading(false);
  }
};
```

### With Success/Error Handling

```typescript
const handleSubmit = async (values) => {
  try {
    const result = await api.post('/users', values);
    showToast({ message: 'Success!', variant: 'success' });
    return result;
  } catch (error) {
    showToast({ message: error.message, variant: 'error' });
    throw error;
  }
};
```

## Advanced Patterns

### Dynamic Field Validation

```typescript
const [minAge, setMinAge] = useState(18);

const validationRules = useMemo(
  () => ({
    age: {
      min: {
        value: minAge,
        message: `Must be at least ${minAge} years old`,
      },
    },
  }),
  [minAge]
);
```

### Conditional Fields

```typescript
const showPhoneField = form.state.values.contactMethod === 'phone';

{
  showPhoneField && (
    <TextInputWidget
      config={{
        id: 'phone',
        type: 'TextInput',
        label: 'Phone Number',
      }}
    />
  );
}
```

### Multi-Step Forms

```typescript
const [step, setStep] = useState(1);

const handleNext = async () => {
  const isValid = await form.validateForm();
  if (isValid) {
    setStep(step + 1);
  }
};
```

### Debounced Async Validation

```typescript
const checkUsernameAvailability = useDebounceFn(async (username) => {
  const response = await fetch(`/api/check-username?username=${username}`);
  return response.json();
}, 500);

const validationRules = {
  username: {
    asyncValidation: async (value) => {
      const data = await checkUsernameAvailability(value);
      return data.available ? true : 'Username is already taken';
    },
  },
};
```

## Best Practices

1. **Use appropriate validation mode:**
   - `onSubmit` for simple forms
   - `onBlur` for longer forms
   - `onChange` only when necessary (e.g., password strength)

2. **Provide clear error messages:**
   - Be specific about what's wrong
   - Suggest how to fix the issue

3. **Group related fields:**
   - Use sections or fieldsets
   - Apply consistent spacing

4. **Handle loading states:**
   - Disable form during submission
   - Show loading indicators
   - Prevent double submissions

5. **Test edge cases:**
   - Empty values
   - Invalid formats
   - Server errors
   - Network failures

6. **Use TypeScript:**
   - Define form value types
   - Type validation rules
   - Catch errors at compile time

## Testing Forms

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react';
import { useForm } from '@/hooks/useForm';

test('validates required field', async () => {
  const { result } = renderHook(() =>
    useForm({
      validationRules: {
        name: { required: true },
      },
    })
  );

  await act(async () => {
    result.current.setValue('name', '');
    await result.current.validateField('name');
  });

  expect(result.current.state.errors.name).toBeTruthy();
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('submits form with valid data', async () => {
  const onSubmit = jest.fn();

  render(<MyForm onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

  expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
});
```

## Troubleshooting

### Form not validating

- Check that validation rules are properly defined
- Ensure validation mode is set correctly
- Verify field names match between config and widgets

### Values not updating

- Confirm fields are registered with the form
- Check that setValue is being called correctly
- Verify bindings are passed to widgets

### Submit handler not called

- Ensure form validation passes
- Check that onSubmit event is wired correctly
- Look for JavaScript errors in console

## Related Documentation

- [Widget Catalog](./widget-catalog.md) - All available form widgets
- [Action System](./action-specification.md) - Action configuration
- [API Reference](./api-specification.md) - Backend integration
