import { createFileRoute } from '@tanstack/react-router';
import { ActionDebugger } from '@/tools/components/ActionDebugger';

/**
 * Action Debugger Tool Route
 */
export const Route = createFileRoute('/dev-tools/debugger')({
  component: ActionDebugger,
});
