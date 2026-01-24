/**
 * Advanced Form Demo
 *
 * Demonstrates the integrated form state management system with:
 * - Form widget container
 * - Multiple form field widgets
 * - Validation rules
 * - Form submission handling
 * - Error display
 */

import { useState } from 'react';
import type { ActionConfig, ValidationRule } from '@/types';
import type {
  CheckboxWidgetConfig,
  DatePickerWidgetConfig,
  FormWidgetConfig,
  SelectWidgetConfig,
  TextInputWidgetConfig,
} from '@/widgets';
import { CheckboxWidget, DatePickerWidget, SelectWidget, TextInputWidget } from '@/widgets';
import { FormWidget } from '@/widgets/FormWidget';

export function AdvancedFormDemo() {
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);
  const [formError, setFormError] = useState<string>('');

  // Form configuration
  const formConfig: FormWidgetConfig = {
    id: 'user-registration-form',
    type: 'Form',
    title: 'User Registration',
    description: 'Please fill in your details to create an account',
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      birthDate: '',
      agreeToTerms: false,
    },
    validationRules: {
      firstName: {
        required: 'First name is required',
        minLength: { value: 2, message: 'First name must be at least 2 characters' },
      },
      lastName: {
        required: 'Last name is required',
        minLength: { value: 2, message: 'Last name must be at least 2 characters' },
      },
      email: {
        required: 'Email is required',
        email: 'Please enter a valid email address',
      },
      phone: {
        phone: 'Please enter a valid phone number',
      },
      country: {
        required: 'Please select a country',
      },
      birthDate: {
        required: 'Birth date is required',
        custom: value => {
          if (!value) return true;
          const birthDate = new Date(value as string);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18) {
            return 'You must be at least 18 years old';
          }
          return true;
        },
      },
      agreeToTerms: {
        custom: value => {
          if (value !== true) {
            return 'You must agree to the terms and conditions';
          }
          return true;
        },
      },
    } as Record<string, ValidationRule>,
    validationMode: 'onBlur',
    submitLabel: 'Create Account',
    resetLabel: 'Clear Form',
    submitVariant: 'primary',
    resetOnSuccess: false,
    onSubmit: {
      id: 'submit-registration',
      type: 'apiCall',
      params: {
        url: '/api/users/register',
        method: 'POST',
      },
    } as ActionConfig,
  };

  // Field configurations
  const firstNameConfig: TextInputWidgetConfig = {
    id: 'firstName',
    type: 'TextInput',
    label: 'First Name',
    placeholder: 'Enter your first name',
    required: true,
    autoFocus: true,
  };

  const lastNameConfig: TextInputWidgetConfig = {
    id: 'lastName',
    type: 'TextInput',
    label: 'Last Name',
    placeholder: 'Enter your last name',
    required: true,
  };

  const emailConfig: TextInputWidgetConfig = {
    id: 'email',
    type: 'TextInput',
    label: 'Email Address',
    placeholder: 'you@example.com',
    inputType: 'email',
    required: true,
    helpText: 'We will never share your email with third parties',
  };

  const phoneConfig: TextInputWidgetConfig = {
    id: 'phone',
    type: 'TextInput',
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    inputType: 'tel',
    helpText: 'Optional - for account recovery',
  };

  const countryConfig: SelectWidgetConfig = {
    id: 'country',
    type: 'Select',
    label: 'Country',
    placeholder: 'Select your country',
    required: true,
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia' },
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
      { value: 'jp', label: 'Japan' },
      { value: 'cn', label: 'China' },
      { value: 'in', label: 'India' },
      { value: 'br', label: 'Brazil' },
    ],
    clearable: true,
  };

  const birthDateConfig: DatePickerWidgetConfig = {
    id: 'birthDate',
    type: 'DatePicker',
    label: 'Birth Date',
    placeholder: 'Select your birth date',
    required: true,
    maxDate: new Date().toISOString(),
    format: 'PPP',
    helpText: 'You must be at least 18 years old',
  };

  const agreeToTermsConfig: CheckboxWidgetConfig = {
    id: 'agreeToTerms',
    type: 'Checkbox',
    label: 'I agree to the Terms and Conditions and Privacy Policy',
  };

  // Handle form submission
  const handleSubmit = async (values: unknown) => {
    console.log('Form submitted with values:', values);
    setFormError('');

    // Simulate API call
    try {
      // In real implementation, this would be handled by the action system
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate success
      setSubmittedData(values as Record<string, unknown>);
      alert('Registration successful!');
    } catch (error) {
      setFormError('Failed to submit form. Please try again.');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Advanced Form Demo</h1>
          <p className="text-muted-foreground">
            Demonstrates integrated form state management with validation, submission, and error
            handling
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <FormWidget
            config={formConfig}
            events={{
              onSubmit: handleSubmit,
            }}
            bindings={{
              error: formError,
            }}
          >
            {/* Name fields side by side */}
            <div className="grid grid-cols-2 gap-4">
              <TextInputWidget config={firstNameConfig} />
              <TextInputWidget config={lastNameConfig} />
            </div>

            {/* Email */}
            <TextInputWidget config={emailConfig} />

            {/* Phone */}
            <TextInputWidget config={phoneConfig} />

            {/* Country */}
            <SelectWidget config={countryConfig} />

            {/* Birth Date */}
            <DatePickerWidget config={birthDateConfig} />

            {/* Terms Agreement */}
            <CheckboxWidget config={agreeToTermsConfig} />
          </FormWidget>
        </div>

        {/* Submitted Data Display */}
        {submittedData && (
          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Submitted Data</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify(submittedData, null, 2)}</pre>
          </div>
        )}

        {/* Feature List */}
        <div className="mt-8 p-6 bg-card rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Features Demonstrated</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Comprehensive validation rules (required, minLength, email, phone, custom)</li>
            <li>✅ Cross-field validation (age validation)</li>
            <li>✅ Validation on blur mode</li>
            <li>✅ Form state management (dirty, touched, valid)</li>
            <li>✅ Error display at field level</li>
            <li>✅ Form-level error handling</li>
            <li>✅ Loading state during submission</li>
            <li>✅ Form reset functionality</li>
            <li>✅ Integration with form field widgets</li>
            <li>✅ Responsive layout with grid</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdvancedFormDemo;
