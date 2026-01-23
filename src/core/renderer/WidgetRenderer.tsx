/**
 * Widget Renderer
 *
 * Dynamically renders widgets based on configuration from the widget registry.
 * Handles visibility, error boundaries, loading states, and lazy loading.
 *
 * Features:
 * - Dynamic widget lookup from registry
 * - Automatic error boundaries for each widget
 * - Visibility policy handling
 * - Loading states and Suspense boundaries
 * - Development mode debugging
 */

import { type ReactNode, Suspense } from 'react';
import { widgetRegistry } from '@/core/registry/WidgetRegistry';
import { UnknownWidgetError, WidgetErrorBoundary } from '@/core/widgets/WidgetErrorBoundary';
import type { WidgetConfig } from '@/types/page.types';
import type {
  BaseWidgetConfig,
  WidgetBindings,
  WidgetEvents,
  WidgetRendererOptions,
} from '@/types/widget.types';

/**
 * Widget renderer props
 */
export interface WidgetRendererProps {
  /** Widget configuration from backend */
  config: WidgetConfig;

  /** Data bindings (e.g., value, error, loading) */
  bindings?: WidgetBindings;

  /** Event handlers (e.g., onChange, onClick) */
  events?: WidgetEvents;

  /** Renderer options */
  options?: WidgetRendererOptions;

  /** Child widgets (for container widgets) */
  children?: ReactNode;
}

/**
 * Default loading component
 */
function DefaultLoadingFallback(): ReactNode {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="ml-2 text-sm text-muted-foreground">Loading widget...</span>
    </div>
  );
}

/**
 * Widget Renderer Component
 * Dynamically renders widgets from configuration
 */
export function WidgetRenderer({
  config,
  bindings,
  events,
  options = {},
  children,
}: WidgetRendererProps): ReactNode {
  const {
    errorBoundaries = true,
    debug = process.env.NODE_ENV !== 'production',
    fallbackComponent,
  } = options;

  // Handle visibility policy
  if (config.policy?.hide === true || config.policy?.show === false) {
    if (debug) {
      console.log(
        `[WidgetRenderer] Widget "${config.type}" (id: ${config.id}) is hidden by policy`
      );
    }
    return null;
  }

  // Get widget component from registry
  const WidgetComponent = widgetRegistry.get(config.type);

  // Handle unknown widget type
  if (!WidgetComponent) {
    if (debug) {
      console.warn(`[WidgetRenderer] Widget type "${config.type}" not found in registry`);
    }

    // Use fallback component if provided
    if (fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent config={config as BaseWidgetConfig} />;
    }

    // Show unknown widget error
    return (
      <UnknownWidgetError
        type={config.type}
        id={config.id}
        availableTypes={widgetRegistry.getTypes()}
      />
    );
  }

  // Log rendering in debug mode
  if (debug) {
    console.log(`[WidgetRenderer] Rendering widget "${config.type}" (id: ${config.id})`);
  }

  // Build widget props
  const widgetProps = {
    config: config as BaseWidgetConfig,
    bindings,
    events,
    children,
  };

  // Render widget with optional error boundary
  const widgetElement = <WidgetComponent {...widgetProps} />;

  // Check if widget supports lazy loading
  const metadata = widgetRegistry.getMetadata(config.type);
  const isLazy = metadata?.lazy || false;

  // Wrap with Suspense for lazy widgets
  const suspenseWrapped = isLazy ? (
    <Suspense fallback={<DefaultLoadingFallback />}>{widgetElement}</Suspense>
  ) : (
    widgetElement
  );

  // Wrap with error boundary
  if (errorBoundaries) {
    return (
      <WidgetErrorBoundary widgetType={config.type} widgetId={config.id}>
        {suspenseWrapped}
      </WidgetErrorBoundary>
    );
  }

  return suspenseWrapped;
}

/**
 * Render multiple widgets from configurations
 */
export interface WidgetListRendererProps {
  /** Array of widget configurations */
  configs: WidgetConfig[];

  /** Data bindings for all widgets */
  bindings?: Record<string, WidgetBindings>;

  /** Event handlers for all widgets */
  events?: Record<string, WidgetEvents>;

  /** Renderer options */
  options?: WidgetRendererOptions;

  /** Wrapper component for each widget */
  wrapper?: (widget: ReactNode, config: WidgetConfig) => ReactNode;
}

/**
 * Widget List Renderer Component
 * Renders multiple widgets from an array of configurations
 */
export function WidgetListRenderer({
  configs,
  bindings = {},
  events = {},
  options,
  wrapper,
}: WidgetListRendererProps): ReactNode {
  return (
    <>
      {configs.map(config => {
        const widgetBindings = bindings[config.id];
        const widgetEvents = events[config.id];

        const widget = (
          <WidgetRenderer
            key={config.id}
            config={config}
            bindings={widgetBindings}
            events={widgetEvents}
            options={options}
          />
        );

        // Apply wrapper if provided
        if (wrapper) {
          return wrapper(widget, config);
        }

        return widget;
      })}
    </>
  );
}

/**
 * Render nested widgets (for container widgets)
 */
export interface NestedWidgetRendererProps {
  /** Child widget configurations */
  configs?: WidgetConfig[];

  /** Data bindings for child widgets */
  bindings?: Record<string, WidgetBindings>;

  /** Event handlers for child widgets */
  events?: Record<string, WidgetEvents>;

  /** Renderer options */
  options?: WidgetRendererOptions;
}

/**
 * Nested Widget Renderer Component
 * Renders child widgets for container widgets (e.g., Card, Section)
 */
export function NestedWidgetRenderer({
  configs,
  bindings,
  events,
  options,
}: NestedWidgetRendererProps): ReactNode {
  if (!configs || configs.length === 0) {
    return null;
  }

  return (
    <WidgetListRenderer configs={configs} bindings={bindings} events={events} options={options} />
  );
}
