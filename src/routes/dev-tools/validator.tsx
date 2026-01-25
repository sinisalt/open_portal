import { createFileRoute } from '@tanstack/react-router';
import { ConfigValidatorTool } from '@/tools/components/ConfigValidatorTool';

/**
 * Configuration Validator Tool Route
 */
export const Route = createFileRoute('/dev-tools/validator')({
  component: ConfigValidatorTool,
});
