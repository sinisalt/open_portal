/**
 * Menu Integration Demo Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { MenuIntegrationDemo } from '@/demos/MenuIntegrationDemo';

export const Route = createFileRoute('/menu-integration-demo')({
  component: MenuIntegrationDemo,
});
