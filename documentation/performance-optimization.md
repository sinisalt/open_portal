# Performance Optimization Guide

This document outlines the performance optimizations implemented in OpenPortal and provides guidelines for maintaining optimal performance.

## Bundle Size Optimizations

### Current Bundle Statistics

**Main Bundle:** 128.66 KB (✅ Under 300KB target)
**Total Split:** 16 chunks totaling ~1,706 KB

### Chunk Strategy

#### 1. Vendor Chunks
- **react-vendor** (242 KB): React and ReactDOM
- **radix-ui** (113 KB): Radix UI primitives
- **tanstack** (19 KB): TanStack Router, Table, Virtual
- **ui-utils** (26 KB): clsx, tailwind-merge, class-variance-authority
- **date-libs** (26 KB): date-fns, react-day-picker
- **form-libs**: react-hook-form, zod (when used)
- **auth-msal** (132 KB): Azure MSAL authentication

#### 2. Widget Chunks (Lazy Loaded)
- **widgets-layout** (19 KB): Page, Section, Grid, Card
- **widgets-form** (15 KB): TextInput, Select, DatePicker, Checkbox
- **widgets-data** (35 KB): Table, KPI, Chart
- **widgets-feedback** (7 KB): Modal, Toast
- **widgets-navigation** (30 KB): Menu variants

#### 3. Heavy Dependencies (Lazy Loaded)
- **charts** (319 KB): recharts library
- **html2canvas** (198 KB): Screenshot functionality

### Widget Loading Strategy

**Eagerly Loaded (Critical):**
- Layout widgets: Page, Section, Grid, Card
- Basic form widgets: TextInput, Checkbox

**Lazy Loaded (On-Demand):**
- Complex form widgets: Select, DatePicker
- Data widgets: Table, KPI, Chart
- Feedback widgets: Modal, Toast, Wizard
- Navigation: Menu, Sidebar

## Code Splitting

### Route-Based Splitting

Routes are automatically split by TanStack Router. Each route generates its own chunk loaded on navigation.

### Dynamic Imports

Heavy widgets use React's `lazy()` for code splitting:

```typescript
const ChartWidget = lazy(() =>
  import('./ChartWidget').then(module => ({ default: module.ChartWidget }))
);
```

## Performance Monitoring

### Widget Render Tracking

Performance monitoring utilities track widget render times:

```typescript
import { startPerformanceMark, endPerformanceMark } from '@/utils/performanceMonitoring';

// In component
const perfMarker = startPerformanceMark('WidgetName');
// ... render logic ...
endPerformanceMark(perfMarker);
```

### Performance Metrics

Get performance statistics:

```typescript
import { getPerformanceMetrics, logPerformanceSummary } from '@/utils/performanceMonitoring';

// Get metrics
const metrics = getPerformanceMetrics();
console.log('Average render time:', metrics.avgRenderTime);

// Log summary
logPerformanceSummary();
```

### Web Vitals

Monitor Core Web Vitals (FCP, LCP, CLS, FID, TTFB):

```typescript
import reportWebVitals from './reportWebVitals';

reportWebVitals(console.log);
```

## Render Optimization

### Memoization

**WidgetRenderer** uses `React.memo()` to prevent unnecessary re-renders:

```typescript
export const WidgetRenderer = memo(function WidgetRenderer({ config, bindings, events }) {
  // Component logic
});
```

### Best Practices

1. **Use React.memo()** for components that render often with the same props
2. **Use useMemo()** for expensive calculations
3. **Use useCallback()** for event handlers passed to child components
4. **Avoid inline object/array creation** in render methods

```typescript
// ❌ Bad: Creates new object on every render
<Widget config={{ type: 'TextInput' }} />

// ✅ Good: Memoize config object
const config = useMemo(() => ({ type: 'TextInput' }), []);
<Widget config={config} />
```

## Bundle Analysis

### Analyze Build Output

```bash
npm run build:analyze
```

This runs the bundle analyzer and provides:
- Bundle sizes by chunk
- Gzip compression ratios
- Performance recommendations
- Slow bundle detection

### Vite Build Stats

```bash
npm run build
```

Vite outputs:
- Individual chunk sizes
- Gzip sizes
- Warnings for large bundles

## Performance Targets

### Bundle Size
- ✅ Main bundle: <300 KB (gzipped)
  - **Current: 128 KB**
- ✅ Total vendor bundles: <500 KB (split recommended)
  - **Current: 633 KB (split into 7 chunks)**
- ✅ Individual chunks: <500 KB
  - **All chunks under 400 KB**

### Load Performance
- ⏳ First Contentful Paint (FCP): <1s
- ⏳ Time to Interactive (TTI): <2s
- ⏳ Largest Contentful Paint (LCP): <2.5s

### Runtime Performance
- ⏳ Widget render time: <30ms average
- ⏳ Re-render optimization: <16ms (60fps)
- ⏳ Table virtualization: >1000 rows with no lag

## Optimization Checklist

### When Adding New Features

- [ ] Will this feature be used on every page?
  - If NO → Make it lazy-loadable
- [ ] Does this add a large dependency (>50KB)?
  - If YES → Create separate chunk or lazy load
- [ ] Can this be computed once and cached?
  - If YES → Use useMemo or move to build time
- [ ] Does this component re-render frequently?
  - If YES → Add React.memo and optimize props

### When Adding Dependencies

- [ ] Check bundle size impact: `npm run build:analyze`
- [ ] Look for smaller alternatives
- [ ] Import only what you need (tree shaking)
- [ ] Consider CDN loading for large libraries

### Regular Maintenance

- [ ] Run bundle analysis monthly
- [ ] Review slow widget renders (>30ms)
- [ ] Check for unused dependencies
- [ ] Update to latest versions (often include optimizations)

## Common Performance Pitfalls

### 1. Importing Entire Libraries

```typescript
// ❌ Bad: Imports entire date-fns
import * as dateFns from 'date-fns';

// ✅ Good: Import only what you need
import { format, parseISO } from 'date-fns';
```

### 2. Inline Function Definitions

```typescript
// ❌ Bad: Creates new function on every render
<Button onClick={() => handleClick(id)} />

// ✅ Good: Use useCallback
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<Button onClick={handleButtonClick} />
```

### 3. Large Arrays in State

```typescript
// ❌ Bad: Rendering 10,000 rows
{data.map(row => <Row key={row.id} data={row} />)}

// ✅ Good: Use virtualization
import { useVirtualizer } from '@tanstack/react-virtual';
// ... implement virtual scrolling
```

### 4. Unnecessary Effect Dependencies

```typescript
// ❌ Bad: Runs on every render
useEffect(() => {
  fetchData();
}, [someObject]); // Object recreated every render

// ✅ Good: Extract specific values
useEffect(() => {
  fetchData();
}, [someObject.id]); // Only depends on ID
```

## Future Optimizations

### Planned Improvements

1. **Table Virtualization**: Implement @tanstack/react-virtual for large tables
2. **Image Optimization**: Lazy load images, use modern formats (WebP, AVIF)
3. **Service Worker**: Cache static assets and API responses
4. **CDN Setup**: Host static configs and assets on CDN
5. **Preloading**: Preload critical routes and widgets
6. **Compression**: Enable Brotli compression on server

### Experimental Features

1. **React Server Components**: Potential future migration
2. **Streaming SSR**: For faster initial page loads
3. **Module Federation**: Share widgets across applications

## Resources

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [Bundle Size Analyzer Tools](https://bundlephobia.com/)

## Support

For performance issues or questions:
1. Check bundle size: `npm run build:analyze`
2. Review performance metrics: `getPerformanceMetrics()`
3. Profile in browser DevTools
4. Open an issue with performance data
