import { Download, FileJson, Save, Upload } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * ConfigEditor - Visual configuration builder
 *
 * Features:
 * - Template-based configuration building
 * - Widget property editor
 * - Export/import configurations
 * - Configuration validation
 * - Quick templates for common patterns
 */
export function ConfigEditor() {
  const [configType, setConfigType] = useState<'page' | 'route' | 'branding' | 'menu'>('page');
  const [configData, setConfigData] = useState<any>({});
  const [jsonView, setJsonView] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const configTemplates = {
    page: {
      empty: {
        id: 'new-page',
        title: 'New Page',
        layout: 'default',
        widgets: [],
      },
      dashboard: {
        id: 'dashboard',
        title: 'Dashboard',
        layout: 'dashboard',
        widgets: [
          {
            id: 'metrics',
            type: 'Section',
            props: { title: 'Metrics' },
            children: [],
          },
        ],
      },
      form: {
        id: 'form-page',
        title: 'Form Page',
        layout: 'centered',
        widgets: [
          {
            id: 'form-section',
            type: 'Section',
            props: { title: 'Form' },
            children: [],
          },
        ],
      },
    },
    route: {
      empty: {
        path: '/new-route',
        pageId: 'new-page',
        title: 'New Route',
        requiresAuth: false,
      },
    },
    branding: {
      empty: {
        tenantId: 'default',
        colors: {
          primary: '#0066cc',
          secondary: '#6c757d',
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
        },
      },
    },
    menu: {
      empty: {
        id: 'new-menu',
        items: [],
      },
    },
  };

  const loadTemplate = (templateKey: string) => {
    const template =
      configTemplates[configType][templateKey as keyof (typeof configTemplates)[typeof configType]];
    if (template) {
      setConfigData(template);
      setJsonView(JSON.stringify(template, null, 2));
      setSaveMessage('');
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonView(value);
    try {
      const parsed = JSON.parse(value);
      setConfigData(parsed);
      setSaveMessage('');
    } catch (error) {
      // Invalid JSON, don't update configData
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(configData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${configType}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSaveMessage('Configuration exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          try {
            const json = JSON.parse(event.target?.result as string);
            setConfigData(json);
            setJsonView(JSON.stringify(json, null, 2));
            setSaveMessage('Configuration imported successfully');
          } catch (error) {
            setSaveMessage('Error: Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSave = async () => {
    // In a real implementation, this would save to backend
    setSaveMessage('Configuration saved successfully (demo mode)');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Configuration Editor</h2>
        <p className="text-muted-foreground">
          Build and edit OpenPortal configurations with templates
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="config-type">Configuration Type</Label>
              <Select value={configType} onValueChange={(value: any) => setConfigType(value)}>
                <SelectTrigger id="config-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page Configuration</SelectItem>
                  <SelectItem value="route">Route Configuration</SelectItem>
                  <SelectItem value="branding">Branding Configuration</SelectItem>
                  <SelectItem value="menu">Menu Configuration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => loadTemplate('empty')}>
                <FileJson className="mr-2 h-4 w-4" />
                New
              </Button>
              {configType === 'page' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => loadTemplate('dashboard')}>
                    Dashboard
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => loadTemplate('form')}>
                    Form
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {saveMessage && (
        <Alert>
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Property Editor (Simplified) */}
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
            <CardDescription>Edit configuration properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {configType === 'page' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="page-id">Page ID</Label>
                  <Input
                    id="page-id"
                    value={configData.id || ''}
                    onChange={e => setConfigData({ ...configData, id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page-title">Title</Label>
                  <Input
                    id="page-title"
                    value={configData.title || ''}
                    onChange={e => setConfigData({ ...configData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page-layout">Layout</Label>
                  <Select
                    value={configData.layout || 'default'}
                    onValueChange={value => setConfigData({ ...configData, layout: value })}
                  >
                    <SelectTrigger id="page-layout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="centered">Centered</SelectItem>
                      <SelectItem value="fullwidth">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {configType === 'route' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="route-path">Path</Label>
                  <Input
                    id="route-path"
                    value={configData.path || ''}
                    onChange={e => setConfigData({ ...configData, path: e.target.value })}
                    placeholder="/example"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route-pageId">Page ID</Label>
                  <Input
                    id="route-pageId"
                    value={configData.pageId || ''}
                    onChange={e => setConfigData({ ...configData, pageId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route-title">Title</Label>
                  <Input
                    id="route-title"
                    value={configData.title || ''}
                    onChange={e => setConfigData({ ...configData, title: e.target.value })}
                  />
                </div>
              </>
            )}

            {configType === 'branding' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="brand-tenantId">Tenant ID</Label>
                  <Input
                    id="brand-tenantId"
                    value={configData.tenantId || ''}
                    onChange={e => setConfigData({ ...configData, tenantId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-primary">Primary Color</Label>
                  <Input
                    id="brand-primary"
                    type="color"
                    value={configData.colors?.primary || '#0066cc'}
                    onChange={e =>
                      setConfigData({
                        ...configData,
                        colors: {
                          ...configData.colors,
                          primary: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-secondary">Secondary Color</Label>
                  <Input
                    id="brand-secondary"
                    type="color"
                    value={configData.colors?.secondary || '#6c757d'}
                    onChange={e =>
                      setConfigData({
                        ...configData,
                        colors: {
                          ...configData.colors,
                          secondary: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </>
            )}

            {configType === 'menu' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="menu-id">Menu ID</Label>
                  <Input
                    id="menu-id"
                    value={configData.id || ''}
                    onChange={e => setConfigData({ ...configData, id: e.target.value })}
                  />
                </div>
                <Alert>
                  <AlertDescription className="text-xs">
                    Use the JSON editor to add menu items
                  </AlertDescription>
                </Alert>
              </>
            )}

            <div className="pt-4">
              <Button
                onClick={() => setJsonView(JSON.stringify(configData, null, 2))}
                variant="outline"
                className="w-full"
              >
                Update JSON View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* JSON Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>JSON Editor</CardTitle>
                <CardDescription>Direct JSON editing</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleImport}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button size="sm" variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              className="h-96 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={jsonView}
              onChange={e => handleJsonChange(e.target.value)}
              placeholder="Configuration JSON will appear here..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
