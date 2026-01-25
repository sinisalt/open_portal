/**
 * Menu Components Demo Route
 */

import { createFileRoute } from '@tanstack/react-router';
import MenuComponentsDemo from '@/demos/MenuComponentsDemo';

export const Route = createFileRoute('/menu-demo')({
  component: MenuComponentsDemo,
});
