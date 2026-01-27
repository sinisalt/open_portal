/**
 * Widget Registration
 *
 * Central location for registering all widgets in the application.
 * Import and call registerWidgets() during application initialization.
 *
 * Widget Categories:
 * - layout: Page structure and layout widgets (Page, Section, Grid, Card)
 * - form: Form input widgets (TextInput, Select, DatePicker, Checkbox)
 * - data: Data display widgets (Table, KPI)
 * - feedback: User feedback widgets (Modal, Toast)
 *
 * Performance:
 * - Critical widgets (layout, basic forms) are loaded eagerly
 * - Heavy widgets (charts, tables, modals) are lazy-loaded
 * - Lazy loading reduces initial bundle size significantly
 *
 * Usage:
 * ```typescript
 * import { registerWidgets } from '@/widgets';
 *
 * // During app initialization
 * registerWidgets();
 * ```
 */

import { lazy } from 'react';
import { widgetRegistry } from '@/core/registry/WidgetRegistry';

// CRITICAL WIDGETS - Load eagerly (always needed)
// These are small and required for basic page structure
import { CardWidget } from './CardWidget';
import { CheckboxWidget } from './CheckboxWidget';
import { GridWidget } from './GridWidget';
import { HeroWidget } from './HeroWidget';
import { PageWidget } from './PageWidget';
import { SectionWidget } from './SectionWidget';
import { TextInputWidget } from './TextInputWidget';

// HEAVY WIDGETS - Lazy load (on-demand)
// These are large or rarely used, so load them only when needed
const ChartWidget = lazy(() =>
  import('./ChartWidget').then(module => ({ default: module.ChartWidget }))
);

const DatePickerWidget = lazy(() =>
  import('./DatePickerWidget').then(module => ({ default: module.DatePickerWidget }))
);

const KPIWidget = lazy(() => import('./KPIWidget').then(module => ({ default: module.KPIWidget })));

const MenuWidget = lazy(() =>
  import('./MenuWidget').then(module => ({ default: module.MenuWidget }))
);

const ModalPageWidget = lazy(() =>
  import('./ModalPageWidget').then(module => ({ default: module.ModalPageWidget }))
);

const ModalWidget = lazy(() =>
  import('./ModalWidget').then(module => ({ default: module.ModalWidget }))
);

const SelectWidget = lazy(() =>
  import('./SelectWidget').then(module => ({ default: module.SelectWidget }))
);

const TableWidget = lazy(() =>
  import('./TableWidget').then(module => ({ default: module.TableWidget }))
);

const ToastWidget = lazy(() =>
  import('./ToastWidget').then(module => ({ default: module.ToastWidget }))
);

const WizardWidget = lazy(() =>
  import('./WizardWidget').then(module => ({ default: module.WizardWidget }))
);

/**
 * Register all widgets
 * Call this function during application initialization
 */
export function registerWidgets(): void {
  // Layout & Structure widgets (loaded eagerly - critical for page structure)
  widgetRegistry.register('Page', PageWidget, {
    displayName: 'Page',
    category: 'layout',
    description: 'Top-level page container',
    lazy: false, // Critical, always needed
  });

  widgetRegistry.register('Section', SectionWidget, {
    displayName: 'Section',
    category: 'layout',
    description: 'Page section organizer',
    lazy: false, // Critical, always needed
  });

  widgetRegistry.register('Grid', GridWidget, {
    displayName: 'Grid',
    category: 'layout',
    description: 'Responsive grid layout',
    lazy: false, // Critical, always needed
  });

  widgetRegistry.register('Card', CardWidget, {
    displayName: 'Card',
    category: 'layout',
    description: 'Content card container',
    lazy: false, // Critical, always needed
  });

  widgetRegistry.register('Hero', HeroWidget, {
    displayName: 'Hero',
    category: 'layout',
    description: 'Hero section with background and CTA buttons',
    lazy: false, // Used on many landing pages, load eagerly
  });

  // Form Input widgets (mixed - basic inputs eager, complex inputs lazy)
  widgetRegistry.register('TextInput', TextInputWidget, {
    displayName: 'Text Input',
    category: 'form',
    description: 'Single-line text input',
    lazy: false, // Basic input, commonly used
  });

  widgetRegistry.register('Checkbox', CheckboxWidget, {
    displayName: 'Checkbox',
    category: 'form',
    description: 'Boolean checkbox',
    lazy: false, // Basic input, commonly used
  });

  widgetRegistry.register('Select', SelectWidget, {
    displayName: 'Select',
    category: 'form',
    description: 'Dropdown selection',
    lazy: true, // More complex, lazy load
  });

  widgetRegistry.register('DatePicker', DatePickerWidget, {
    displayName: 'Date Picker',
    category: 'form',
    description: 'Date selection',
    lazy: true, // Complex widget with calendar, lazy load
  });

  // Data Display widgets (all lazy - heavy and not always needed)
  widgetRegistry.register('Table', TableWidget, {
    displayName: 'Table',
    category: 'data',
    description: 'Data table with sorting/filtering',
    lazy: true, // Large widget, lazy load
  });

  widgetRegistry.register('KPI', KPIWidget, {
    displayName: 'KPI',
    category: 'data',
    description: 'Key performance indicator display',
    lazy: true, // Not always needed, lazy load
  });

  widgetRegistry.register('Chart', ChartWidget, {
    displayName: 'Chart',
    category: 'data',
    description: 'Data visualization chart (line, bar, pie, area, scatter)',
    lazy: true, // Very heavy with recharts, definitely lazy load
  });

  // Dialogs & Feedback widgets (all lazy - not needed initially)
  widgetRegistry.register('Modal', ModalWidget, {
    displayName: 'Modal',
    category: 'feedback',
    description: 'Modal dialog overlay',
    lazy: true, // Only needed when triggered, lazy load
  });

  widgetRegistry.register('Toast', ToastWidget, {
    displayName: 'Toast',
    category: 'feedback',
    description: 'Toast notification',
    lazy: true, // Only needed when triggered, lazy load
  });

  // Modal Workflow widgets (all lazy - advanced features)
  widgetRegistry.register('ModalPage', ModalPageWidget, {
    displayName: 'Modal Page',
    category: 'workflow',
    description: 'Full page configuration in modal with data passing',
    lazy: true, // Advanced feature, lazy load
  });

  widgetRegistry.register('Wizard', WizardWidget, {
    displayName: 'Wizard',
    category: 'workflow',
    description: 'Multi-step wizard modal',
    lazy: true, // Advanced feature, lazy load
  });

  // Navigation widgets (lazy - menu system)
  widgetRegistry.register('Menu', MenuWidget, {
    displayName: 'Menu',
    category: 'navigation',
    description: 'Configuration-driven menu widget',
    lazy: true, // Complex navigation, lazy load
  });

  widgetRegistry.register('TopMenu', MenuWidget, {
    displayName: 'Top Menu',
    category: 'navigation',
    description: 'Horizontal navigation menu',
    lazy: true, // Complex navigation, lazy load
  });

  widgetRegistry.register('Sidebar', MenuWidget, {
    displayName: 'Sidebar',
    category: 'navigation',
    description: 'Vertical sidebar navigation',
    lazy: true, // Complex navigation, lazy load
  });

  widgetRegistry.register('SideMenu', MenuWidget, {
    displayName: 'Side Menu',
    category: 'navigation',
    description: 'Vertical sidebar navigation (alias)',
    lazy: true, // Complex navigation, lazy load
  });

  widgetRegistry.register('FooterMenu', MenuWidget, {
    displayName: 'Footer Menu',
    category: 'navigation',
    description: 'Footer navigation menu',
    lazy: true, // Complex navigation, lazy load
  });

  // Log registration summary in development
  if (process.env.NODE_ENV !== 'production') {
    const stats = widgetRegistry.getStats();
    const eagerWidgets = stats.totalWidgets - stats.lazyWidgets;
    console.log('[Widget Registration] Summary:', stats);
    console.log(
      `[Widget Registration] Eager widgets: ${eagerWidgets}, Lazy widgets: ${stats.lazyWidgets}`
    );

    if (stats.totalWidgets === 0) {
      console.warn(
        '[Widget Registration] No widgets registered yet. Import and register widgets in src/widgets/index.ts'
      );
    }
  }
}

/**
 * Unregister all widgets
 * Useful for testing or hot module replacement
 */
export function unregisterAllWidgets(): void {
  widgetRegistry.clear();
}

/**
 * Get widget registry instance
 * Use for debugging or advanced use cases
 */
export function getWidgetRegistry() {
  return widgetRegistry;
}

/**
 * Re-export widget registry for convenience
 */
export { widgetRegistry };

export type { CardWidgetConfig } from './CardWidget';
export { CardWidget } from './CardWidget';
export type {
  AreaChartConfig,
  BarChartConfig,
  ChartConfig,
  ChartWidgetConfig,
  LineChartConfig,
  PieChartConfig,
  ScatterChartConfig,
} from './ChartWidget';
export { ChartWidget } from './ChartWidget';
export type { CheckboxWidgetConfig } from './CheckboxWidget';
export { CheckboxWidget } from './CheckboxWidget';
export type { DatePickerWidgetConfig } from './DatePickerWidget';
export { DatePickerWidget } from './DatePickerWidget';
export type { GridWidgetConfig } from './GridWidget';
export { GridWidget } from './GridWidget';
export type { HeroWidgetConfig } from './HeroWidget';
export { HeroWidget } from './HeroWidget';
export type { KPIWidgetConfig } from './KPIWidget';
export { KPIWidget } from './KPIWidget';
export type { MenuPosition, MenuTheme, MenuVariant, MenuWidgetConfig } from './MenuWidget';
export { MenuWidget } from './MenuWidget';
export type {
  ModalInputData,
  ModalOutputData,
  ModalPageWidgetConfig,
  ModalWorkflowEvents,
} from './ModalPageWidget';
export { ModalPageWidget } from './ModalPageWidget';
export type { ModalAction, ModalWidgetConfig } from './ModalWidget';
export { ModalWidget } from './ModalWidget';
/**
 * Re-export widget types
 */
export type { PageWidgetConfig } from './PageWidget';
/**
 * Re-export widgets for direct usage
 */
export { PageWidget } from './PageWidget';
export type { SectionWidgetConfig } from './SectionWidget';
export { SectionWidget } from './SectionWidget';
export type { SelectOption, SelectWidgetConfig } from './SelectWidget';
export { SelectWidget } from './SelectWidget';
export type { TableWidgetConfig } from './TableWidget';
export { TableWidget } from './TableWidget';
export type { TextInputWidgetConfig } from './TextInputWidget';
export { TextInputWidget } from './TextInputWidget';
export type {
  ToastAction,
  ToastOptions,
  ToastPosition,
  ToastVariant,
  ToastWidgetConfig,
} from './ToastWidget';
export { ToastWidget, toastManager } from './ToastWidget';
export type { WizardEvents, WizardState, WizardStep, WizardWidgetConfig } from './WizardWidget';
export { WizardWidget } from './WizardWidget';
