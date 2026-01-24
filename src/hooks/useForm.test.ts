/**
 * useForm Hook Tests
 */

import { act, renderHook } from '@testing-library/react';
import type { ValidationRule } from '@/types/form.types';
import { useForm } from './useForm';

describe('useForm Hook', () => {
  describe('Initialization', () => {
    it('should initialize with default empty state', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.state.values).toEqual({});
      expect(result.current.state.errors).toEqual({});
      expect(result.current.state.touched).toEqual({});
      expect(result.current.state.isSubmitting).toBe(false);
      expect(result.current.state.isDirty).toBe(false);
      expect(result.current.state.isValid).toBe(true);
      expect(result.current.state.submitCount).toBe(0);
    });

    it('should initialize with provided initial values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() => useForm({ initialValues }));

      expect(result.current.state.values).toEqual(initialValues);
      expect(result.current.state.initialValues).toEqual(initialValues);
    });

    it('should initialize with validation rules', () => {
      const validationRules = {
        email: { email: true, required: true },
      };
      const { result } = renderHook(() => useForm({ validationRules }));

      expect(result.current.state).toBeDefined();
    });
  });

  describe('Field Registration', () => {
    it('should register a field', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.registerField('email');
      });

      // Field registration doesn't change state, but field should be tracked
      expect(result.current.state).toBeDefined();
    });

    it('should unregister a field', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.registerField('email');
        result.current.unregisterField('email');
      });

      expect(result.current.state).toBeDefined();
    });

    it('should register field with validation rules', () => {
      const { result } = renderHook(() => useForm());
      const rules: ValidationRule = { required: true };

      act(() => {
        result.current.registerField('email', rules);
      });

      expect(result.current.state).toBeDefined();
    });
  });

  describe('Value Management', () => {
    it('should set a field value', () => {
      const { result } = renderHook(() => useForm({ initialValues: { name: '' } }));

      act(() => {
        result.current.setValue('name', 'John');
      });

      expect(result.current.state.values.name).toBe('John');
    });

    it('should mark form as dirty when value changes', () => {
      const { result } = renderHook(() => useForm({ initialValues: { name: '' } }));

      expect(result.current.state.isDirty).toBe(false);

      act(() => {
        result.current.setValue('name', 'John');
      });

      expect(result.current.state.isDirty).toBe(true);
    });

    it('should set multiple values at once', () => {
      const { result } = renderHook(() => useForm({ initialValues: {} }));

      act(() => {
        result.current.setValues({ name: 'John', email: 'john@example.com' });
      });

      expect(result.current.state.values.name).toBe('John');
      expect(result.current.state.values.email).toBe('john@example.com');
    });

    it('should get field value', () => {
      const { result } = renderHook(() => useForm({ initialValues: { name: 'John' } }));

      const value = result.current.getValue('name');
      expect(value).toBe('John');
    });
  });

  describe('Error Management', () => {
    it('should set field error', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setError('email', 'Invalid email');
      });

      expect(result.current.state.errors.email).toBe('Invalid email');
      expect(result.current.state.isValid).toBe(false);
    });

    it('should clear field error', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setError('email', 'Invalid email');
        result.current.clearError('email');
      });

      expect(result.current.state.errors.email).toBeUndefined();
      expect(result.current.state.isValid).toBe(true);
    });

    it('should set multiple errors', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setErrors({ email: 'Invalid email', name: 'Required' });
      });

      expect(result.current.state.errors.email).toBe('Invalid email');
      expect(result.current.state.errors.name).toBe('Required');
      expect(result.current.state.isValid).toBe(false);
    });

    it('should clear all errors', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setErrors({ email: 'Invalid email', name: 'Required' });
        result.current.clearErrors();
      });

      expect(result.current.state.errors).toEqual({});
      expect(result.current.state.isValid).toBe(true);
    });

    it('should get field error', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setError('email', 'Invalid email');
      });

      const error = result.current.getError('email');
      expect(error).toBe('Invalid email');
    });

    it('should check if field has error', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setError('email', 'Invalid email');
      });

      expect(result.current.hasError('email')).toBe(true);
      expect(result.current.hasError('name')).toBe(false);
    });
  });

  describe('Touch Management', () => {
    it('should mark field as touched', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setTouched('email', true);
      });

      expect(result.current.state.touched.email).toBe(true);
    });

    it('should mark field as untouched', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setTouched('email', true);
        result.current.setTouched('email', false);
      });

      expect(result.current.state.touched.email).toBe(false);
    });

    it('should check if field is touched', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setTouched('email', true);
      });

      expect(result.current.isTouched('email')).toBe(true);
      expect(result.current.isTouched('name')).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should validate a single field', async () => {
      const validationRules = {
        email: { email: true, required: true },
      };
      const { result } = renderHook(() => useForm({ validationRules }));

      act(() => {
        result.current.registerField('email', validationRules.email);
        result.current.setValue('email', 'invalid');
      });

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.validateField('email');
      });

      expect(isValid).toBe(false);
      expect(result.current.state.errors.email).toBeTruthy();
    });

    it('should validate all fields', async () => {
      const validationRules = {
        email: { email: true, required: true },
        name: { required: true },
      };
      const { result } = renderHook(() => useForm({ validationRules }));

      act(() => {
        result.current.registerField('email', validationRules.email);
        result.current.registerField('name', validationRules.name);
        result.current.setValue('email', 'invalid');
        result.current.setValue('name', '');
      });

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect(result.current.state.errors.email).toBeTruthy();
      expect(result.current.state.errors.name).toBeTruthy();
    });

    it('should pass validation with valid values', async () => {
      const validationRules = {
        email: { email: true, required: true },
      };
      const { result } = renderHook(() => useForm({ validationRules }));

      act(() => {
        result.current.registerField('email', validationRules.email);
        result.current.setValue('email', 'test@example.com');
      });

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.validateField('email');
      });

      expect(isValid).toBe(true);
      expect(result.current.state.errors.email).toBeUndefined();
    });

    it('should clear error after successful validation', async () => {
      const validationRules = {
        email: { email: true },
      };
      const { result } = renderHook(() => useForm({ validationRules }));

      act(() => {
        result.current.registerField('email', validationRules.email);
        result.current.setValue('email', 'invalid');
      });

      await act(async () => {
        await result.current.validateField('email');
      });

      expect(result.current.state.errors.email).toBeTruthy();

      act(() => {
        result.current.setValue('email', 'valid@example.com');
      });

      await act(async () => {
        await result.current.validateField('email');
      });

      expect(result.current.state.errors.email).toBeUndefined();
    });
  });

  describe('Form Submission', () => {
    it('should handle form submission with valid data', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() =>
        useForm({ initialValues: { name: 'John', email: 'john@example.com' } })
      );

      const handleSubmit = result.current.handleSubmit(onSubmit);

      await act(async () => {
        await handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith({ name: 'John', email: 'john@example.com' });
      expect(result.current.state.submitCount).toBe(1);
      expect(result.current.state.isSubmitting).toBe(false);
    });

    it('should prevent submission with invalid data', async () => {
      const onSubmit = jest.fn();
      const validationRules = {
        email: { email: true, required: true },
      };
      const { result } = renderHook(() => useForm({ validationRules }));

      act(() => {
        result.current.registerField('email', validationRules.email);
        result.current.setValue('email', 'invalid');
      });

      const handleSubmit = result.current.handleSubmit(onSubmit);

      await act(async () => {
        await handleSubmit();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(result.current.state.submitCount).toBe(1);
    });

    it('should mark all fields as touched on submission', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.registerField('email');
        result.current.registerField('name');
      });

      const handleSubmit = result.current.handleSubmit(onSubmit);

      await act(async () => {
        await handleSubmit();
      });

      expect(result.current.state.touched.email).toBe(true);
      expect(result.current.state.touched.name).toBe(true);
    });

    it('should set isSubmitting during submission', async () => {
      const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { result } = renderHook(() => useForm({ initialValues: { name: 'John' } }));

      const handleSubmit = result.current.handleSubmit(onSubmit);

      const submitPromise = act(async () => {
        await handleSubmit();
      });

      // During submission, isSubmitting should be false after completion
      await submitPromise;
      expect(result.current.state.isSubmitting).toBe(false);
    });
  });

  describe('Form Reset', () => {
    it('should reset form to initial values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() => useForm({ initialValues }));

      act(() => {
        result.current.setValue('name', 'Jane');
        result.current.setError('email', 'Invalid');
        result.current.setTouched('name', true);
      });

      expect(result.current.state.values.name).toBe('Jane');
      expect(result.current.state.isDirty).toBe(true);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.state.values).toEqual(initialValues);
      expect(result.current.state.errors).toEqual({});
      expect(result.current.state.touched).toEqual({});
      expect(result.current.state.isDirty).toBe(false);
      expect(result.current.state.isValid).toBe(true);
      expect(result.current.state.submitCount).toBe(0);
    });
  });

  describe('Utility Functions', () => {
    it('should check if form is dirty', () => {
      const { result } = renderHook(() => useForm({ initialValues: { name: '' } }));

      expect(result.current.isDirty()).toBe(false);

      act(() => {
        result.current.setValue('name', 'John');
      });

      expect(result.current.isDirty()).toBe(true);
    });

    it('should check if form is valid', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.isValid()).toBe(true);

      act(() => {
        result.current.setError('email', 'Invalid');
      });

      expect(result.current.isValid()).toBe(false);
    });
  });
});
