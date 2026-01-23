/**
 * PageWidget Tests
 */

import { render, screen } from '@testing-library/react';
import { PageWidget } from './PageWidget';
import type { PageWidgetConfig } from './types';

describe('PageWidget', () => {
  const baseConfig: PageWidgetConfig = {
    id: 'test-page',
    type: 'Page',
  };

  it('renders page container with semantic main element', () => {
    const { container } = render(<PageWidget config={baseConfig} />);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('renders title in header', () => {
    const config: PageWidgetConfig = {
      ...baseConfig,
      title: 'Test Page Title',
    };

    render(<PageWidget config={config} />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(screen.getByText('Test Page Title')).toBeInTheDocument();
  });

  it('renders description in header', () => {
    const config: PageWidgetConfig = {
      ...baseConfig,
      title: 'Test Page',
      description: 'This is a test page description',
    };

    render(<PageWidget config={config} />);

    expect(screen.getByText('This is a test page description')).toBeInTheDocument();
  });

  it('renders content from children', () => {
    render(
      <PageWidget config={baseConfig}>
        <div>Page content</div>
      </PageWidget>
    );

    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('renders content from bindings', () => {
    render(<PageWidget config={baseConfig} bindings={{ content: <div>Bound content</div> }} />);

    expect(screen.getByText('Bound content')).toBeInTheDocument();
  });

  it('renders footer when provided in bindings', () => {
    render(<PageWidget config={baseConfig} bindings={{ footer: <div>Footer content</div> }} />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('calls onLoad event when mounted', () => {
    const onLoad = jest.fn();

    render(<PageWidget config={baseConfig} events={{ onLoad }} />);

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('applies padding classes', () => {
    const { container, rerender } = render(
      <PageWidget config={{ ...baseConfig, padding: 'none' }} />
    );

    const main = container.querySelector('main');
    expect(main).not.toHaveClass('p-4');
    expect(main).not.toHaveClass('p-6');

    rerender(<PageWidget config={{ ...baseConfig, padding: 'lg' }} />);
    expect(container.querySelector('main')).toHaveClass('p-8');
  });

  it('applies theme styles', () => {
    const config: PageWidgetConfig = {
      ...baseConfig,
      theme: {
        background: '#f0f0f0',
        textColor: '#333333',
      },
    };

    const { container } = render(<PageWidget config={config} />);

    const page = container.firstChild as HTMLElement;
    expect(page.style.backgroundColor).toBe('rgb(240, 240, 240)');
    expect(page.style.color).toBe('rgb(51, 51, 51)');
  });

  it('has proper accessibility attributes', () => {
    const config: PageWidgetConfig = {
      ...baseConfig,
      title: 'Accessible Page',
    };

    render(<PageWidget config={config} />);

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Accessible Page');
  });

  it('renders without header when no title or description', () => {
    const { container } = render(<PageWidget config={baseConfig} />);
    const header = container.querySelector('header');
    expect(header).not.toBeInTheDocument();
  });

  it('renders without footer when no footer binding', () => {
    const { container } = render(<PageWidget config={baseConfig} />);
    const footer = container.querySelector('footer');
    expect(footer).not.toBeInTheDocument();
  });
});
