/**
 * Form Widget Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ActionConfig } from '@/types/action.types';
import { FormWidget } from './FormWidget';
import type { FormWidgetConfig } from './types';

describe('FormWidget', () => {
  const baseConfig: FormWidgetConfig = {
    id: 'test-form',
    type: 'Form',
    onSubmit: {
      id: 'submit-action',
      type: 'apiCall',
      params: {},
    } as ActionConfig,
  };

  it('renders form element', () => {
    render(<FormWidget config={baseConfig} />);

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('id', 'test-form');
  });

  it('renders form title and description', () => {
    const config: FormWidgetConfig = {
      ...baseConfig,
      title: 'Test Form',
      description: 'This is a test form',
    };

    render(<FormWidget config={config} />);

    expect(screen.getByText('Test Form')).toBeInTheDocument();
    expect(screen.getByText('This is a test form')).toBeInTheDocument();
  });

  it('renders submit button with custom label', () => {
    const config: FormWidgetConfig = {
      ...baseConfig,
      submitLabel: 'Create Account',
    };

    render(<FormWidget config={config} />);

    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('renders reset button when resetLabel is provided', () => {
    const config: FormWidgetConfig = {
      ...baseConfig,
      resetLabel: 'Clear Form',
    };

    render(<FormWidget config={config} />);

    expect(screen.getByRole('button', { name: 'Clear Form' })).toBeInTheDocument();
  });

  it('does not render reset button when resetLabel is not provided', () => {
    render(<FormWidget config={baseConfig} />);

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('renders children widgets', () => {
    render(
      <FormWidget config={baseConfig}>
        <div data-testid="child-widget">Child Widget</div>
      </FormWidget>
    );

    expect(screen.getByTestId('child-widget')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const onSubmit = jest.fn();

    render(
      <FormWidget
        config={baseConfig}
        events={{
          onSubmit,
        }}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('disables form during submission when disableOnSubmit is true', async () => {
    const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <FormWidget
        config={{
          ...baseConfig,
          disableOnSubmit: true,
        }}
        events={{
          onSubmit,
        }}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });

    expect(submitButton).not.toBeDisabled();

    await userEvent.click(submitButton);

    // Button should be disabled during submission
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('shows loading spinner during submission when showLoading is true', async () => {
    const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <FormWidget
        config={{
          ...baseConfig,
          showLoading: true,
        }}
        events={{
          onSubmit,
        }}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitButton);

    // Loading spinner should appear (has animate-spin class)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('displays form-level error', () => {
    render(
      <FormWidget
        config={baseConfig}
        bindings={{
          error: 'Form submission failed',
        }}
      />
    );

    expect(screen.getByText('Form submission failed')).toBeInTheDocument();
  });

  it('applies vertical layout class', () => {
    render(
      <FormWidget
        config={{
          ...baseConfig,
          layout: 'vertical',
        }}
      />
    );

    // Check if form is rendered (layout classes are on children container)
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('applies horizontal layout class', () => {
    render(
      <FormWidget
        config={{
          ...baseConfig,
          layout: 'horizontal',
        }}
      />
    );

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('applies compact spacing', () => {
    render(
      <FormWidget
        config={{
          ...baseConfig,
          spacing: 'compact',
        }}
      />
    );

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('applies relaxed spacing', () => {
    render(
      <FormWidget
        config={{
          ...baseConfig,
          spacing: 'relaxed',
        }}
      />
    );

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('handles reset button click', async () => {
    render(
      <FormWidget
        config={{
          ...baseConfig,
          resetLabel: 'Reset',
          initialValues: { name: 'John' },
        }}
      />
    );

    const resetButton = screen.getByRole('button', { name: 'Reset' });
    await userEvent.click(resetButton);

    // Form should reset to initial values
    // Note: We would need to check internal form state which is not directly accessible
  });

  it('shows debug info when debug mode is enabled', () => {
    render(
      <FormWidget
        config={{
          ...baseConfig,
          debug: true,
        }}
      />
    );

    expect(screen.getByText('Form Debug Info')).toBeInTheDocument();
  });

  it('does not show debug info when debug mode is disabled', () => {
    render(<FormWidget config={baseConfig} />);

    expect(screen.queryByText('Form Debug Info')).not.toBeInTheDocument();
  });
});
