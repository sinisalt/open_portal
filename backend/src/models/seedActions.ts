import pino from 'pino';
import { coreActionHandlers } from '../services/actionHandlers.js';
import { actionRegistry } from '../services/actionRegistry.js';

const logger = pino({ level: 'info' });

/**
 * Register all core action handlers
 */
export async function registerActions(): Promise<void> {
  logger.info('Registering core action handlers...');

  for (const handler of coreActionHandlers) {
    actionRegistry.register(handler);
    logger.info(`Registered action handler: ${handler.id}`);
  }

  logger.info(`Total action handlers registered: ${actionRegistry.getActionIds().length}`);
}
