import { Eye, Monitor, RefreshCw, Smartphone, Tablet } from 'lucide-react';
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { WidgetRenderer } from '@/core/renderer/WidgetRenderer';
import { cn } from '@/lib/utils';
import type { PageConfig } from '@/types/page.types';

/**
 * Render a widget config with its children
 */
function renderWidget(config: Record<string, unknown>): React.ReactNode {
  // Extract children and props from config, merge props into widget config
  const { children, props, ...rest } = config;
  // Merge props with the rest of config so widgets can access properties directly
  const widgetConfig = { ...rest, ...((props as Record<string, unknown>) || {}) };

  // Render children recursively if they exist
  const renderedChildren =
    children && Array.isArray(children)
      ? children.map((child: Record<string, unknown>) => renderWidget(child))
      : undefined;

  return (
    <WidgetRenderer
      key={config.id as string}
      config={widgetConfig}
      bindings={{}}
      events={{}}
      children={renderedChildren}
    />
  );
}

/**
 * PagePreviewTool - Preview pages with live configuration editing
 *
 * Features:
 * - Real-time page preview
 * - Configuration editor with hot reload
 * - Responsive preview modes (desktop, tablet, mobile)
 * - Error boundary with helpful messages
 * - Sample page configurations
 */
export function PagePreviewTool() {
  const [configText, setConfigText] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const previewModes = [
    { value: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
    { value: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
    { value: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' },
  ];

  const samplePages = {
    simple: `{
  "id": "preview-simple",
  "title": "Simple Page",
  "layout": "default",
  "widgets": [
    {
      "id": "header-section",
      "type": "Section",
      "props": {
        "title": "Welcome to OpenPortal",
        "description": "This is a preview of a simple page configuration"
      }
    },
    {
      "id": "content-card",
      "type": "Card",
      "props": {
        "title": "Sample Card",
        "description": "This card demonstrates the Card widget"
      }
    }
  ]
}`,
    dashboard: `{
  "id": "preview-dashboard",
  "title": "Dashboard",
  "layout": "dashboard",
  "widgets": [
    {
      "id": "metrics-section",
      "type": "Section",
      "props": {
        "title": "Key Metrics"
      },
      "children": [
        {
          "id": "kpi-users",
          "type": "KPI",
          "props": {
            "label": "Active Users",
            "value": 1234,
            "format": "number",
            "showTrend": true,
            "trend": {
              "direction": "up",
              "value": "+12.5%"
            }
          }
        },
        {
          "id": "kpi-revenue",
          "type": "KPI",
          "props": {
            "label": "Revenue",
            "value": 45600,
            "format": "currency",
            "formatOptions": {
              "decimals": 0
            },
            "showTrend": true,
            "trend": {
              "direction": "up",
              "value": "+8.3%"
            }
          }
        }
      ]
    }
  ]
}`,
    form: `{
  "id": "preview-form",
  "title": "Contact Form",
  "layout": "centered",
  "widgets": [
    {
      "id": "form-section",
      "type": "Section",
      "props": {
        "title": "Contact Us"
      },
      "children": [
        {
          "id": "name-input",
          "type": "TextInput",
          "props": {
            "label": "Name",
            "placeholder": "Enter your name",
            "required": true
          }
        },
        {
          "id": "email-input",
          "type": "TextInput",
          "props": {
            "label": "Email",
            "placeholder": "Enter your email",
            "required": true
          }
        }
      ]
    }
  ]
}`,
  };

  const handlePreview = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(configText);
      setPageConfig(parsed);
    } catch (error) {
      setParseError(`JSON Parse Error: ${(error as Error).message}`);
      setPageConfig(null);
    }
  };

  const loadSample = (key: keyof typeof samplePages) => {
    setConfigText(samplePages[key]);
    setParseError(null);

    // Auto-preview when loading sample
    try {
      const parsed = JSON.parse(samplePages[key]);
      setPageConfig(parsed);
    } catch (error) {
      setParseError(`JSON Parse Error: ${(error as Error).message}`);
    }
  };

  const _handleRefresh = () => {
    handlePreview();
  };

  // Auto-refresh when enabled
  const handleConfigChange = (value: string) => {
    setConfigText(value);
    if (autoRefresh) {
      try {
        const parsed = JSON.parse(value);
        setPageConfig(parsed);
        setParseError(null);
      } catch (_error) {
        // Silently fail during typing
      }
    }
  };

  const currentMode = previewModes.find(m => m.value === previewMode);
  const ModeIcon = currentMode?.icon || Monitor;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Page Preview</h2>
        <p className="text-muted-foreground">
          Preview pages with live configuration editing and hot reload
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1">
              <Label>Sample Configurations</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => loadSample('simple')}>
                  Simple Page
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadSample('dashboard')}>
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadSample('form')}>
                  Form
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={cn('mr-2 h-4 w-4', autoRefresh && 'animate-spin')} />
                Auto Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Editor</CardTitle>
            <CardDescription>Edit page configuration JSON</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-config">Page Configuration JSON</Label>
              <textarea
                id="page-config"
                className="h-96 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter page configuration JSON..."
                value={configText}
                onChange={e => handleConfigChange(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handlePreview} disabled={!configText}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setConfigText('');
                  setPageConfig(null);
                  setParseError(null);
                }}
              >
                Clear
              </Button>
            </div>

            {parseError && (
              <Alert variant="destructive">
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>Real-time page rendering</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {previewModes.map(mode => {
                  const Icon = mode.icon;
                  return (
                    <Button
                      key={mode.value}
                      variant={previewMode === mode.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode(mode.value as typeof previewMode)}
                      title={mode.label}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ModeIcon className="h-4 w-4" />
                  <span>{currentMode?.label} View</span>
                </div>
                {currentMode && currentMode.width !== '100%' && <span>{currentMode.width}</span>}
              </div>

              <div className="overflow-auto">
                <div
                  style={{
                    width: currentMode?.width,
                    margin: '0 auto',
                  }}
                  className="min-h-96 rounded-md border border-border bg-background p-4"
                >
                  {pageConfig ? (
                    <PreviewErrorBoundary>
                      <div className="space-y-4">
                        <div className="border-b pb-2">
                          <h3 className="text-lg font-semibold">{pageConfig.title}</h3>
                        </div>
                        {pageConfig.widgets?.map((widget: Record<string, unknown>) =>
                          renderWidget(widget)
                        )}
                      </div>
                    </PreviewErrorBoundary>
                  ) : (
                    <div className="flex h-96 items-center justify-center text-center">
                      <div>
                        <Eye className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Load a sample or enter configuration to preview
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Error Boundary Component for Preview
class PreviewErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            <p className="font-semibold">Preview Error</p>
            <p className="text-sm">{this.state.error?.message}</p>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
