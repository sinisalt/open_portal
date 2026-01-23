/**
 * Widget Renderer Tests
 */

import { render, screen } from '@testing-library/react';
import { widgetRegistry } from '@/core/registry/WidgetRegistry';
import type { WidgetConfig } from '@/types/page.types';
import type { WidgetProps } from '@/types/widget.types';
import { NestedWidgetRenderer, WidgetListRenderer, WidgetRenderer } from './WidgetRenderer';

// Mock widgets for testing
function TestWidget({ config, bindings }: WidgetProps) {
  return (
    <div data-testid={config.id}>
      {config.type} - {bindings?.value as string}
    </div>
  );
}

function ContainerWidget({ config, children }: WidgetProps) {
  return (
    <div data-testid={config.id}>
      <h2>{config.type}</h2>
      {children}
    </div>
  );
}

describe('WidgetRenderer', () => {
  beforeEach(() => {
    widgetRegistry.clear();
  });

  describe('basic rendering', () => {
    it('should render widget from registry', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      const config: WidgetConfig = {
        id: 'test-1',
        type: 'TestWidget',
      };

      render(<WidgetRenderer config={config} />);

      expect(screen.getByTestId('test-1')).toBeInTheDocument();
      expect(screen.getByText('TestWidget -')).toBeInTheDocument();
    });

    it('should pass bindings to widget', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      const config: WidgetConfig = {
        id: 'test-1',
        type: 'TestWidget',
      };

      const bindings = { value: 'Test Value' };

      render(<WidgetRenderer config={config} bindings={bindings} />);

      expect(screen.getByText('TestWidget - Test Value')).toBeInTheDocument();
    });

    it('should pass events to widget', () => {
      const onChange = jest.fn();

      function InteractiveWidget({ events }: WidgetProps) {
        return (
          <button type="button" onClick={() => events?.onChange?.('clicked')}>
            Click me
          </button>
        );
      }

      widgetRegistry.register('InteractiveWidget', InteractiveWidget);

      const config: WidgetConfig = {
        id: 'test-1',
        type: 'InteractiveWidget',
      };

      render(<WidgetRenderer config={config} events={{ onChange }} />);

      const button = screen.getByText('Click me');
      button.click();

      expect(onChange).toHaveBeenCalledWith('clicked');
    });
  });

  describe('visibility policy', () => {
    it('should not render when policy.hide is true', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      const config: WidgetConfig = {
        id: 'test-1',
        type: 'TestWidget',
        policy: { hide: true },
      };

      render(<WidgetRenderer config={config} />);

      expect(screen.queryByTestId('test-1')).not.toBeInTheDocument();
    });

    it('should not render when policy.show is false', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      const config: WidgetConfig = {
        id: 'test-1',
        type: 'TestWidget',
        policy: { show: false },
      };

      render(<WidgetRenderer config={config} />);

      expect(screen.queryByTestId('test-1')).not.toBeInTheDocument();
    });

    it('should render when policy.show is true', () => {
      widgetRegistry.register('TestWidget', TestWidget);

      const config: WidgetConfig = {
        id: 'test-1',
        type: 'TestWidget',
        policy: { show: true },
      };

      render(<WidgetRenderer config={config} />);

      expect(screen.getByTestId('test-1')).toBeInTheDocument();
    });
  });

  describe('unknown widget handling', () => {
    it('should show unknown widget error for unregistered type', () => {
      const config: WidgetConfig = {
        id: 'test-1',
        type: 'UnknownWidget',
      };

      render(<WidgetRenderer config={config} />);

      expect(screen.getByText('Unknown Widget Type')).toBeInTheDocument();
      expect(screen.getByText(/Widget type "UnknownWidget" is not registered/)).toBeInTheDocument();
    });

    it('should use fallback component when provided', () => {
      function FallbackWidget({ config }: WidgetProps) {
        return <div>Fallback for {config.type}</div>;
      }

      const config: WidgetConfig = {
        id: 'test-1',
        type: 'UnknownWidget',
      };

      render(<WidgetRenderer config={config} options={{ fallbackComponent: FallbackWidget }} />);

      expect(screen.getByText('Fallback for UnknownWidget')).toBeInTheDocument();
    });
  });

  describe('error boundaries', () => {
    // Suppress console.error for these tests
    const originalError = console.error;
    beforeAll(() => {
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalError;
    });

    it('should wrap widget in error boundary by default', () => {
      function ErrorWidget() {
        throw new Error('Test error');
      }

      widgetRegistry.register('ErrorWidget', ErrorWidget);

      const config: WidgetConfig = {
        id: 'test-1',
        type: 'ErrorWidget',
      };

      render(<WidgetRenderer config={config} />);

      expect(screen.getByText('Widget Error')).toBeInTheDocument();
    });

    it('should not wrap widget in error boundary when disabled', () => {
      function ErrorWidget() {
        throw new Error('Test error');
      }

      widgetRegistry.register('ErrorWidget', ErrorWidget);

      const config: WidgetConfig = {
        id: 'test-1',
        type: 'ErrorWidget',
      };

      expect(() => {
        render(<WidgetRenderer config={config} options={{ errorBoundaries: false }} />);
      }).toThrow('Test error');
    });
  });

  describe('children rendering', () => {
    it('should pass children to widget', () => {
      widgetRegistry.register('ContainerWidget', ContainerWidget);

      const config: WidgetConfig = {
        id: 'container-1',
        type: 'ContainerWidget',
      };

      render(
        <WidgetRenderer config={config}>
          <div>Child content</div>
        </WidgetRenderer>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });
});

describe('WidgetListRenderer', () => {
  beforeEach(() => {
    widgetRegistry.clear();
    widgetRegistry.register('TestWidget', TestWidget);
  });

  it('should render multiple widgets', () => {
    const configs: WidgetConfig[] = [
      { id: 'test-1', type: 'TestWidget' },
      { id: 'test-2', type: 'TestWidget' },
      { id: 'test-3', type: 'TestWidget' },
    ];

    render(<WidgetListRenderer configs={configs} />);

    expect(screen.getByTestId('test-1')).toBeInTheDocument();
    expect(screen.getByTestId('test-2')).toBeInTheDocument();
    expect(screen.getByTestId('test-3')).toBeInTheDocument();
  });

  it('should pass bindings to correct widgets', () => {
    const configs: WidgetConfig[] = [
      { id: 'test-1', type: 'TestWidget' },
      { id: 'test-2', type: 'TestWidget' },
    ];

    const bindings = {
      'test-1': { value: 'Value 1' },
      'test-2': { value: 'Value 2' },
    };

    render(<WidgetListRenderer configs={configs} bindings={bindings} />);

    expect(screen.getByText('TestWidget - Value 1')).toBeInTheDocument();
    expect(screen.getByText('TestWidget - Value 2')).toBeInTheDocument();
  });

  it('should apply wrapper to each widget', () => {
    const configs: WidgetConfig[] = [
      { id: 'test-1', type: 'TestWidget' },
      { id: 'test-2', type: 'TestWidget' },
    ];

    const wrapper = (widget: React.ReactNode, config: WidgetConfig) => (
      <div key={config.id} className="wrapper">
        {widget}
      </div>
    );

    const { container } = render(<WidgetListRenderer configs={configs} wrapper={wrapper} />);

    const wrappers = container.querySelectorAll('.wrapper');
    expect(wrappers).toHaveLength(2);
  });

  it('should render empty when no configs', () => {
    const { container } = render(<WidgetListRenderer configs={[]} />);

    expect(container.firstChild).toBeNull();
  });
});

describe('NestedWidgetRenderer', () => {
  beforeEach(() => {
    widgetRegistry.clear();
    widgetRegistry.register('TestWidget', TestWidget);
  });

  it('should render child widgets', () => {
    const widgetChildren: WidgetConfig[] = [
      { id: 'child-1', type: 'TestWidget' },
      { id: 'child-2', type: 'TestWidget' },
    ];

    render(<NestedWidgetRenderer configs={widgetChildren} />);

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should render nothing when no children', () => {
    const { container } = render(<NestedWidgetRenderer />);

    expect(container.firstChild).toBeNull();
  });

  it('should pass bindings to child widgets', () => {
    const widgetChildren: WidgetConfig[] = [{ id: 'child-1', type: 'TestWidget' }];

    const bindings = {
      'child-1': { value: 'Child Value' },
    };

    render(<NestedWidgetRenderer configs={widgetChildren} bindings={bindings} />);

    expect(screen.getByText('TestWidget - Child Value')).toBeInTheDocument();
  });
});
