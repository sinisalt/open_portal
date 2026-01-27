import { Code2, Eye, Package, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import { widgetRegistry } from '@/core/registry/WidgetRegistry';

/**
 * WidgetDocsBrowser - Browse available widgets with documentation
 *
 * Features:
 * - Interactive widget catalog
 * - Search and filter functionality
 * - Widget preview with live examples
 * - Props documentation
 * - Usage examples
 */
export function WidgetDocsBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  // Get all registered widgets
  const registeredWidgets = useMemo(() => {
    const widgets = widgetRegistry.getAll();

    // Handle case where registry returns empty or malformed result
    if (!widgets || !(widgets instanceof Map) || widgets.size === 0) {
      console.warn(
        '[WidgetDocsBrowser] Widget registry returned empty or invalid result:',
        widgets
      );
      return [];
    }

    // Convert Map to array of widget metadata
    return Array.from(widgets.entries()).map(([type, definition]) => ({
      type,
      component: definition.component,
      category: getWidgetCategory(type),
      description: getWidgetDescription(type),
      props: getWidgetProps(type),
      example: getWidgetExample(type),
    }));
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(registeredWidgets.map(w => w.category));
    return ['all', ...Array.from(cats).sort()];
  }, [registeredWidgets]);

  // Filter widgets based on search and category
  const filteredWidgets = useMemo(() => {
    return registeredWidgets.filter(widget => {
      const matchesSearch =
        widget.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || widget.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [registeredWidgets, searchQuery, categoryFilter]);

  const selectedWidgetData = useMemo(() => {
    return filteredWidgets.find(w => w.type === selectedWidget);
  }, [filteredWidgets, selectedWidget]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Widget Documentation</h2>
        <p className="text-muted-foreground">Browse and explore available OpenPortal widgets</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Search Widgets</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Filter by Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget Grid and Detail View */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Widget List */}
        <div className="space-y-3 lg:col-span-1">
          <div className="rounded-md border border bg-card p-3">
            <p className="text-sm font-medium text-foreground">
              {filteredWidgets.length} Widget{filteredWidgets.length !== 1 ? 's' : ''} Found
            </p>
            {registeredWidgets.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                No widgets registered. The widget registry may be empty or not yet initialized.
              </p>
            )}
          </div>
          <div className="space-y-2">
            {filteredWidgets.map(widget => (
              <Card
                key={widget.type}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedWidget === widget.type ? 'border-primary bg-accent' : ''
                }`}
                onClick={() => setSelectedWidget(widget.type)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{widget.type}</CardTitle>
                      <CardDescription className="text-xs">{widget.description}</CardDescription>
                    </div>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {widget.category}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Widget Detail */}
        <div className="lg:col-span-2">
          {selectedWidgetData ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedWidgetData.type}</CardTitle>
                    <CardDescription>{selectedWidgetData.description}</CardDescription>
                  </div>
                  <Badge>{selectedWidgetData.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Props Documentation */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <Code2 className="h-5 w-5" />
                    Props
                  </h3>
                  <div className="rounded-md border border bg-muted/30 p-4">
                    <div className="space-y-3">
                      {selectedWidgetData.props.map(prop => (
                        <div
                          key={prop.name}
                          className="border-b border pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-mono text-sm font-medium">
                                {prop.name}
                                {prop.required && <span className="ml-1 text-destructive">*</span>}
                              </p>
                              <p className="text-xs text-muted-foreground">{prop.description}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {prop.type}
                            </Badge>
                          </div>
                          {prop.default && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Default: <code className="rounded bg-muted px-1">{prop.default}</code>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Usage Example */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <Eye className="h-5 w-5" />
                    Example
                  </h3>
                  <div className="rounded-md border border bg-muted/30">
                    <div className="border-b border bg-muted/50 px-4 py-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Configuration JSON
                      </p>
                    </div>
                    <pre className="overflow-x-auto p-4">
                      <code className="text-xs">
                        {JSON.stringify(selectedWidgetData.example, null, 2)}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Live Preview (Placeholder) */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Preview</h3>
                  <div className="rounded-md border border bg-background p-6">
                    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                      Live preview coming soon...
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex h-96 items-center justify-center">
                <div className="text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Select a widget to view documentation
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions to get widget metadata
function getWidgetCategory(type: string): string {
  const categories: Record<string, string> = {
    Page: 'Layout',
    Section: 'Layout',
    Grid: 'Layout',
    Card: 'Layout',
    TextInput: 'Form',
    Select: 'Form',
    DatePicker: 'Form',
    Checkbox: 'Form',
    Table: 'Data Display',
    KPI: 'Data Display',
    Modal: 'Dialog',
    Toast: 'Feedback',
    Chart: 'Data Display',
  };
  return categories[type] || 'Other';
}

function getWidgetDescription(type: string): string {
  const descriptions: Record<string, string> = {
    Page: 'Root page container with layout and structure',
    Section: 'Content section with optional title and actions',
    Grid: 'Responsive grid layout for widgets',
    Card: 'Container with border, padding, and optional header',
    TextInput: 'Single-line text input field',
    Select: 'Dropdown selection component',
    DatePicker: 'Date selection with calendar popup',
    Checkbox: 'Boolean checkbox input',
    Table: 'Data table with sorting, filtering, and pagination',
    KPI: 'Key performance indicator display',
    Modal: 'Modal dialog overlay',
    Toast: 'Toast notification message',
    Chart: 'Data visualization chart',
  };
  return descriptions[type] || 'Custom widget component';
}

function getWidgetProps(type: string): Array<{
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}> {
  const propsByType: Record<string, unknown> = {
    TextInput: [
      { name: 'id', type: 'string', required: true, description: 'Unique widget identifier' },
      { name: 'label', type: 'string', required: false, description: 'Input label text' },
      { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text' },
      {
        name: 'required',
        type: 'boolean',
        required: false,
        description: 'Whether input is required',
        default: 'false',
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        description: 'Whether input is disabled',
        default: 'false',
      },
    ],
    Table: [
      { name: 'id', type: 'string', required: true, description: 'Unique widget identifier' },
      {
        name: 'columns',
        type: 'Column[]',
        required: true,
        description: 'Table column definitions',
      },
      { name: 'datasource', type: 'string', required: false, description: 'Data source binding' },
      {
        name: 'sortable',
        type: 'boolean',
        required: false,
        description: 'Enable column sorting',
        default: 'true',
      },
      {
        name: 'filterable',
        type: 'boolean',
        required: false,
        description: 'Enable filtering',
        default: 'false',
      },
    ],
  };

  return (
    propsByType[type] || [
      { name: 'id', type: 'string', required: true, description: 'Unique widget identifier' },
      { name: 'type', type: 'string', required: true, description: 'Widget type' },
    ]
  );
}

function getWidgetExample(type: string): Record<string, unknown> {
  const examples: Record<string, Record<string, unknown>> = {
    TextInput: {
      id: 'email',
      type: 'TextInput',
      label: 'Email Address',
      placeholder: 'Enter your email',
      required: true,
    },
    Table: {
      id: 'users-table',
      type: 'Table',
      columns: [
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'email', header: 'Email', accessorKey: 'email' },
      ],
      datasource: 'users-data',
    },
    Card: {
      id: 'info-card',
      type: 'Card',
      title: 'Information',
      children: [],
    },
  };

  return (
    examples[type] || {
      id: `${type.toLowerCase()}-1`,
      type: type,
    }
  );
}
