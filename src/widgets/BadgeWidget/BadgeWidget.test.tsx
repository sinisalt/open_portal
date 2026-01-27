/**
 * BadgeWidget Tests
 */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BadgeWidget } from './BadgeWidget';
import type { BadgeWidgetConfig } from './types';

describe('BadgeWidget', () => {
  const mockOnActionClick = jest.fn();

  const defaultConfig: BadgeWidgetConfig = {
    id: 'test-badge',
    type: 'Badge',
    label: 'Test Badge',
  };

  beforeEach(() => {
    mockOnActionClick.mockClear();
  });

  it('renders badge with label', () => {
    render(<BadgeWidget config={defaultConfig} />);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders badge with default variant', () => {
    const { container } = render(<BadgeWidget config={defaultConfig} />);
    const badge = container.querySelector('.inline-flex');
    expect(badge).toBeInTheDocument();
  });

  it('applies different variants', () => {
    const variants = [
      'default',
      'secondary',
      'destructive',
      'outline',
      'success',
      'warning',
    ] as const;

    variants.forEach(variant => {
      const config: BadgeWidgetConfig = {
        ...defaultConfig,
        label: variant,
        variant,
      };

      render(<BadgeWidget config={config} />);
      expect(screen.getByText(variant)).toBeInTheDocument();
    });
  });

  it('applies different sizes', () => {
    const sizes = ['sm', 'default', 'lg'] as const;

    sizes.forEach(size => {
      const config: BadgeWidgetConfig = {
        ...defaultConfig,
        label: size,
        size,
      };

      const { container } = render(<BadgeWidget config={config} />);
      const badge = container.querySelector('.inline-flex');

      if (size === 'sm') {
        expect(badge).toHaveClass('text-xs');
      } else if (size === 'default') {
        expect(badge).toHaveClass('text-sm');
      } else if (size === 'lg') {
        expect(badge).toHaveClass('text-base');
      }
    });
  });

  it('renders badge with icon', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      icon: 'Check',
    };

    const { container } = render(<BadgeWidget config={config} />);
    const badge = container.querySelector('.inline-flex');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders removable badge', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      removable: true,
      onRemoveActionId: 'remove-badge',
    };

    render(<BadgeWidget config={config} />);
    const removeButton = screen.getByLabelText('Remove badge');
    expect(removeButton).toBeInTheDocument();
  });

  it('calls onActionClick when remove button is clicked', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      removable: true,
      onRemoveActionId: 'remove-badge',
    };

    render(<BadgeWidget config={config} events={{ onActionClick: mockOnActionClick }} />);
    const removeButton = screen.getByLabelText('Remove badge');
    fireEvent.click(removeButton);

    expect(mockOnActionClick).toHaveBeenCalledWith('remove-badge');
  });

  it('does not show remove button when not removable', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      removable: false,
    };

    render(<BadgeWidget config={config} />);
    const removeButton = screen.queryByLabelText('Remove badge');
    expect(removeButton).not.toBeInTheDocument();
  });

  it('applies custom className from config', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      className: 'custom-badge-class',
    };

    const { container } = render(<BadgeWidget config={config} />);
    const badge = container.querySelector('.inline-flex');
    expect(badge).toHaveClass('custom-badge-class');
  });

  it('applies custom className from bindings', () => {
    const { container } = render(
      <BadgeWidget config={defaultConfig} bindings={{ className: 'binding-badge-class' }} />
    );
    const badge = container.querySelector('.inline-flex');
    expect(badge).toHaveClass('binding-badge-class');
  });

  it('renders badge with icon and removable', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      icon: 'Star',
      removable: true,
      onRemoveActionId: 'remove',
    };

    render(<BadgeWidget config={config} />);

    expect(screen.getByText('Test Badge')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove badge')).toBeInTheDocument();

    const badge = screen.getByText('Test Badge').parentElement;
    // Should have two SVGs: the icon and the close button
    expect(badge?.querySelectorAll('svg')).toHaveLength(2);
  });

  it('stops event propagation when remove button is clicked', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      removable: true,
      onRemoveActionId: 'remove',
    };

    const parentClickHandler = jest.fn();
    render(
      // biome-ignore lint/a11y/useKeyWithClickEvents: Test wrapper div
      // biome-ignore lint/a11y/noStaticElementInteractions: Test wrapper div
      <div onClick={parentClickHandler}>
        <BadgeWidget config={config} events={{ onActionClick: mockOnActionClick }} />
      </div>
    );

    const removeButton = screen.getByLabelText('Remove badge');
    fireEvent.click(removeButton);

    // Should call the remove action
    expect(mockOnActionClick).toHaveBeenCalledWith('remove');
    // Should NOT propagate to parent
    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('applies success variant styles', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      variant: 'success',
    };

    const { container } = render(<BadgeWidget config={config} />);
    const badge = container.querySelector('.inline-flex');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('applies warning variant styles', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      variant: 'warning',
    };

    const { container } = render(<BadgeWidget config={config} />);
    const badge = container.querySelector('.inline-flex');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('renders badge with long label', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      label: 'This is a very long badge label that might wrap',
    };

    render(<BadgeWidget config={config} />);
    expect(screen.getByText('This is a very long badge label that might wrap')).toBeInTheDocument();
  });

  it('renders badge with special characters in label', () => {
    const config: BadgeWidgetConfig = {
      ...defaultConfig,
      label: '✓ Status: Active (100%)',
    };

    render(<BadgeWidget config={config} />);
    expect(screen.getByText('✓ Status: Active (100%)')).toBeInTheDocument();
  });
});
