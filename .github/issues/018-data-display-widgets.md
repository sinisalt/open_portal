# Issue #018: Data Display Widgets (Table, KPI Card)

**Phase:** Phase 1 - Core Platform (MVP Renderer)  
**Weeks:** 5-7  
**Component:** Frontend  
**Estimated Effort:** 3-4 days  
**Priority:** High  
**Labels:** phase-1, frontend, widgets, data-display

**Updated:** January 23, 2026 - Aligned with shadcn/ui approach (ADR-012)

## Description
Implement basic data display widgets (Table and KPI Card) for showing data to users in the MVP. The Table widget will have basic features with advanced features coming in Phase 3.

**Implementation Approach:**
- **Table:** Uses shadcn `table` + @tanstack/react-table for data management
- **KPI Card:** Uses shadcn `card` (already installed in ISSUE-013)

See `WIDGET-COMPONENT-MAPPING.md` for detailed component mapping and installation commands.

## Acceptance Criteria

### Table Widget (Basic)
- [ ] Column configuration with headers
- [ ] Row data rendering
- [ ] Row key support
- [ ] Column alignment (left, center, right)
- [ ] Column width configuration
- [ ] Basic formatting (text, number, date)
- [ ] Loading state display
- [ ] Empty state message
- [ ] Row click event
- [ ] Basic styling and theming
- [ ] Responsive behavior (mobile stacking)
- [ ] Accessibility

### KPI Card Widget
- [ ] Value display with label
- [ ] Format support (number, currency, percent)
- [ ] Trend indicator (up, down, neutral)
- [ ] Trend value display
- [ ] Icon support
- [ ] Color customization
- [ ] Size variants (sm, md, lg)
- [ ] onClick event
- [ ] Loading state
- [ ] Responsive sizing
- [ ] Accessibility

## Widget Props Schemas

### Table
```typescript
{
  columns: Array<{
    id: string;
    label: string;
    field: string;
    width?: number | string;
    align?: "left" | "center" | "right";
    format?: "text" | "number" | "currency" | "date";
    formatOptions?: object;
  }>;
  data: Array<Record<string, any>>;
  rowKey: string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
}
```

### KPI Card
```typescript
{
  label: string;
  value: number | string;
  format?: "number" | "currency" | "percent";
  formatOptions?: {
    decimals?: number;
    currency?: string;
    locale?: string;
  };
  showTrend?: boolean;
  trendDirection?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  onClick?: () => void;
}
```

## Dependencies
- Depends on: #015 (Widget registry)
- Depends on: #012 (Branding/theming)
- Depends on: #014 (Widget architecture POC)
- References: WIDGET-COMPONENT-MAPPING.md (component mapping)

## shadcn Component Installation

```bash
# Table widget
npx shadcn@latest add table
npm install @tanstack/react-table

# KPI Card - already installed in ISSUE-013
# npx shadcn@latest add card
```

## Technical Notes
- **Table:** Wrap shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` components
- **TanStack Table:** Headless table logic for sorting, filtering, pagination (Phase 3)
- **KPI Card:** Wrap shadcn `Card`, `CardHeader`, `CardTitle`, `CardContent` components
- Number formatting using Intl.NumberFormat API
- Currency localization support
- Date formatting using date-fns or Intl.DateTimeFormat
- Handle missing/null data gracefully (empty states)
- Responsive table: horizontal scroll on mobile
- Accessibility handled by semantic HTML (`<table>`, `<th>`, `<td>`) and shadcn Card

## Table Features (MVP)
- Fixed column widths or auto-sizing
- Zebra striping option
- Hover effects
- Cell text overflow handling (ellipsis)
- No sorting, filtering, or pagination (Phase 3)

## KPI Card Features
- Animate value changes (optional)
- Trend arrow icons
- Color coding for status
- Compact and expanded views
- Tooltip support

## Formatting Support
- [ ] Number formatting with locale
- [ ] Currency formatting
- [ ] Percentage formatting
- [ ] Date formatting (various formats)
- [ ] Custom formatters

## Accessibility Requirements
- [ ] Table semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)
- [ ] ARIA table roles (handled by semantic HTML)
- [ ] Keyboard navigation (arrow keys for table, tab for KPI actions)
- [ ] Screen reader support (column headers, row data announced)
- [ ] Focus management (handled by shadcn Button in KPI actions)
- [ ] KPI aria-live regions for dynamic updates (role="status")

**Note:** Semantic HTML provides most accessibility for tables. shadcn Card uses Radix primitives for accessible interactions.

## Testing Requirements
- [ ] Unit tests for widgets
- [ ] Test with various data types
- [ ] Test formatting functions
- [ ] Test loading states
- [ ] Test empty states
- [ ] Test responsiveness
- [ ] Accessibility tests
- [ ] Visual regression tests

## Documentation
- [ ] Widget API documentation
- [ ] Usage examples
- [ ] Data formatting guide
- [ ] Responsive behavior documentation
- [ ] Accessibility guidelines

## Deliverables
- Table widget (basic) using shadcn + TanStack Table
- KPI Card widget using shadcn Card
- Formatting utilities (number, currency, date)
- Tests (following ISSUE-014 test patterns)
- Documentation (usage examples, configuration)

## Implementation Example

**KPIWidget using shadcn Card:**
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { WidgetProps } from '@/types/widget'

interface KPIWidgetConfig extends WidgetConfig {
  type: 'KPI'
  label: string
  icon?: string
  trend?: { direction: 'up' | 'down' | 'neutral'; value: string }
}

export function KPIWidget({ config, bindings, events }: WidgetProps<KPIWidgetConfig>) {
  const { label, icon, trend } = config
  const value = bindings?.value ?? '—'

  return (
    <Card onClick={() => events?.onClick?.()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon && <span className="h-4 w-4 text-muted-foreground">{icon}</span>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '—'} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

## References
- **WIDGET-COMPONENT-MAPPING.md:** Table complexity (8-10 hours), KPI complexity (3-4 hours)
- **WIDGET-ARCHITECTURE.md:** 3-layer architecture patterns
- **shadcn/ui Components:** [Table](https://ui.shadcn.com/docs/components/table), [Card](https://ui.shadcn.com/docs/components/card)
- **TanStack Table:** [Documentation](https://tanstack.com/table/latest)
