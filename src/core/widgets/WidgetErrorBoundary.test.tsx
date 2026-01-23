/**
 * Widget Error Boundary Tests
 */

import { render, screen } from '@testing-library/react';
import { UnknownWidgetError, WidgetErrorBoundary } from './WidgetErrorBoundary';

// Component that throws an error
function ThrowErrorComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Success</div>;
}

describe('WidgetErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when no error', () => {
    render(
      <WidgetErrorBoundary widgetType="TestWidget" widgetId="test-1">
        <div>Test Content</div>
      </WidgetErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render error UI when error occurs', () => {
    render(
      <WidgetErrorBoundary widgetType="TestWidget" widgetId="test-1">
        <ThrowErrorComponent shouldThrow={true} />
      </WidgetErrorBoundary>
    );

    expect(screen.getByText('Widget Error')).toBeInTheDocument();
    expect(screen.getByText(/Failed to render widget "TestWidget"/)).toBeInTheDocument();
  });

  it('should display widget type and ID in error message', () => {
    render(
      <WidgetErrorBoundary widgetType="CustomWidget" widgetId="custom-123">
        <ThrowErrorComponent shouldThrow={true} />
      </WidgetErrorBoundary>
    );

    expect(screen.getByText(/Failed to render widget "CustomWidget"/)).toBeInTheDocument();
    expect(screen.getByText(/id: custom-123/)).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <WidgetErrorBoundary widgetType="TestWidget" widgetId="test-1" onError={onError}>
        <ThrowErrorComponent shouldThrow={true} />
      </WidgetErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    const [error] = onError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
  });

  it('should render custom fallback when provided', () => {
    const customFallback = () => <div>Custom Error UI</div>;

    render(
      <WidgetErrorBoundary widgetType="TestWidget" widgetId="test-1" fallback={customFallback}>
        <ThrowErrorComponent shouldThrow={true} />
      </WidgetErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });
});

describe('UnknownWidgetError', () => {
  it('should render unknown widget error', () => {
    render(<UnknownWidgetError type="UnknownWidget" />);

    expect(screen.getByText('Unknown Widget Type')).toBeInTheDocument();
    expect(screen.getByText(/Widget type "UnknownWidget" is not registered/)).toBeInTheDocument();
  });

  it('should display widget ID when provided', () => {
    render(<UnknownWidgetError type="UnknownWidget" id="unknown-1" />);

    expect(screen.getByText(/id: unknown-1/)).toBeInTheDocument();
  });

  it('should show available types in development mode', () => {
    render(
      <UnknownWidgetError type="UnknownWidget" availableTypes={['TextInput', 'Button', 'Card']} />
    );

    // Available types are in a details element
    const details = screen.getByText('Show available widget types');
    expect(details).toBeInTheDocument();
  });

  it('should not show available types when empty', () => {
    render(<UnknownWidgetError type="UnknownWidget" availableTypes={[]} />);

    expect(screen.queryByText('Show available widget types')).not.toBeInTheDocument();
  });
});
