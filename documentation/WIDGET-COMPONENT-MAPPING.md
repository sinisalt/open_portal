# Widget Component Mapping

**Version:** 1.0  
**Last Updated:** January 20, 2026  
**Status:** Active

## Overview

This document maps OpenPortal's 12 MVP widgets to their corresponding shadcn/ui components and Radix UI primitives. It serves as a reference for widget implementation and component installation planning.

## 3-Layer Architecture Reminder

```
Radix UI Primitive → shadcn Component → OpenPortal Widget → Widget Registry
```

## MVP Widget Mapping (12 Core Widgets)

### Layout & Structure Widgets (4 widgets)

#### 1. PageWidget
**Purpose:** Root page container with header, content, footer

**shadcn Components:**
- None (custom layout using Tailwind)

**Radix Components:**
- None

**Implementation:**
```typescript
// Custom layout component
<div className="min-h-screen flex flex-col">
  <header>{config.header}</header>
  <main className="flex-1">{config.content}</main>
  <footer>{config.footer}</footer>
</div>
```

**Installation:**
```bash
# No shadcn components needed
```

**Complexity:** Low  
**Estimated Effort:** 2-3 hours

---

#### 2. SectionWidget
**Purpose:** Content grouping with optional title and padding

**shadcn Components:**
- `card` (optional, for bordered sections)

**Radix Components:**
- None

**Implementation:**
```typescript
// Using Card for bordered sections, div for simple sections
{config.bordered ? (
  <Card>
    <CardHeader><CardTitle>{config.title}</CardTitle></CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
) : (
  <section className="space-y-4">
    {config.title && <h2>{config.title}</h2>}
    {children}
  </section>
)}
```

**Installation:**
```bash
npx shadcn@latest add card  # Only if using bordered sections
```

**Complexity:** Low  
**Estimated Effort:** 2 hours

---

#### 3. GridWidget
**Purpose:** Responsive 12-column grid layout

**shadcn Components:**
- None (custom grid using Tailwind)

**Radix Components:**
- None

**Implementation:**
```typescript
// Tailwind grid
<div className={`grid grid-cols-${config.columns} gap-${config.gap}`}>
  {children}
</div>
```

**Installation:**
```bash
# No shadcn components needed
```

**Complexity:** Low  
**Estimated Effort:** 2 hours

---

#### 4. CardWidget
**Purpose:** Content card with title, actions, padding

**shadcn Components:**
- `card`
- `button` (for actions)

**Radix Components:**
- `@radix-ui/react-slot` (via card)

**Implementation:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>{config.title}</CardTitle>
    <CardDescription>{config.description}</CardDescription>
  </CardHeader>
  <CardContent>{config.content}</CardContent>
  {config.actions && (
    <CardFooter>
      {config.actions.map(action => (
        <Button key={action.id} variant={action.variant}>
          {action.label}
        </Button>
      ))}
    </CardFooter>
  )}
</Card>
```

**Installation:**
```bash
npx shadcn@latest add card
npx shadcn@latest add button
```

**Complexity:** Low  
**Estimated Effort:** 3 hours

---

### Form Input Widgets (4 widgets)

#### 5. TextInputWidget
**Purpose:** Single-line text input (text, email, password, number, tel)

**shadcn Components:**
- `input`
- `label`

**Radix Components:**
- `@radix-ui/react-label`

**Implementation:**
```typescript
<div>
  <Label htmlFor={config.id}>{config.label}</Label>
  <Input
    id={config.id}
    type={config.inputType}
    value={bindings.value}
    onChange={(e) => events.onChange(e.target.value)}
  />
</div>
```

**Installation:**
```bash
npx shadcn@latest add input
npx shadcn@latest add label
```

**Complexity:** Low  
**Estimated Effort:** 3 hours  
**Status:** ✅ Implemented in ISSUE-014

---

#### 6. SelectWidget
**Purpose:** Dropdown selection (single, searchable)

**shadcn Components:**
- `select` (for simple dropdowns)
- `command` (for searchable select)
- `popover` (for searchable select)
- `label`

**Radix Components:**
- `@radix-ui/react-select`
- `@radix-ui/react-popover`
- `@radix-ui/react-dialog`
- `@radix-ui/react-label`

**Implementation:**

**Simple Select:**
```typescript
<div>
  <Label htmlFor={config.id}>{config.label}</Label>
  <Select value={bindings.value} onValueChange={events.onChange}>
    <SelectTrigger id={config.id}>
      <SelectValue placeholder={config.placeholder} />
    </SelectTrigger>
    <SelectContent>
      {config.options.map(option => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

**Searchable Select (Combobox):**
```typescript
<Command>
  <CommandInput placeholder={config.placeholder} />
  <CommandEmpty>No results found.</CommandEmpty>
  <CommandGroup>
    {config.options.map(option => (
      <CommandItem
        key={option.value}
        value={option.value}
        onSelect={events.onChange}
      >
        {option.label}
      </CommandItem>
    ))}
  </CommandGroup>
</Command>
```

**Installation:**
```bash
npx shadcn@latest add select
npx shadcn@latest add command
npx shadcn@latest add popover
npx shadcn@latest add label
```

**Complexity:** Medium  
**Estimated Effort:** 4-5 hours

---

#### 7. DatePickerWidget
**Purpose:** Date/time selection (single date, date range, time)

**shadcn Components:**
- `calendar` (uses react-day-picker)
- `popover`
- `button`
- `label`

**Radix Components:**
- `@radix-ui/react-popover`
- `@radix-ui/react-label`

**External Libraries:**
- `react-day-picker` (date selection)
- `date-fns` (date formatting)

**Implementation:**
```typescript
<div>
  <Label>{config.label}</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">
        {bindings.value ? format(bindings.value, 'PPP') : config.placeholder}
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <Calendar
        mode="single"
        selected={bindings.value}
        onSelect={events.onChange}
        disabled={config.disabledDates}
      />
    </PopoverContent>
  </Popover>
</div>
```

**Installation:**
```bash
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add button
npx shadcn@latest add label
npm install date-fns
```

**Complexity:** Medium  
**Estimated Effort:** 5-6 hours

---

#### 8. CheckboxWidget
**Purpose:** Boolean input with label

**shadcn Components:**
- `checkbox`
- `label`

**Radix Components:**
- `@radix-ui/react-checkbox`
- `@radix-ui/react-label`

**Implementation:**
```typescript
<div className="flex items-center space-x-2">
  <Checkbox
    id={config.id}
    checked={bindings.value}
    onCheckedChange={events.onChange}
    disabled={config.disabled}
  />
  <Label
    htmlFor={config.id}
    className="cursor-pointer"
  >
    {config.label}
  </Label>
</div>
```

**Installation:**
```bash
npx shadcn@latest add checkbox
npx shadcn@latest add label
```

**Complexity:** Low  
**Estimated Effort:** 2-3 hours

---

### Data Display Widgets (2 widgets)

#### 9. TableWidget
**Purpose:** Data table with sorting, pagination, filtering

**shadcn Components:**
- `table`

**Radix Components:**
- None

**External Libraries:**
- `@tanstack/react-table` (headless table logic)

**Implementation:**
```typescript
<div>
  <Table>
    <TableHeader>
      {table.getHeaderGroups().map(headerGroup => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <TableHead key={header.id}>
              {header.column.columnDef.header}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
    <TableBody>
      {table.getRowModel().rows.map(row => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map(cell => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

**Installation:**
```bash
npx shadcn@latest add table
npm install @tanstack/react-table
```

**Complexity:** High  
**Estimated Effort:** 8-10 hours

---

#### 10. KPIWidget
**Purpose:** Key performance indicator display

**shadcn Components:**
- `card`

**Radix Components:**
- None

**Implementation:**
```typescript
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
    {config.icon && <config.icon className="h-4 w-4 text-muted-foreground" />}
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{bindings.value}</div>
    {config.description && (
      <p className="text-xs text-muted-foreground">{config.description}</p>
    )}
    {config.trend && (
      <div className={`text-xs ${config.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {config.trend > 0 ? '↑' : '↓'} {Math.abs(config.trend)}%
      </div>
    )}
  </CardContent>
</Card>
```

**Installation:**
```bash
npx shadcn@latest add card
```

**Complexity:** Low  
**Estimated Effort:** 3-4 hours

---

### Dialog & Feedback Widgets (2 widgets)

#### 11. ModalWidget
**Purpose:** Dialog overlay (modal, drawer, confirm dialog)

**shadcn Components:**
- `dialog`
- `button`

**Radix Components:**
- `@radix-ui/react-dialog`

**Implementation:**
```typescript
<Dialog open={bindings.isOpen} onOpenChange={events.onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{config.title}</DialogTitle>
      {config.description && (
        <DialogDescription>{config.description}</DialogDescription>
      )}
    </DialogHeader>
    {config.content}
    <DialogFooter>
      {config.actions.map(action => (
        <Button
          key={action.id}
          variant={action.variant}
          onClick={() => events.onAction(action.id)}
        >
          {action.label}
        </Button>
      ))}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Installation:**
```bash
npx shadcn@latest add dialog
npx shadcn@latest add button
```

**Complexity:** Medium  
**Estimated Effort:** 4-5 hours

---

#### 12. ToastWidget
**Purpose:** Notification message (success, error, info, warning)

**shadcn Components:**
- `toast` (or use Sonner library)

**Radix Components:**
- `@radix-ui/react-toast`

**External Libraries:**
- `sonner` (recommended alternative for better UX)

**Implementation (using Sonner):**
```typescript
import { toast } from 'sonner'

// Trigger toast
toast.success(config.message, {
  description: config.description,
  action: config.action,
  duration: config.duration,
})
```

**Installation:**
```bash
# Option 1: shadcn toast
npx shadcn@latest add toast

# Option 2: Sonner (recommended)
npm install sonner
npx shadcn@latest add sonner
```

**Complexity:** Low  
**Estimated Effort:** 2-3 hours

---

## Installation Timeline

### Phase 0.5: Migration (ISSUE-013, ISSUE-014)
**Components Already Installed:**
- ✅ `input` - TextInputWidget
- ✅ `button` - LoginPageMSAL, actions
- ✅ `card` - LoginPageMSAL, KPI, Section
- ✅ `label` - TextInputWidget

### Phase 1.3: Form Widgets (Week 5-7)
**Components to Install:**
- `select` - SelectWidget (simple dropdown)
- `command` - SelectWidget (searchable)
- `popover` - SelectWidget, DatePickerWidget
- `calendar` - DatePickerWidget
- `checkbox` - CheckboxWidget
- `date-fns` (npm) - Date formatting

**Estimated Installation Time:** 30 minutes

### Phase 1.3: Data Display Widgets (Week 5-7)
**Components to Install:**
- `table` - TableWidget
- `@tanstack/react-table` (npm) - Table logic

**Estimated Installation Time:** 15 minutes

### Phase 1.3: Dialog Widgets (Week 6)
**Components to Install:**
- `dialog` - ModalWidget
- `sonner` (npm) - ToastWidget (or `toast`)

**Estimated Installation Time:** 15 minutes

### Phase 1.3: Layout Widgets (Week 5-6)
**Components to Install:**
- None (custom layouts using Tailwind)

**Estimated Installation Time:** 0 minutes

## Component Installation Reference

### Basic Installation
```bash
# Install a single component
npx shadcn@latest add <component-name>

# Install multiple components at once
npx shadcn@latest add input button card label
```

### Component List
All available shadcn components:
```bash
accordion       # Collapsible content panels
alert           # Alert messages
alert-dialog    # Alert dialog (destructive actions)
aspect-ratio    # Maintain aspect ratio
avatar          # User avatar
badge           # Small status badge
breadcrumb      # Navigation breadcrumbs
button          # Button component
calendar        # Date picker calendar
card            # Content card
carousel        # Image/content carousel
checkbox        # Checkbox input
collapsible     # Collapsible content
command         # Command palette/searchable list
context-menu    # Right-click context menu
dialog          # Modal dialog
drawer          # Slide-out drawer
dropdown-menu   # Dropdown menu
form            # Form wrapper (react-hook-form)
hover-card      # Hover preview card
input           # Text input
label           # Form label
menubar         # Menu bar
navigation-menu # Navigation menu
pagination      # Pagination controls
popover         # Popover overlay
progress        # Progress bar
radio-group     # Radio button group
resizable       # Resizable panels
scroll-area     # Custom scrollbar
select          # Dropdown select
separator       # Divider line
sheet           # Slide-out sheet
skeleton        # Loading skeleton
slider          # Range slider
sonner          # Toast notifications (Sonner)
switch          # Toggle switch
table           # Data table
tabs            # Tab navigation
textarea        # Multi-line text input
toast           # Toast notifications
toggle          # Toggle button
toggle-group    # Toggle button group
tooltip         # Tooltip
```

## Dependency Tree

### Core Dependencies (Installed First)
- `input` → Requires: `@radix-ui/react-label`
- `button` → No dependencies
- `card` → Requires: `@radix-ui/react-slot`
- `label` → Requires: `@radix-ui/react-label`

### Complex Components (Install Later)
- `select` → Requires: `@radix-ui/react-select`
- `calendar` → Requires: `react-day-picker`, `date-fns`
- `dialog` → Requires: `@radix-ui/react-dialog`
- `popover` → Requires: `@radix-ui/react-popover`
- `command` → Requires: `@radix-ui/react-dialog`, `cmdk`
- `table` → Requires: `@tanstack/react-table` (optional)

## Widget Development Checklist

For each widget:
- [ ] Identify required shadcn components (use this mapping)
- [ ] Install shadcn components
- [ ] Install external libraries (if needed)
- [ ] Create widget config type interface
- [ ] Implement widget component
- [ ] Add widget tests (>80% coverage)
- [ ] Register widget in registry
- [ ] Document widget in widget-catalog.md
- [ ] Update this mapping if needed

## Bundle Size Impact

Estimated bundle sizes (gzipped):
- shadcn component: ~1-5KB each
- OpenPortal widget wrapper: ~0.5-1KB each
- Widget registry: ~1KB
- Total for 12 MVP widgets: ~20-30KB

This is significantly smaller than:
- Material-UI: ~300KB
- Ant Design: ~500KB
- Custom implementation: ~50-100KB

## References

- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [TanStack Table](https://tanstack.com/table)
- [react-day-picker](https://react-day-picker.js.org/)
- [Sonner](https://sonner.emilkowal.ski/)
- [Widget Architecture](./WIDGET-ARCHITECTURE.md)
- [Widget Catalog](./widget-catalog.md)

---

**Version:** 1.0  
**Last Updated:** January 20, 2026  
**Next Review:** After Phase 1.3 widget implementation
