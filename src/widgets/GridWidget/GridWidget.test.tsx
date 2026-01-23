/**
 * GridWidget Tests
 */

import { render } from '@testing-library/react';
import { GridWidget } from './GridWidget';
import type { GridWidgetConfig } from './types';

describe('GridWidget', () => {
  const baseConfig: GridWidgetConfig = {
    id: 'test-grid',
    type: 'Grid',
  };

  it('renders grid container', () => {
    const { container } = render(<GridWidget config={baseConfig} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid');
  });

  it('renders children', () => {
    const { container } = render(
      <GridWidget config={baseConfig}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </GridWidget>
    );

    expect(container.textContent).toContain('Item 1');
    expect(container.textContent).toContain('Item 2');
    expect(container.textContent).toContain('Item 3');
  });

  it('renders items from bindings', () => {
    const items = [<div key="1">Bound Item 1</div>, <div key="2">Bound Item 2</div>];

    const { container } = render(<GridWidget config={baseConfig} bindings={{ items }} />);

    expect(container.textContent).toContain('Bound Item 1');
    expect(container.textContent).toContain('Bound Item 2');
  });

  it('applies default 12 columns', () => {
    const { container } = render(<GridWidget config={baseConfig} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toMatch(/grid-cols-12/);
  });

  it('applies custom column count', () => {
    const config: GridWidgetConfig = {
      ...baseConfig,
      columns: 4,
    };

    const { container } = render(<GridWidget config={config} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toMatch(/grid-cols-4/);
  });

  it('applies gap classes', () => {
    const { container, rerender } = render(<GridWidget config={{ ...baseConfig, gap: 'none' }} />);

    expect(container.firstChild).toHaveClass('gap-0');

    rerender(<GridWidget config={{ ...baseConfig, gap: 'xs' }} />);
    expect(container.firstChild).toHaveClass('gap-1');

    rerender(<GridWidget config={{ ...baseConfig, gap: 'sm' }} />);
    expect(container.firstChild).toHaveClass('gap-2');

    rerender(<GridWidget config={{ ...baseConfig, gap: 'md' }} />);
    expect(container.firstChild).toHaveClass('gap-4');

    rerender(<GridWidget config={{ ...baseConfig, gap: 'lg' }} />);
    expect(container.firstChild).toHaveClass('gap-6');

    rerender(<GridWidget config={{ ...baseConfig, gap: 'xl' }} />);
    expect(container.firstChild).toHaveClass('gap-8');
  });

  it('applies responsive column configuration', () => {
    const config: GridWidgetConfig = {
      ...baseConfig,
      responsive: {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 6,
      },
    };

    const { container } = render(<GridWidget config={config} />);
    const grid = container.firstChild as HTMLElement;

    expect(grid.className).toMatch(/grid-cols-1/); // Base
    expect(grid.className).toMatch(/sm:grid-cols-2/);
    expect(grid.className).toMatch(/md:grid-cols-3/);
    expect(grid.className).toMatch(/lg:grid-cols-4/);
    expect(grid.className).toMatch(/xl:grid-cols-6/);
  });

  it('applies partial responsive configuration', () => {
    const config: GridWidgetConfig = {
      ...baseConfig,
      responsive: {
        xs: 1,
        md: 3,
      },
    };

    const { container } = render(<GridWidget config={config} />);
    const grid = container.firstChild as HTMLElement;

    expect(grid.className).toMatch(/grid-cols-1/);
    expect(grid.className).toMatch(/md:grid-cols-3/);
  });

  it('handles all column counts from 1-12', () => {
    for (let cols = 1; cols <= 12; cols++) {
      const config: GridWidgetConfig = {
        ...baseConfig,
        columns: cols,
      };

      const { container } = render(<GridWidget config={config} />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toMatch(new RegExp(`grid-cols-${cols}`));
    }
  });

  it('applies custom className from bindings', () => {
    const { container } = render(
      <GridWidget config={baseConfig} bindings={{ className: 'custom-grid-class' }} />
    );

    expect(container.firstChild).toHaveClass('custom-grid-class');
  });

  it('renders with default gap when not specified', () => {
    const { container } = render(<GridWidget config={baseConfig} />);
    expect(container.firstChild).toHaveClass('gap-4'); // md is default
  });
});
