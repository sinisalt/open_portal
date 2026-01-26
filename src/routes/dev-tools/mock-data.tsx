import { createFileRoute } from '@tanstack/react-router';
import { MockDataGenerator } from '@/tools/components/MockDataGenerator';

/**
 * Mock Data Generator Tool Route
 */
export const Route = createFileRoute('/dev-tools/mock-data')({
  component: MockDataGenerator,
});
