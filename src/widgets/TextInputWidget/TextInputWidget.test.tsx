/**
 * TextInputWidget Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInputWidget } from './TextInputWidget';
import type { TextInputWidgetConfig } from './types';

describe('TextInputWidget', () => {
  const baseConfig: TextInputWidgetConfig = {
    id: 'test-input',
    type: 'TextInput',
  };

  it('renders input field', () => {
    render(<TextInputWidget config={baseConfig} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<TextInputWidget config={{ ...baseConfig, label: 'Email Address' }} />);

    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<TextInputWidget config={{ ...baseConfig, label: 'Required Field', required: true }} />);

    const label = screen.getByText('Required Field').parentElement;
    expect(label?.textContent).toContain('*');
  });

  it('renders help text', () => {
    render(<TextInputWidget config={{ ...baseConfig, helpText: 'Enter your email' }} />);

    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<TextInputWidget config={baseConfig} bindings={{ error: 'This field is required' }} />);

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('This field is required');
  });

  it('renders with value from bindings', () => {
    render(<TextInputWidget config={baseConfig} bindings={{ value: 'test@example.com' }} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test@example.com');
  });

  it('calls onChange when input value changes', () => {
    const onChange = jest.fn();

    render(<TextInputWidget config={baseConfig} events={{ onChange }} />);

    const input = screen.getByRole('textbox');
    userEvent.type(input, 'hello');

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onBlur when input loses focus', () => {
    const onBlur = jest.fn();

    render(<TextInputWidget config={baseConfig} events={{ onBlur }} />);

    const input = screen.getByRole('textbox');
    userEvent.click(input);
    userEvent.tab();

    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('calls onFocus when input gains focus', () => {
    const onFocus = jest.fn();

    render(<TextInputWidget config={baseConfig} events={{ onFocus }} />);

    const input = screen.getByRole('textbox');
    userEvent.click(input);

    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onEnter when Enter key is pressed', () => {
    const onEnter = jest.fn();

    render(<TextInputWidget config={baseConfig} events={{ onEnter }} />);

    const input = screen.getByRole('textbox');
    userEvent.type(input, '{enter}');

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', () => {
    render(<TextInputWidget config={{ ...baseConfig, disabled: true }} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('respects readonly state', () => {
    render(<TextInputWidget config={{ ...baseConfig, readonly: true }} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('respects maxLength attribute', () => {
    render(<TextInputWidget config={{ ...baseConfig, maxLength: 10 }} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('applies autofocus when specified', () => {
    render(<TextInputWidget config={{ ...baseConfig, autoFocus: true }} />);

    const input = screen.getByRole('textbox');
    // React uses autoFocus prop but DOM renders it as lowercase autofocus
    expect(input).toHaveAttribute('autofocus');
  });

  it('renders placeholder text', () => {
    render(<TextInputWidget config={{ ...baseConfig, placeholder: 'Enter text here' }} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text here');
  });

  it('supports different input types', () => {
    const { rerender } = render(
      <TextInputWidget config={{ ...baseConfig, inputType: 'email' }} />
    );

    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<TextInputWidget config={{ ...baseConfig, inputType: 'tel' }} />);
    input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'tel');

    rerender(<TextInputWidget config={{ ...baseConfig, inputType: 'url' }} />);
    input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'url');
  });

  it('defaults to text type when no inputType specified', () => {
    render(<TextInputWidget config={baseConfig} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('has proper accessibility attributes', () => {
    render(
      <TextInputWidget
        config={{ ...baseConfig, label: 'Accessible Input', required: true }}
        bindings={{ error: 'Error message' }}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
  });

  it('associates help text with aria-describedby', () => {
    render(<TextInputWidget config={{ ...baseConfig, helpText: 'Help text here' }} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-help');
  });

  it('handles empty value', () => {
    render(<TextInputWidget config={baseConfig} bindings={{ value: '' }} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  it('does not show help text when error is present', () => {
    render(
      <TextInputWidget
        config={{ ...baseConfig, helpText: 'Help text' }}
        bindings={{ error: 'Error message' }}
      />
    );

    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('applies disabled styling to label', () => {
    render(<TextInputWidget config={{ ...baseConfig, label: 'Disabled', disabled: true }} />);

    const label = screen.getByText('Disabled');
    expect(label).toHaveClass('opacity-50');
  });

  it('logs warning for icon support', () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    render(<TextInputWidget config={{ ...baseConfig, icon: 'mail', iconPosition: 'start' }} />);

    expect(consoleWarn).toHaveBeenCalledWith('TextInput icon support not yet implemented in MVP.');

    consoleWarn.mockRestore();
  });

  it('supports password input type', () => {
    render(<TextInputWidget config={{ ...baseConfig, inputType: 'password' }} />);

    // Password inputs don't have a specific role, so we query by id
    const input = document.getElementById('test-input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('supports number input type', () => {
    render(<TextInputWidget config={{ ...baseConfig, inputType: 'number' }} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('supports search input type', () => {
    render(<TextInputWidget config={{ ...baseConfig, inputType: 'search' }} />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('type', 'search');
  });
});
