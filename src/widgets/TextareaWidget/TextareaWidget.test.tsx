/**
 * TextareaWidget Component Tests
 */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextareaWidget } from './TextareaWidget';
import type { TextareaWidgetConfig } from './types';

describe('TextareaWidget', () => {
  const baseConfig: TextareaWidgetConfig = {
    id: 'textarea-1',
    type: 'Textarea',
    label: 'Description',
  };

  it('renders textarea with label', () => {
    render(<TextareaWidget config={baseConfig} />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('renders without label when not provided', () => {
    const config: TextareaWidgetConfig = {
      id: 'textarea-1',
      type: 'Textarea',
    };
    const { container } = render(<TextareaWidget config={config} />);
    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });

  it('applies placeholder text', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      placeholder: 'Enter your description...',
    };
    render(<TextareaWidget config={config} />);
    expect(screen.getByPlaceholderText('Enter your description...')).toBeInTheDocument();
  });

  it('displays bound value', () => {
    const bindings = { value: 'Test content' };
    render(<TextareaWidget config={baseConfig} bindings={bindings} />);
    expect(screen.getByLabelText('Description')).toHaveValue('Test content');
  });

  it('applies custom rows', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      rows: 8,
    };
    render(<TextareaWidget config={config} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveAttribute('rows', '8');
  });

  it('applies default 4 rows when not specified', () => {
    render(<TextareaWidget config={baseConfig} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('calls onChange event when text changes', () => {
    const mockOnChange = jest.fn();
    const events = { onChange: mockOnChange };

    render(<TextareaWidget config={baseConfig} events={events} />);
    const textarea = screen.getByLabelText('Description');

    fireEvent.change(textarea, { target: { value: 'New text' } });

    expect(mockOnChange).toHaveBeenCalledWith('New text');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur event when textarea loses focus', () => {
    const mockOnBlur = jest.fn();
    const events = { onBlur: mockOnBlur };
    const bindings = { value: 'Test' };

    render(<TextareaWidget config={baseConfig} bindings={bindings} events={events} />);
    const textarea = screen.getByLabelText('Description');

    fireEvent.blur(textarea);

    expect(mockOnBlur).toHaveBeenCalledWith('Test');
  });

  it('enforces maxLength', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      maxLength: 100,
    };
    render(<TextareaWidget config={config} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveAttribute('maxLength', '100');
  });

  it('shows character counter when enabled', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      maxLength: 100,
      showCounter: true,
    };
    const bindings = { value: 'Hello' };
    render(<TextareaWidget config={config} bindings={bindings} />);
    expect(screen.getByText('5 / 100')).toBeInTheDocument();
  });

  it('does not show counter when showCounter is false', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      maxLength: 100,
      showCounter: false,
    };
    render(<TextareaWidget config={config} />);
    expect(screen.queryByText('/ 100')).not.toBeInTheDocument();
  });

  it('highlights counter in red when over limit', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      maxLength: 5,
      showCounter: true,
    };
    const bindings = { value: 'Too long text' }; // 13 chars
    render(<TextareaWidget config={config} bindings={bindings} />);
    const counter = screen.getByText('13 / 5');
    expect(counter).toHaveClass('text-red-500');
  });

  it('displays required asterisk', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      required: true,
    };
    const { container } = render(<TextareaWidget config={config} />);
    const label = container.querySelector('label');
    expect(label).toHaveClass('after:content-["*"]');
  });

  it('applies disabled state', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      disabled: true,
    };
    render(<TextareaWidget config={config} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toBeDisabled();
  });

  it('applies readOnly state', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      readOnly: true,
    };
    render(<TextareaWidget config={config} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveAttribute('readOnly');
  });

  it('displays helper text', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      helperText: 'This is a helpful hint',
    };
    render(<TextareaWidget config={config} />);
    expect(screen.getByText('This is a helpful hint')).toBeInTheDocument();
  });

  it('displays error message', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      error: 'This field is required',
    };
    render(<TextareaWidget config={config} />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    const errorMessage = screen.getByText('This field is required');
    expect(errorMessage).toHaveClass('text-red-500');
  });

  it('applies error styling to textarea', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      error: 'Invalid input',
    };
    render(<TextareaWidget config={config} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveClass('border-red-500');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('hides helper text when error is present', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      helperText: 'Helper text',
      error: 'Error message',
    };
    render(<TextareaWidget config={config} />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('applies custom className from bindings', () => {
    const bindings = { className: 'custom-textarea-class' };
    const { container } = render(<TextareaWidget config={baseConfig} bindings={bindings} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-textarea-class');
  });

  it('sets aria-describedby for error', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      error: 'Error message',
    };
    render(<TextareaWidget config={config} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveAttribute('aria-describedby', 'textarea-1-error');
  });

  it('sets aria-describedby for helper text', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      helperText: 'Helper text',
    };
    render(<TextareaWidget config={config} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveAttribute('aria-describedby', 'textarea-1-helper');
  });

  it('applies autoResize styles when enabled', () => {
    const config: TextareaWidgetConfig = {
      ...baseConfig,
      autoResize: true,
    };
    render(<TextareaWidget config={config} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveClass('resize-none', 'overflow-hidden');
  });

  it('handles empty value gracefully', () => {
    const bindings = { value: '' };
    render(<TextareaWidget config={baseConfig} bindings={bindings} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveValue('');
  });

  it('handles undefined value gracefully', () => {
    render(<TextareaWidget config={baseConfig} />);
    const textarea = screen.getByLabelText('Description');
    expect(textarea).toHaveValue('');
  });
});
