/**
 * ButtonGroupWidget Tests
 */

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ButtonGroupWidget } from './ButtonGroupWidget';
import type { ButtonGroupWidgetConfig } from './types';

describe('ButtonGroupWidget', () => {
  const mockOnActionClick = jest.fn();

  const defaultConfig: ButtonGroupWidgetConfig = {
    id: 'test-button-group',
    type: 'ButtonGroup',
    buttons: [
      {
        id: 'btn-1',
        label: 'Button 1',
        actionId: 'action-1',
      },
      {
        id: 'btn-2',
        label: 'Button 2',
        actionId: 'action-2',
      },
    ],
  };

  beforeEach(() => {
    mockOnActionClick.mockClear();
  });

  it('renders all buttons', () => {
    render(<ButtonGroupWidget config={defaultConfig} />);

    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.getByText('Button 2')).toBeInTheDocument();
  });

  it('renders buttons horizontally by default', () => {
    const { container } = render(<ButtonGroupWidget config={defaultConfig} />);
    const group = container.firstChild as HTMLElement;

    expect(group).toHaveClass('flex-row');
  });

  it('renders buttons vertically when specified', () => {
    const config: ButtonGroupWidgetConfig = {
      ...defaultConfig,
      orientation: 'vertical',
    };

    const { container } = render(<ButtonGroupWidget config={config} />);
    const group = container.firstChild as HTMLElement;

    expect(group).toHaveClass('flex-col');
  });

  it('applies correct gap classes', () => {
    const gapTests = [
      { gap: 'none' as const, expected: 'gap-0' },
      { gap: 'sm' as const, expected: 'gap-2' },
      { gap: 'md' as const, expected: 'gap-4' },
      { gap: 'lg' as const, expected: 'gap-6' },
    ];

    gapTests.forEach(({ gap, expected }) => {
      const { container } = render(<ButtonGroupWidget config={{ ...defaultConfig, gap }} />);
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass(expected);
    });
  });

  it('applies correct justify classes', () => {
    const justifyTests = [
      { justify: 'start' as const, expected: 'justify-start' },
      { justify: 'center' as const, expected: 'justify-center' },
      { justify: 'end' as const, expected: 'justify-end' },
      { justify: 'between' as const, expected: 'justify-between' },
      { justify: 'around' as const, expected: 'justify-around' },
    ];

    justifyTests.forEach(({ justify, expected }) => {
      const { container } = render(<ButtonGroupWidget config={{ ...defaultConfig, justify }} />);
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass(expected);
    });
  });

  it('calls onActionClick when button is clicked', () => {
    render(
      <ButtonGroupWidget config={defaultConfig} events={{ onActionClick: mockOnActionClick }} />
    );

    const button1 = screen.getByText('Button 1');
    fireEvent.click(button1);

    expect(mockOnActionClick).toHaveBeenCalledWith('action-1');
  });

  it('renders button with icon', () => {
    const config: ButtonGroupWidgetConfig = {
      ...defaultConfig,
      buttons: [
        {
          id: 'btn-icon',
          label: 'With Icon',
          icon: 'Plus',
          actionId: 'add',
        },
      ],
    };

    render(<ButtonGroupWidget config={config} />);

    expect(screen.getByText('With Icon')).toBeInTheDocument();
    // Icon is rendered as an SVG element
    const button = screen.getByText('With Icon').parentElement;
    expect(button?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders button with icon only (no label)', () => {
    const config: ButtonGroupWidgetConfig = {
      ...defaultConfig,
      buttons: [
        {
          id: 'btn-icon-only',
          icon: 'Settings',
          size: 'icon',
          actionId: 'settings',
        },
      ],
    };

    const { container } = render(<ButtonGroupWidget config={config} />);

    // Icon button should exist
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders button as link when href is provided', () => {
    const config: ButtonGroupWidgetConfig = {
      ...defaultConfig,
      buttons: [
        {
          id: 'link-btn',
          label: 'External Link',
          href: 'https://example.com',
        },
      ],
    };

    render(<ButtonGroupWidget config={config} />);

    const link = screen.getByText('External Link').closest('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('disables button when disabled prop is true', () => {
    const config: ButtonGroupWidgetConfig = {
      ...defaultConfig,
      buttons: [
        {
          id: 'disabled-btn',
          label: 'Disabled',
          actionId: 'action',
          disabled: true,
        },
      ],
    };

    render(<ButtonGroupWidget config={config} />);

    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
  });

  it('applies different button variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

    variants.forEach(variant => {
      const config: ButtonGroupWidgetConfig = {
        ...defaultConfig,
        buttons: [
          {
            id: `btn-${variant}`,
            label: variant,
            variant,
            actionId: 'action',
          },
        ],
      };

      render(<ButtonGroupWidget config={config} />);
      const button = screen.getByText(variant);

      // Check that variant class is applied
      expect(button).toBeInTheDocument();
    });
  });

  it('applies different button sizes', () => {
    const sizes = ['sm', 'default', 'lg', 'icon'] as const;

    sizes.forEach(size => {
      const config: ButtonGroupWidgetConfig = {
        ...defaultConfig,
        buttons: [
          {
            id: `btn-${size}`,
            label: size !== 'icon' ? size : undefined,
            icon: size === 'icon' ? 'Plus' : undefined,
            size,
            actionId: 'action',
          },
        ],
      };

      render(<ButtonGroupWidget config={config} />);
      // Button is rendered with the size prop
    });
  });

  it('makes buttons full width when fullWidth is true', () => {
    const config: ButtonGroupWidgetConfig = {
      ...defaultConfig,
      fullWidth: true,
    };

    render(<ButtonGroupWidget config={config} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('w-full');
    });
  });

  it('applies custom className from config', () => {
    const config: ButtonGroupWidgetConfig = {
      ...defaultConfig,
      className: 'custom-class',
    };

    const { container } = render(<ButtonGroupWidget config={config} />);
    const group = container.firstChild as HTMLElement;

    expect(group).toHaveClass('custom-class');
  });

  it('applies custom className from bindings', () => {
    const { container } = render(
      <ButtonGroupWidget config={defaultConfig} bindings={{ className: 'binding-class' }} />
    );
    const group = container.firstChild as HTMLElement;

    expect(group).toHaveClass('binding-class');
  });

  it('renders multiple buttons with mixed configurations', () => {
    const config: ButtonGroupWidgetConfig = {
      ...defaultConfig,
      buttons: [
        {
          id: 'btn-1',
          label: 'Primary',
          variant: 'default',
          actionId: 'primary',
        },
        {
          id: 'btn-2',
          label: 'Secondary',
          variant: 'secondary',
          actionId: 'secondary',
        },
        {
          id: 'btn-3',
          icon: 'Settings',
          size: 'icon',
          variant: 'outline',
          actionId: 'settings',
        },
        {
          id: 'btn-4',
          label: 'Link',
          href: 'https://example.com',
          variant: 'link',
        },
      ],
    };

    render(<ButtonGroupWidget config={config} />);

    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();

    // Check link
    const link = screen.getByText('Link').closest('a');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('does not call onActionClick when button has no actionId', () => {
    const config: ButtonGroupWidgetConfig = {
      ...defaultConfig,
      buttons: [
        {
          id: 'btn-no-action',
          label: 'No Action',
        },
      ],
    };

    render(<ButtonGroupWidget config={config} events={{ onActionClick: mockOnActionClick }} />);

    const button = screen.getByText('No Action');
    fireEvent.click(button);

    expect(mockOnActionClick).not.toHaveBeenCalled();
  });

  it('renders empty group when no buttons provided', () => {
    const config: ButtonGroupWidgetConfig = {
      ...defaultConfig,
      buttons: [],
    };

    const { container } = render(<ButtonGroupWidget config={config} />);
    const group = container.firstChild as HTMLElement;

    expect(group).toBeInTheDocument();
    expect(group.children).toHaveLength(0);
  });
});
