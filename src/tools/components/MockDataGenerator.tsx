import { Copy, Download, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
 * MockDataGenerator - Generate mock data for testing
 *
 * Features:
 * - Schema-based data generation
 * - Multiple data types (string, number, date, boolean, etc.)
 * - Custom templates and patterns
 * - Bulk data generation
 * - Export to JSON format
 */
export function MockDataGenerator() {
  const [schema, setSchema] = useState<SchemaField[]>([
    { id: '1', name: 'id', type: 'uuid', required: true },
    { id: '2', name: 'name', type: 'fullName', required: true },
    { id: '3', name: 'email', type: 'email', required: true },
  ]);
  const [recordCount, setRecordCount] = useState(10);
  const [generatedData, setGeneratedData] = useState<any[]>([]);

  const fieldTypes = [
    { value: 'uuid', label: 'UUID' },
    { value: 'number', label: 'Number' },
    { value: 'string', label: 'String' },
    { value: 'fullName', label: 'Full Name' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'address', label: 'Address' },
    { value: 'city', label: 'City' },
    { value: 'country', label: 'Country' },
    { value: 'date', label: 'Date' },
    { value: 'datetime', label: 'Date Time' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'url', label: 'URL' },
    { value: 'image', label: 'Image URL' },
  ];

  const addField = () => {
    const newField: SchemaField = {
      id: Date.now().toString(),
      name: `field${schema.length + 1}`,
      type: 'string',
      required: false,
    };
    setSchema([...schema, newField]);
  };

  const removeField = (id: string) => {
    setSchema(schema.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    setSchema(schema.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const generateData = () => {
    const data: any[] = [];
    for (let i = 0; i < recordCount; i++) {
      const record: any = {};
      for (const field of schema) {
        record[field.name] = generateFieldValue(field, i);
      }
      data.push(record);
    }
    setGeneratedData(data);
  };

  const downloadData = () => {
    const json = JSON.stringify(generatedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const json = JSON.stringify(generatedData, null, 2);
    navigator.clipboard.writeText(json);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Mock Data Generator</h2>
        <p className="text-muted-foreground">
          Generate realistic mock data for testing and development
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Schema Builder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Schema</CardTitle>
                <CardDescription>Define fields and data types</CardDescription>
              </div>
              <Button size="sm" onClick={addField}>
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {schema.map(field => (
                <div
                  key={field.id}
                  className="flex items-end gap-2 rounded-md border border-border p-3"
                >
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Field Name</Label>
                        <Input
                          value={field.name}
                          onChange={e => updateField(field.id, { name: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={value => updateField(field.id, { type: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(field.id)}
                    disabled={schema.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="record-count">Number of Records</Label>
              <Input
                id="record-count"
                type="number"
                min={1}
                max={1000}
                value={recordCount}
                onChange={e => setRecordCount(Number(e.target.value))}
              />
            </div>

            <Button onClick={generateData} className="w-full">
              Generate Data
            </Button>
          </CardContent>
        </Card>

        {/* Generated Data Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Data</CardTitle>
                <CardDescription>Preview and export mock data</CardDescription>
              </div>
              {generatedData.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button size="sm" onClick={downloadData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedData.length === 0 ? (
              <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
                Click "Generate Data" to create mock data
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge>{generatedData.length} records</Badge>
                  <p className="text-sm text-muted-foreground">
                    {(JSON.stringify(generatedData).length / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="h-96 overflow-auto rounded-md border border-border bg-muted/30">
                  <pre className="p-4 text-xs">
                    <code>{JSON.stringify(generatedData, null, 2)}</code>
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Types
interface SchemaField {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

// Generate field value based on type
function generateFieldValue(field: SchemaField, index: number): any {
  switch (field.type) {
    case 'uuid':
      return `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 11)}`;
    case 'number':
      return Math.floor(Math.random() * 1000);
    case 'string':
      return `value_${index}`;
    case 'fullName':
      return getRandomItem(['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams']);
    case 'firstName':
      return getRandomItem(['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana']);
    case 'lastName':
      return getRandomItem(['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Davis']);
    case 'email':
      return `user${index}@example.com`;
    case 'phone':
      return `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    case 'address':
      return `${Math.floor(Math.random() * 9999)} Main St`;
    case 'city':
      return getRandomItem(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']);
    case 'country':
      return getRandomItem(['USA', 'Canada', 'UK', 'Germany', 'France']);
    case 'date':
      return new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    case 'datetime':
      return new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();
    case 'boolean':
      return Math.random() > 0.5;
    case 'url':
      return `https://example.com/resource/${index}`;
    case 'image':
      return `https://picsum.photos/seed/${index}/200/300`;
    default:
      return null;
  }
}

function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
