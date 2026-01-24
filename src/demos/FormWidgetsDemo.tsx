/**
 * Form Widgets Demo
 * 
 * This file demonstrates the usage of all form widgets in a simple form.
 * Can be used for manual testing and as a reference for developers.
 */

import { useState } from 'react';
import { CheckboxWidget, DatePickerWidget, SelectWidget, TextInputWidget } from '@/widgets';
import type {
  CheckboxWidgetConfig,
  DatePickerWidgetConfig,
  SelectWidgetConfig,
  TextInputWidgetConfig,
} from '@/widgets';

export function FormWidgetsDemo() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    birthDate: '',
    newsletter: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Widget configurations
  const nameConfig: TextInputWidgetConfig = {
    id: 'name',
    type: 'TextInput',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    helpText: 'First and last name',
    required: true,
  };

  const emailConfig: TextInputWidgetConfig = {
    id: 'email',
    type: 'TextInput',
    label: 'Email Address',
    placeholder: 'you@example.com',
    helpText: 'We will never share your email',
    inputType: 'email',
    required: true,
  };

  const countryConfig: SelectWidgetConfig = {
    id: 'country',
    type: 'Select',
    label: 'Country',
    placeholder: 'Select your country',
    helpText: 'Choose the country you currently reside in',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia' },
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
    ],
    required: true,
    clearable: true,
  };

  const birthDateConfig: DatePickerWidgetConfig = {
    id: 'birthDate',
    type: 'DatePicker',
    label: 'Birth Date',
    placeholder: 'Select your birth date',
    helpText: 'You must be at least 18 years old',
    format: 'PPP', // Jan 1, 2024
    maxDate: new Date().toISOString(),
    required: true,
  };

  const newsletterConfig: CheckboxWidgetConfig = {
    id: 'newsletter',
    type: 'Checkbox',
    label: 'Subscribe to newsletter',
    helpText: 'Receive updates about new features and announcements',
  };

  // Event handlers
  const handleNameChange = (value: unknown) => {
    setFormData((prev) => ({ ...prev, name: value as string }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleEmailChange = (value: unknown) => {
    setFormData((prev) => ({ ...prev, email: value as string }));
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handleCountryChange = (value: unknown) => {
    setFormData((prev) => ({ ...prev, country: value as string }));
    if (errors.country) {
      setErrors((prev) => ({ ...prev, country: '' }));
    }
  };

  const handleBirthDateChange = (value: unknown) => {
    setFormData((prev) => ({ ...prev, birthDate: value as string }));
    if (errors.birthDate) {
      setErrors((prev) => ({ ...prev, birthDate: '' }));
    }
  };

  const handleNewsletterChange = (value: unknown) => {
    setFormData((prev) => ({ ...prev, newsletter: value as boolean }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      // Check age (must be 18+)
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.birthDate = 'You must be at least 18 years old';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Form is valid
    alert(
      `Form submitted successfully!\n\nName: ${formData.name}\nEmail: ${formData.email}\nCountry: ${formData.country}\nBirth Date: ${formData.birthDate}\nNewsletter: ${formData.newsletter}`
    );
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      country: '',
      birthDate: '',
      newsletter: false,
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Form Widgets Demo</h1>
          <p className="text-muted-foreground">
            Demonstration of all 4 form widgets: TextInput, Select, DatePicker, and Checkbox
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TextInput Widget - Name */}
          <TextInputWidget
            config={nameConfig}
            bindings={{
              value: formData.name,
              error: errors.name,
            }}
            events={{
              onChange: handleNameChange,
            }}
          />

          {/* TextInput Widget - Email */}
          <TextInputWidget
            config={emailConfig}
            bindings={{
              value: formData.email,
              error: errors.email,
            }}
            events={{
              onChange: handleEmailChange,
            }}
          />

          {/* Select Widget */}
          <SelectWidget
            config={countryConfig}
            bindings={{
              value: formData.country,
              error: errors.country,
            }}
            events={{
              onChange: handleCountryChange,
            }}
          />

          {/* DatePicker Widget */}
          <DatePickerWidget
            config={birthDateConfig}
            bindings={{
              value: formData.birthDate,
              error: errors.birthDate,
            }}
            events={{
              onChange: handleBirthDateChange,
            }}
          />

          {/* Checkbox Widget */}
          <CheckboxWidget
            config={newsletterConfig}
            bindings={{
              value: formData.newsletter,
            }}
            events={{
              onChange: handleNewsletterChange,
            }}
          />

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Current State Display */}
        <div className="mt-8 p-4 bg-muted rounded-md">
          <h2 className="text-lg font-semibold mb-2">Current Form State</h2>
          <pre className="text-sm">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default FormWidgetsDemo;
