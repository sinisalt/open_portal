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
 * Usage:
 * ```typescript
 * import { registerWidgets } from '@/widgets';
 *
 * // During app initialization
 * registerWidgets();
 * ```
 */

import { widgetRegistry } from '@/core/registry/WidgetRegistry';
import { CardWidget } from './CardWidget';
import { GridWidget } from './GridWidget';
// Layout & Structure widgets (4 widgets)
import { PageWidget } from './PageWidget';
import { SectionWidget } from './SectionWidget';
// Form Input widgets (4 widgets)
import { CheckboxWidget } from './CheckboxWidget';
import { DatePickerWidget } from './DatePickerWidget';
import { SelectWidget } from './SelectWidget';
import { TextInputWidget } from './TextInputWidget';

/**
 * Register all widgets
 * Call this function during application initialization
 */
export function registerWidgets(): void {
  widgetRegistry.register('Page', PageWidget, {
    displayName: 'Page',
    category: 'layout',
    description: 'Top-level page container',
  });

  widgetRegistry.register('Section', SectionWidget, {
    displayName: 'Section',
    category: 'layout',
    description: 'Page section organizer',
  });

  widgetRegistry.register('Grid', GridWidget, {
    displayName: 'Grid',
    category: 'layout',
    description: 'Responsive grid layout',
  });

  widgetRegistry.register('Card', CardWidget, {
    displayName: 'Card',
    category: 'layout',
    description: 'Content card container',
  });

  // Form Input widgets (4 widgets - complete for MVP)
  widgetRegistry.register('TextInput', TextInputWidget, {
    displayName: 'Text Input',
    category: 'form',
    description: 'Single-line text input',
  });

  widgetRegistry.register('Select', SelectWidget, {
    displayName: 'Select',
    category: 'form',
    description: 'Dropdown selection',
  });

  widgetRegistry.register('DatePicker', DatePickerWidget, {
    displayName: 'Date Picker',
    category: 'form',
    description: 'Date selection',
  });

  widgetRegistry.register('Checkbox', CheckboxWidget, {
    displayName: 'Checkbox',
    category: 'form',
    description: 'Boolean checkbox',
  });

  // Data Display widgets (2 widgets)
  // import { TableWidget } from './TableWidget';
  // import { KPIWidget } from './KPIWidget';
  //
  // widgetRegistry.register('Table', TableWidget, {
  //   displayName: 'Table',
  //   category: 'data',
  //   description: 'Data table with sorting/filtering',
  // });
  //
  // widgetRegistry.register('KPI', KPIWidget, {
  //   displayName: 'KPI',
  //   category: 'data',
  //   description: 'Key performance indicator display',
  // });

  // Dialogs & Feedback widgets (2 widgets)
  // import { ModalWidget } from './ModalWidget';
  // import { ToastWidget } from './ToastWidget';
  //
  // widgetRegistry.register('Modal', ModalWidget, {
  //   displayName: 'Modal',
  //   category: 'feedback',
  //   description: 'Modal dialog overlay',
  // });
  //
  // widgetRegistry.register('Toast', ToastWidget, {
  //   displayName: 'Toast',
  //   category: 'feedback',
  //   description: 'Toast notification',
  // });

  // Example: Lazy loading for heavy widgets
  // import { lazy } from 'react';
  //
  // const ChartWidget = lazy(() => import('./ChartWidget'));
  // widgetRegistry.register('Chart', ChartWidget, {
  //   displayName: 'Chart',
  //   category: 'data',
  //   description: 'Data visualization chart',
  //   lazy: true,
  // });

  // Log registration summary in development
  if (process.env.NODE_ENV !== 'production') {
    const stats = widgetRegistry.getStats();
    console.log('[Widget Registration] Summary:', stats);

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

/**
 * Re-export widgets for direct usage
 */
export { PageWidget } from './PageWidget';
export { SectionWidget } from './SectionWidget';
export { GridWidget } from './GridWidget';
export { CardWidget } from './CardWidget';
export { TextInputWidget } from './TextInputWidget';
export { SelectWidget } from './SelectWidget';
export { DatePickerWidget } from './DatePickerWidget';
export { CheckboxWidget } from './CheckboxWidget';

/**
 * Re-export widget types
 */
export type { PageWidgetConfig } from './PageWidget';
export type { SectionWidgetConfig } from './SectionWidget';
export type { GridWidgetConfig } from './GridWidget';
export type { CardWidgetConfig } from './CardWidget';
export type { TextInputWidgetConfig } from './TextInputWidget';
export type { SelectWidgetConfig, SelectOption } from './SelectWidget';
export type { DatePickerWidgetConfig } from './DatePickerWidget';
export type { CheckboxWidgetConfig } from './CheckboxWidget';
