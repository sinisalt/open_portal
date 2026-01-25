/**
 * Datasource System Index
 *
 * Central export point for datasource system components
 */

// Cache
export { DatasourceCache } from './DatasourceCache';
// Manager
export { DatasourceManager, datasourceManager } from './DatasourceManager';
// Registry
export { DatasourceRegistry, datasourceRegistry } from './DatasourceRegistry';

// Handlers
export { HttpDatasourceHandler, httpDatasourceHandler } from './handlers/HttpDatasourceHandler';
export {
  StaticDatasourceHandler,
  staticDatasourceHandler,
} from './handlers/StaticDatasourceHandler';
export {
  WebSocketDatasourceHandler,
  websocketDatasourceHandler,
} from './handlers/WebSocketDatasourceHandler';

// Register default handlers
import { datasourceRegistry } from './DatasourceRegistry';
import { httpDatasourceHandler } from './handlers/HttpDatasourceHandler';
import { staticDatasourceHandler } from './handlers/StaticDatasourceHandler';
import { websocketDatasourceHandler } from './handlers/WebSocketDatasourceHandler';

// Auto-register HTTP, Static, and WebSocket handlers
datasourceRegistry.register('http', httpDatasourceHandler);
datasourceRegistry.register('static', staticDatasourceHandler);
datasourceRegistry.register('websocket', websocketDatasourceHandler);
