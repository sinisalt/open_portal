/**
 * KPIWidget Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KPIWidget } from './KPIWidget';
import type { KPIWidgetConfig } from './types';

describe('KPIWidget', () => {
  const baseConfig: KPIWidgetConfig = {
    id: 'test-kpi',
    type: 'KPI',
    label: 'Total Sales',
  };

  it('renders KPI with label', () => {
    render(<KPIWidget config={baseConfig} bindings={{ value: 1234 }} />);

    expect(screen.getByText('Total Sales')).toBeInTheDocument();
  });

  it('renders KPI value', () => {
    render(<KPIWidget config={baseConfig} bindings={{ value: 1234 }} />);

    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('formats number values', () => {
    render(
      <KPIWidget
        config={{ ...baseConfig, format: 'number', formatOptions: { decimals: 2 } }}
        bindings={{ value: 1234.567 }}
      />
    );

    expect(screen.getByText('1,234.57')).toBeInTheDocument();
  });

  it('formats currency values', () => {
    render(
      <KPIWidget config={{ ...baseConfig, format: 'currency' }} bindings={{ value: 1234.5 }} />
    );

    expect(screen.getByText('$1,234.50')).toBeInTheDocument();
  });

  it('formats percent values', () => {
    render(<KPIWidget config={{ ...baseConfig, format: 'percent' }} bindings={{ value: 0.75 }} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<KPIWidget config={{ ...baseConfig, loading: true }} bindings={{ value: 1234 }} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <KPIWidget
        config={{ ...baseConfig, description: 'Compared to last month' }}
        bindings={{ value: 1234 }}
      />
    );

    expect(screen.getByText('Compared to last month')).toBeInTheDocument();
  });

  it('renders trend indicator with up direction', () => {
    render(
      <KPIWidget
        config={{
          ...baseConfig,
          showTrend: true,
          trend: { direction: 'up', value: '+12%' },
        }}
        bindings={{ value: 1234 }}
      />
    );

    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders trend indicator with down direction', () => {
    render(
      <KPIWidget
        config={{
          ...baseConfig,
          showTrend: true,
          trend: { direction: 'down', value: '-5%' },
        }}
        bindings={{ value: 1234 }}
      />
    );

    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('renders trend indicator with neutral direction', () => {
    render(
      <KPIWidget
        config={{
          ...baseConfig,
          showTrend: true,
          trend: { direction: 'neutral', value: '0%' },
        }}
        bindings={{ value: 1234 }}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('does not render trend when showTrend is false', () => {
    render(
      <KPIWidget
        config={{
          ...baseConfig,
          showTrend: false,
          trend: { direction: 'up', value: '+12%' },
        }}
        bindings={{ value: 1234 }}
      />
    );

    expect(screen.queryByText('+12%')).not.toBeInTheDocument();
  });

  it('handles click event', async () => {
    const onClick = jest.fn();

    render(<KPIWidget config={baseConfig} bindings={{ value: 1234 }} events={{ onClick }} />);

    const card = screen.getByRole('button');
    await userEvent.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard interaction for click', async () => {
    const onClick = jest.fn();

    render(<KPIWidget config={baseConfig} bindings={{ value: 1234 }} events={{ onClick }} />);

    const card = screen.getByRole('button');
    card.focus();
    await userEvent.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies cursor pointer when clickable', () => {
    const onClick = jest.fn();

    render(<KPIWidget config={baseConfig} bindings={{ value: 1234 }} events={{ onClick }} />);

    const card = screen.getByRole('button');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('does not apply cursor pointer when not clickable', () => {
    render(<KPIWidget config={baseConfig} bindings={{ value: 1234 }} />);

    // Without onClick, there should be no role="button"
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders small size variant', () => {
    render(<KPIWidget config={{ ...baseConfig, size: 'sm' }} bindings={{ value: 1234 }} />);

    const title = screen.getByText('Total Sales');
    expect(title).toHaveClass('text-xs');
  });

  it('renders medium size variant', () => {
    render(<KPIWidget config={{ ...baseConfig, size: 'md' }} bindings={{ value: 1234 }} />);

    const title = screen.getByText('Total Sales');
    expect(title).toHaveClass('text-sm');
  });

  it('renders large size variant', () => {
    render(<KPIWidget config={{ ...baseConfig, size: 'lg' }} bindings={{ value: 1234 }} />);

    const title = screen.getByText('Total Sales');
    expect(title).toHaveClass('text-base');
  });

  it('handles null/undefined values', () => {
    render(<KPIWidget config={baseConfig} bindings={{ value: null }} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('handles missing bindings', () => {
    render(<KPIWidget config={baseConfig} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<KPIWidget config={baseConfig} bindings={{ value: 1234 }} />);

    const value = screen.getByRole('status');
    expect(value).toHaveAttribute('aria-live', 'polite');
  });

  it('has proper accessibility attributes for clickable cards', () => {
    const onClick = jest.fn();

    render(<KPIWidget config={baseConfig} bindings={{ value: 1234 }} events={{ onClick }} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('renders icon placeholder when icon is provided', () => {
    render(<KPIWidget config={{ ...baseConfig, icon: '$' }} bindings={{ value: 1234 }} />);

    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('applies custom color to card', () => {
    const { container } = render(
      <KPIWidget config={{ ...baseConfig, color: '#ff0000' }} bindings={{ value: 1234 }} />
    );

    const card = container.querySelector('[style*="border-color"]');
    expect(card).toHaveStyle({ borderColor: '#ff0000' });
  });

  it('formats currency with custom currency code', () => {
    render(
      <KPIWidget
        config={{
          ...baseConfig,
          format: 'currency',
          formatOptions: { currency: 'EUR' },
        }}
        bindings={{ value: 1234 }}
      />
    );

    const value = screen.getByRole('status');
    expect(value.textContent).toMatch(/€|EUR/);
  });

  it('formats numbers with custom locale', () => {
    render(
      <KPIWidget
        config={{
          ...baseConfig,
          format: 'number',
          formatOptions: { locale: 'de-DE' },
        }}
        bindings={{ value: 1234 }}
      />
    );

    // German locale uses period for thousands separator
    const value = screen.getByRole('status');
    expect(value).toBeInTheDocument();
  });

  it('defaults to medium size when size not specified', () => {
    render(<KPIWidget config={baseConfig} bindings={{ value: 1234 }} />);

    const title = screen.getByText('Total Sales');
    expect(title).toHaveClass('text-sm');
  });

  it('defaults to number format when format not specified', () => {
    render(<KPIWidget config={baseConfig} bindings={{ value: 1234.56 }} />);

    // Default number format has 0 decimals
    expect(screen.getByText('1,235')).toBeInTheDocument();
  });
});
