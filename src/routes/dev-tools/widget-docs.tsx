import { createFileRoute } from '@tanstack/react-router';
import { WidgetDocsBrowser } from '@/tools/components/WidgetDocsBrowser';

/**
 * Widget Documentation Browser Route
 */
export const Route = createFileRoute('/dev-tools/widget-docs')({
  component: WidgetDocsBrowser,
});
