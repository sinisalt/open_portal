/**
 * Widget Error Boundary
 *
 * Catches and displays errors that occur during widget rendering.
 * Each widget instance is wrapped in its own error boundary for isolation.
 *
 * Features:
 * - Prevents widget errors from crashing the entire page
 * - Shows user-friendly error messages
 * - Displays debug information in development mode
 * - Logs errors for monitoring
 */

import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

/**
 * Error boundary props
 */
export interface WidgetErrorBoundaryProps {
  /** Widget type for error context */
  widgetType: string;

  /** Widget ID for error context */
  widgetId: string;

  /** Children to render */
  children: ReactNode;

  /** Custom fallback component */
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;

  /** Error handler callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error boundary state
 */
interface WidgetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Widget Error Boundary Component
 * React error boundary for widget rendering errors
 */
export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<WidgetErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { widgetType, widgetId, onError } = this.props;

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[WidgetErrorBoundary] Error in widget "${widgetType}" (id: ${widgetId}):`,
        error,
        errorInfo
      );
    }

    // Call error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Store error info in state
    this.setState({ errorInfo });

    // TODO: Send to error monitoring service (e.g., Sentry)
  }

  /**
   * Reset error state
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Render error UI or children
   */
  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, widgetType, widgetId } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback && errorInfo) {
        return fallback(error, errorInfo);
      }

      // Default error UI
      return (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Error</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-destructive">Widget Error</h3>
              <p className="mt-1 text-sm text-destructive/80">
                Failed to render widget "{widgetType}" (id: {widgetId})
              </p>
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-2">
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer font-medium hover:underline">
                      Show error details
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <strong>Error:</strong>
                        <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                          {error.message}
                        </pre>
                      </div>
                      {error.stack && (
                        <div>
                          <strong>Stack trace:</strong>
                          <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      {errorInfo?.componentStack && (
                        <div>
                          <strong>Component stack:</strong>
                          <pre className="mt-1 overflow-auto rounded bg-muted p-2">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
              {process.env.NODE_ENV === 'production' && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Please contact support if this problem persists.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Unknown Widget Error Display
 * Shows when a widget type is not found in the registry
 */
export interface UnknownWidgetErrorProps {
  /** Widget type that was not found */
  type: string;

  /** Widget ID for context */
  id?: string;

  /** Available widget types */
  availableTypes?: string[];
}

export function UnknownWidgetError({
  type,
  id,
  availableTypes,
}: UnknownWidgetErrorProps): ReactNode {
  return (
    <div className="rounded-lg border border-warning bg-warning/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-warning"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Warning</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-warning-foreground">Unknown Widget Type</h3>
          <p className="mt-1 text-sm text-warning-foreground/80">
            Widget type "{type}" is not registered
            {id && ` (id: ${id})`}
          </p>
          {process.env.NODE_ENV !== 'production' && availableTypes && availableTypes.length > 0 && (
            <details className="mt-2 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium hover:underline">
                Show available widget types
              </summary>
              <ul className="mt-1 list-inside list-disc">
                {availableTypes.map(availableType => (
                  <li key={availableType}>{availableType}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
