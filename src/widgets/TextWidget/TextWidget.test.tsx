/**
 * TextWidget Component Tests
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextWidget } from './TextWidget';
import type { TextWidgetConfig } from './types';

describe('TextWidget', () => {
  const baseConfig: TextWidgetConfig = {
    id: 'text-1',
    type: 'Text',
    content: 'Hello World',
  };

  it('renders text content', () => {
    render(<TextWidget config={baseConfig} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders as paragraph by default', () => {
    const { container } = render(<TextWidget config={baseConfig} />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent).toBe('Hello World');
  });

  it('renders as heading when variant is heading', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      variant: 'heading',
    };
    const { container } = render(<TextWidget config={config} />);
    const heading = container.querySelector('h1');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-4xl', 'font-bold');
  });

  it('renders as subheading when variant is subheading', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      variant: 'subheading',
    };
    const { container } = render(<TextWidget config={config} />);
    const heading = container.querySelector('h2');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-2xl', 'font-semibold');
  });

  it('renders as code when variant is code', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      content: 'const x = 1;',
      variant: 'code',
    };
    const { container } = render(<TextWidget config={config} />);
    const code = container.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code).toHaveClass('font-mono', 'bg-gray-100');
  });

  it('renders as caption when variant is caption', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      variant: 'caption',
    };
    const { container } = render(<TextWidget config={config} />);
    const caption = container.querySelector('small');
    expect(caption).toBeInTheDocument();
    expect(caption).toHaveClass('text-sm', 'text-gray-600');
  });

  it('applies text alignment', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      align: 'center',
    };
    const { container } = render(<TextWidget config={config} />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveClass('text-center');
  });

  it('applies custom color', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      color: '#ff0000',
    };
    const { container } = render(<TextWidget config={config} />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveStyle({ color: '#ff0000' });
  });

  it('applies font weight', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      weight: 'bold',
    };
    const { container } = render(<TextWidget config={config} />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveClass('font-bold');
  });

  it('applies custom font size', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      size: '24px',
    };
    const { container } = render(<TextWidget config={config} />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveStyle({ fontSize: '24px' });
  });

  it('applies truncate with line clamp', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      content: 'Very long text that should be truncated',
      truncate: 2,
    };
    const { container } = render(<TextWidget config={config} />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveClass('line-clamp-2');
  });

  it('applies no wrap when wrap is false', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      wrap: false,
    };
    const { container } = render(<TextWidget config={config} />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveClass('whitespace-nowrap', 'overflow-hidden', 'text-ellipsis');
  });

  it('applies custom className from bindings', () => {
    const bindings = { className: 'custom-text-class' };
    const { container } = render(<TextWidget config={baseConfig} bindings={bindings} />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveClass('custom-text-class');
  });

  it('applies all alignment options correctly', () => {
    const alignments: Array<'left' | 'center' | 'right' | 'justify'> = [
      'left',
      'center',
      'right',
      'justify',
    ];

    alignments.forEach(align => {
      const config: TextWidgetConfig = {
        ...baseConfig,
        align,
      };
      const { container } = render(<TextWidget config={config} />);
      const paragraph = container.querySelector('p');
      expect(paragraph).toHaveClass(`text-${align}`);
    });
  });

  it('applies all weight options correctly', () => {
    const weights: Array<'light' | 'normal' | 'medium' | 'semibold' | 'bold'> = [
      'light',
      'normal',
      'medium',
      'semibold',
      'bold',
    ];

    weights.forEach(weight => {
      const config: TextWidgetConfig = {
        ...baseConfig,
        weight,
      };
      const { container } = render(<TextWidget config={config} />);
      const paragraph = container.querySelector('p');
      expect(paragraph).toHaveClass(`font-${weight}`);
    });
  });

  it('logs warning when markdown is enabled', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const config: TextWidgetConfig = {
      ...baseConfig,
      markdown: true,
    };

    render(<TextWidget config={config} />);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'TextWidget: Markdown support not yet implemented. Rendering as plain text.'
    );

    consoleWarnSpy.mockRestore();
  });

  it('renders body variant with correct classes', () => {
    const config: TextWidgetConfig = {
      ...baseConfig,
      variant: 'body',
    };
    const { container } = render(<TextWidget config={config} />);
    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveClass('text-base', 'leading-relaxed');
  });
});
