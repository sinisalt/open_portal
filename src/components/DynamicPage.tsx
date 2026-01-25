/**
 * Dynamic Page Component
 *
 * Renders pages dynamically based on backend configuration.
 * Uses the usePageConfig hook to load page data and the WidgetRenderer
 * to render the page's widgets.
 *
 * Features:
 * - Automatic page configuration loading with route resolution
 * - Loading states
 * - Error handling with proper 404 display
 * - Widget rendering
 */

import { Link, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { env } from '@/config/env';
import { WidgetRenderer } from '@/core/renderer/WidgetRenderer';
import { usePageConfig } from '@/hooks/usePageConfig';
import { httpClient } from '@/services/httpClient';
import type { WidgetConfig } from '@/types/page.types';

const API_BASE_URL = env.VITE_API_URL || 'http://localhost:4000/api';

interface DynamicPageProps {
  /** Optional page ID (if not provided, will use route resolution) */
  pageId?: string;
}

/**
 * Dynamic Page Component
 * Loads and renders a page from backend configuration
 */
export function DynamicPage({ pageId: propPageId }: DynamicPageProps) {
  const location = useLocation();
  const [resolvedPageId, setResolvedPageId] = useState<string | null>(propPageId || null);
  const [resolving, setResolving] = useState(!propPageId);
  const [resolutionError, setResolutionError] = useState<Error | null>(null);

  // Resolve route to pageId if not provided
  useEffect(() => {
    if (propPageId) {
      setResolvedPageId(propPageId);
      setResolving(false);
      return;
    }

    async function resolveRoute() {
      try {
        const path = location.pathname;
        const url = `${API_BASE_URL}/ui/routes/resolve?path=${encodeURIComponent(path)}`;
        const response = await httpClient(url, { method: 'GET' });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.pageId) {
          setResolvedPageId(data.pageId);
        } else {
          throw new Error('No pageId returned from route resolver');
        }
      } catch (error) {
        console.error('Route resolution failed:', error);
        setResolutionError(error as Error);
      } finally {
        setResolving(false);
      }
    }

    void resolveRoute();
  }, [location.pathname, propPageId]);

  // Load page configuration (only if we have a resolved pageId)
  const { config, loading, error } = usePageConfig(resolvedPageId || '', {
    skip: !resolvedPageId,
  });

  // Show loading while resolving route
  if (resolving) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {/* biome-ignore lint/a11y/useSemanticElements: Spinner pattern requires div for styling */}
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-4 text-muted-foreground">Resolving route...</p>
        </div>
      </div>
    );
  }

  // Show 404 if route resolution failed
  if (resolutionError || (!resolvedPageId && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <p className="text-xl mb-8">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8 max-w-md text-center">
          The page you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link to="/" className="text-primary hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {/* biome-ignore lint/a11y/useSemanticElements: Spinner pattern requires div for styling */}
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-4 text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Page</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          {error.statusCode === 404 && (
            <p className="text-sm text-muted-foreground">
              The page you're looking for doesn't exist or you don't have permission to view it.
            </p>
          )}
          {error.statusCode === 403 && (
            <p className="text-sm text-muted-foreground">
              You don't have permission to access this page.
            </p>
          )}
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // No configuration loaded
  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">No page configuration available</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Render page layout (root widget)
  return (
    <div className="dynamic-page">
      <WidgetRenderer config={config.layout as WidgetConfig} />
    </div>
  );
}
