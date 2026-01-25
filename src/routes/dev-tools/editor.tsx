import { createFileRoute } from '@tanstack/react-router';
import { ConfigEditor } from '@/tools/components/ConfigEditor';

/**
 * Configuration Editor Tool Route
 */
export const Route = createFileRoute('/dev-tools/editor')({
  component: ConfigEditor,
});
