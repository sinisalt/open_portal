import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckboxWidget } from './CheckboxWidget';
import type { CheckboxWidgetConfig } from './types';

describe('CheckboxWidget', () => {
  const baseConfig: CheckboxWidgetConfig = {
    id: 'test-checkbox',
    type: 'Checkbox',
  };

  it('renders checkbox', () => {
    render(<CheckboxWidget config={baseConfig} />);

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<CheckboxWidget config={{ ...baseConfig, label: 'Accept terms' }} />);

    expect(screen.getByText('Accept terms')).toBeInTheDocument();
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<CheckboxWidget config={{ ...baseConfig, label: 'Required', required: true }} />);

    const label = screen.getByText('Required').parentElement;
    expect(label?.textContent).toContain('*');
  });

  it('renders help text', () => {
    render(
      <CheckboxWidget
        config={{ ...baseConfig, label: 'Checkbox', helpText: 'Check this box' }}
      />
    );

    expect(screen.getByText('Check this box')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <CheckboxWidget
        config={{ ...baseConfig, label: 'Checkbox' }}
        bindings={{ error: 'This field is required' }}
      />
    );

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('This field is required');
  });

  it('renders as checked when value is true', () => {
    render(<CheckboxWidget config={baseConfig} bindings={{ value: true }} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders as unchecked when value is false', () => {
    render(<CheckboxWidget config={baseConfig} bindings={{ value: false }} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('defaults to unchecked when no value provided', () => {
    render(<CheckboxWidget config={baseConfig} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('calls onChange with true when checked', async () => {
    const onChange = jest.fn();

    render(<CheckboxWidget config={baseConfig} events={{ onChange }} />);

    const checkbox = screen.getByRole('checkbox');
    userEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when unchecked', async () => {
    const onChange = jest.fn();

    render(<CheckboxWidget config={baseConfig} bindings={{ value: true }} events={{ onChange }} />);

    const checkbox = screen.getByRole('checkbox');
    userEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('respects disabled state', () => {
    render(<CheckboxWidget config={{ ...baseConfig, disabled: true }} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('applies disabled styling to label', () => {
    render(<CheckboxWidget config={{ ...baseConfig, label: 'Disabled', disabled: true }} />);

    const label = screen.getByText('Disabled');
    expect(label).toHaveClass('opacity-50');
    expect(label).toHaveClass('cursor-not-allowed');
  });

  it('supports indeterminate state', () => {
    render(<CheckboxWidget config={{ ...baseConfig, indeterminate: true }} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
  });

  it('converts indeterminate to false when clicked', async () => {
    const onChange = jest.fn();

    render(
      <CheckboxWidget
        config={{ ...baseConfig, indeterminate: true }}
        events={{ onChange }}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    userEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('has proper accessibility attributes', () => {
    render(
      <CheckboxWidget
        config={{ ...baseConfig, label: 'Accessible', required: true }}
        bindings={{ error: 'Error message' }}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-required', 'true');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAttribute('aria-describedby', 'test-checkbox-error');
  });

  it('associates help text with aria-describedby', () => {
    render(
      <CheckboxWidget
        config={{ ...baseConfig, label: 'Checkbox', helpText: 'Help text here' }}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-describedby', 'test-checkbox-help');
  });

  it('label is clickable', async () => {
    const onChange = jest.fn();

    render(
      <CheckboxWidget
        config={{ ...baseConfig, label: 'Clickable label' }}
        events={{ onChange }}
      />
    );

    const label = screen.getByText('Clickable label');
    userEvent.click(label);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('error message appears below checkbox', () => {
    const { container } = render(
      <CheckboxWidget
        config={{ ...baseConfig, label: 'Checkbox' }}
        bindings={{ error: 'Error' }}
      />
    );

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveClass('ml-6'); // Indented to align with label
  });

  it('does not show help text when error is present', () => {
    render(
      <CheckboxWidget
        config={{ ...baseConfig, label: 'Checkbox', helpText: 'Help text' }}
        bindings={{ error: 'Error message' }}
      />
    );

    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
