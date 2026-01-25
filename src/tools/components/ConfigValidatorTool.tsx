import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * ConfigValidatorTool - Validate OpenPortal configurations
 *
 * Features:
 * - Multi-type configuration support (page, route, branding, menu)
 * - Real-time validation with error highlighting
 * - Multiple severity levels (error, warning, info)
 * - Schema reference panel
 * - Integration with backend validation API
 */
export function ConfigValidatorTool() {
  const [configType, setConfigType] = useState<string>('page');
  const [configText, setConfigText] = useState('');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: Array<{
      message: string;
      path?: string;
      severity: 'error' | 'warning' | 'info';
    }>;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const configTypes = [
    { value: 'page', label: 'Page Configuration' },
    { value: 'route', label: 'Route Configuration' },
    { value: 'branding', label: 'Branding Configuration' },
    { value: 'menu', label: 'Menu Configuration' },
  ];

  const sampleConfigs = {
    page: `{
  "id": "sample-page",
  "title": "Sample Page",
  "widgets": [
    {
      "id": "header",
      "type": "Section",
      "props": {
        "title": "Welcome"
      }
    }
  ]
}`,
    route: `{
  "path": "/sample",
  "pageId": "sample-page",
  "title": "Sample Route",
  "requiresAuth": true
}`,
    branding: `{
  "tenantId": "default",
  "colors": {
    "primary": "#0066cc",
    "secondary": "#6c757d"
  },
  "logo": "/logo.svg"
}`,
    menu: `{
  "id": "main-menu",
  "items": [
    {
      "id": "home",
      "label": "Home",
      "path": "/",
      "icon": "Home"
    }
  ]
}`,
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Parse JSON first
      let parsedConfig: any;
      try {
        parsedConfig = JSON.parse(configText);
      } catch (parseError) {
        setValidationResult({
          valid: false,
          errors: [
            {
              message: `JSON Parse Error: ${(parseError as Error).message}`,
              severity: 'error',
            },
          ],
        });
        setIsValidating(false);
        return;
      }

      // Call backend validation API
      const response = await fetch('/api/config/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: configType,
          config: parsedConfig,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setValidationResult(result);
      } else {
        // If API not available, do basic validation
        const basicValidation = performBasicValidation(parsedConfig, configType);
        setValidationResult(basicValidation);
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [
          {
            message: `Validation Error: ${(error as Error).message}`,
            severity: 'error',
          },
        ],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const performBasicValidation = (config: any, type: string) => {
    const errors: Array<{
      message: string;
      path?: string;
      severity: 'error' | 'warning' | 'info';
    }> = [];

    // Basic validation rules
    switch (type) {
      case 'page':
        if (!config.id)
          errors.push({ message: 'Missing required field: id', path: 'id', severity: 'error' });
        if (!config.title)
          errors.push({
            message: 'Missing required field: title',
            path: 'title',
            severity: 'error',
          });
        if (!config.widgets || !Array.isArray(config.widgets)) {
          errors.push({
            message: 'Missing or invalid field: widgets',
            path: 'widgets',
            severity: 'error',
          });
        }
        break;
      case 'route':
        if (!config.path)
          errors.push({ message: 'Missing required field: path', path: 'path', severity: 'error' });
        if (!config.pageId)
          errors.push({
            message: 'Missing required field: pageId',
            path: 'pageId',
            severity: 'error',
          });
        break;
      case 'branding':
        if (!config.tenantId)
          errors.push({
            message: 'Missing required field: tenantId',
            path: 'tenantId',
            severity: 'error',
          });
        if (!config.colors)
          errors.push({
            message: 'Missing required field: colors',
            path: 'colors',
            severity: 'warning',
          });
        break;
      case 'menu':
        if (!config.id)
          errors.push({ message: 'Missing required field: id', path: 'id', severity: 'error' });
        if (!config.items || !Array.isArray(config.items)) {
          errors.push({
            message: 'Missing or invalid field: items',
            path: 'items',
            severity: 'error',
          });
        }
        break;
    }

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
    };
  };

  const loadSample = () => {
    setConfigText(sampleConfigs[configType as keyof typeof sampleConfigs] || '');
    setValidationResult(null);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Configuration Validator</h2>
        <p className="text-muted-foreground">
          Validate OpenPortal configurations against schema rules
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Editor</CardTitle>
            <CardDescription>Enter or paste your configuration JSON</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="config-type">Configuration Type</Label>
              <Select value={configType} onValueChange={setConfigType}>
                <SelectTrigger id="config-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {configTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="config-text">Configuration JSON</Label>
              <textarea
                id="config-text"
                className="h-96 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter JSON configuration..."
                value={configText}
                onChange={e => setConfigText(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleValidate} disabled={isValidating || !configText}>
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
              <Button variant="outline" onClick={loadSample}>
                Load Sample
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setConfigText('');
                  setValidationResult(null);
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>Schema validation errors and warnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult === null ? (
              <div className="flex h-96 items-center justify-center rounded-md border border-dashed border-border">
                <p className="text-sm text-muted-foreground">
                  Click "Validate" to check your configuration
                </p>
              </div>
            ) : validationResult.valid ? (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Valid Configuration</AlertTitle>
                <AlertDescription className="text-green-600">
                  Your configuration passed all validation checks.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <Alert className="border-destructive bg-destructive/10">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <AlertTitle className="text-destructive">Validation Failed</AlertTitle>
                  <AlertDescription className="text-destructive">
                    Found {validationResult.errors.filter(e => e.severity === 'error').length}{' '}
                    error(s)
                    {validationResult.errors.filter(e => e.severity === 'warning').length > 0 &&
                      `, ${validationResult.errors.filter(e => e.severity === 'warning').length} warning(s)`}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  {validationResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-start gap-2 rounded-md border p-3',
                        error.severity === 'error' && 'border-destructive bg-destructive/5',
                        error.severity === 'warning' &&
                          'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
                        error.severity === 'info' && 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      )}
                    >
                      {getSeverityIcon(error.severity)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{error.message}</p>
                        {error.path && (
                          <p className="text-xs text-muted-foreground">Path: {error.path}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schema Reference */}
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <h4 className="mb-2 text-sm font-semibold">Required Fields</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {configType === 'page' && (
                  <>
                    <li>• id: Unique page identifier</li>
                    <li>• title: Page title</li>
                    <li>• widgets: Array of widget configurations</li>
                  </>
                )}
                {configType === 'route' && (
                  <>
                    <li>• path: URL path</li>
                    <li>• pageId: Page to render</li>
                    <li>• title: Route title</li>
                  </>
                )}
                {configType === 'branding' && (
                  <>
                    <li>• tenantId: Tenant identifier</li>
                    <li>• colors: Color palette</li>
                    <li>• logo: Logo URL (optional)</li>
                  </>
                )}
                {configType === 'menu' && (
                  <>
                    <li>• id: Menu identifier</li>
                    <li>• items: Array of menu items</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
