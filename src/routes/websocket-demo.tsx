/**
 * WebSocket Demo Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { WebSocketDemo } from '@/demos/WebSocketDemo';

export const Route = createFileRoute('/websocket-demo')({
  component: WebSocketDemo,
});
