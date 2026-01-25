import { createFileRoute } from '@tanstack/react-router';
import { PagePreviewTool } from '@/tools/components/PagePreviewTool';

/**
 * Page Preview Tool Route
 */
export const Route = createFileRoute('/dev-tools/preview')({
  component: PagePreviewTool,
});
