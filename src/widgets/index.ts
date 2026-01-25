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
// Data Visualization widgets
import { ChartWidget } from './ChartWidget';
// Form Input widgets (4 widgets)
import { CheckboxWidget } from './CheckboxWidget';
import { DatePickerWidget } from './DatePickerWidget';
import { GridWidget } from './GridWidget';
// Data Display widgets (2 widgets)
import { KPIWidget } from './KPIWidget';
// Navigation widgets (1 widget)
import { MenuWidget } from './MenuWidget';
// Modal Workflow widgets
import { ModalPageWidget } from './ModalPageWidget';
// Dialogs & Feedback widgets (2 widgets)
import { ModalWidget } from './ModalWidget';
// Layout & Structure widgets (4 widgets)
import { PageWidget } from './PageWidget';
import { SectionWidget } from './SectionWidget';
import { SelectWidget } from './SelectWidget';
import { TableWidget } from './TableWidget';
import { TextInputWidget } from './TextInputWidget';
import { ToastWidget } from './ToastWidget';
import { WizardWidget } from './WizardWidget';

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

  // Data Display widgets (2 widgets - complete for MVP)
  widgetRegistry.register('Table', TableWidget, {
    displayName: 'Table',
    category: 'data',
    description: 'Data table with sorting/filtering',
  });

  widgetRegistry.register('KPI', KPIWidget, {
    displayName: 'KPI',
    category: 'data',
    description: 'Key performance indicator display',
  });

  widgetRegistry.register('Chart', ChartWidget, {
    displayName: 'Chart',
    category: 'data',
    description: 'Data visualization chart (line, bar, pie, area, scatter)',
  });

  // Dialogs & Feedback widgets (2 widgets - complete for MVP)
  widgetRegistry.register('Modal', ModalWidget, {
    displayName: 'Modal',
    category: 'feedback',
    description: 'Modal dialog overlay',
  });

  widgetRegistry.register('Toast', ToastWidget, {
    displayName: 'Toast',
    category: 'feedback',
    description: 'Toast notification',
  });

  // Modal Workflow widgets
  widgetRegistry.register('ModalPage', ModalPageWidget, {
    displayName: 'Modal Page',
    category: 'workflow',
    description: 'Full page configuration in modal with data passing',
  });

  widgetRegistry.register('Wizard', WizardWidget, {
    displayName: 'Wizard',
    category: 'workflow',
    description: 'Multi-step wizard modal',
  });

  // Navigation widgets (Menu variants)
  widgetRegistry.register('Menu', MenuWidget, {
    displayName: 'Menu',
    category: 'navigation',
    description: 'Configuration-driven menu widget',
  });

  widgetRegistry.register('TopMenu', MenuWidget, {
    displayName: 'Top Menu',
    category: 'navigation',
    description: 'Horizontal navigation menu',
  });

  widgetRegistry.register('Sidebar', MenuWidget, {
    displayName: 'Sidebar',
    category: 'navigation',
    description: 'Vertical sidebar navigation',
  });

  widgetRegistry.register('SideMenu', MenuWidget, {
    displayName: 'Side Menu',
    category: 'navigation',
    description: 'Vertical sidebar navigation (alias)',
  });

  widgetRegistry.register('FooterMenu', MenuWidget, {
    displayName: 'Footer Menu',
    category: 'navigation',
    description: 'Footer navigation menu',
  });

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
