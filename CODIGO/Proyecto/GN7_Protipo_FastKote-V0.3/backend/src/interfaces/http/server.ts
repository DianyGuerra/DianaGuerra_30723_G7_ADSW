import cors from 'cors';
import express from 'express';
import { env } from '../../shared/config/env.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { createMediator } from './createMediator.js';
import { createAuthController } from './controllers/auth.controller.js';
import { createClientsController } from './controllers/clients.controller.js';
import { createEmployeesController } from './controllers/employees.controller.js';
import { createRolesController } from './controllers/roles.controller.js';
import { createQuotesController } from './controllers/quotes.controller.js';
import { createCalendarController } from './controllers/calendar.controller.js';
import { createCatalogController } from './controllers/catalog.controller.js';
import { createInventoryController } from './controllers/inventory.controller.js';
import { createServicesController } from './controllers/services.controller.js';
import { createPromotionsController } from './controllers/promotions.controller.js';

export function createServer() {
  const app = express();
  const mediator = createMediator();

  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(express.json({ limit: '10mb' }));

  app.get('/api', (_req, res) => res.json({ status: 'ok', service: 'FastKote API' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'FastKote API' }));
  app.use('/api/auth', createAuthController(mediator));
  app.use('/api/clients', createClientsController(mediator));
  app.use('/api/employees', createEmployeesController(mediator));
  app.use('/api/roles', createRolesController(mediator));
  app.use('/api/quotes', createQuotesController(mediator));
  app.use('/api/calendar', createCalendarController(mediator));
  app.use('/api/catalog', createCatalogController(mediator));
  app.use('/api/inventory', createInventoryController(mediator));
  app.use('/api/services', createServicesController(mediator));
  app.use('/api/promotions', createPromotionsController(mediator));

  app.use(errorMiddleware);
  return app;
}
