import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { config } from './config/index.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { identifyTenant } from './middleware/tenant.js';
import { seedTenants, seedUsers } from './models/seed.js';
import { registerActions } from './models/seedActions.js';
import { seedConfigGovernance } from './models/seedConfigGovernance.js';
import { seedUiConfig } from './models/seedUiConfig.js';
import actionsRouter from './routes/actions.js';
import authRouter from './routes/auth.js';
import configRouter from './routes/config.js';
import tenantsRouter from './routes/tenants.js';
import uiRouter from './routes/ui.js';
import websocketRouter from './routes/websocket.js';
import { websocketServer } from './services/websocketServer.js';

const logger = pino({ level: config.logLevel });
const app = express();

/**
 * Security Middleware
 */
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

/**
 * Logging Middleware
 */
app.use(pinoHttp({ logger }));

/**
 * Rate Limiting
 */
app.use(generalRateLimiter);

/**
 * Body Parsing
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Tenant Identification
 * Identifies tenant from subdomain, domain, or header
 */
app.use(identifyTenant);

/**
 * Routes
 */
app.use('/auth', authRouter);
app.use('/tenants', tenantsRouter);
app.use('/ui', uiRouter);
app.use('/ui/actions', actionsRouter);
app.use('/config', configRouter);
app.use('/ws', websocketRouter);

/**
 * Health Check
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * 404 Handler
 */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Error Handler
 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * Start Server
 */
const server = app.listen(config.port, async () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`CORS origin: ${config.corsOrigin}`);

  // Initialize WebSocket server
  websocketServer.initialize(server);

  // Seed database with test tenants and users
  await seedTenants();
  await seedUsers();

  // Seed UI configurations
  await seedUiConfig();

  // Seed configuration governance rules
  await seedConfigGovernance();

  // Register action handlers
  await registerActions();
});

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  websocketServer.close();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  websocketServer.close();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
