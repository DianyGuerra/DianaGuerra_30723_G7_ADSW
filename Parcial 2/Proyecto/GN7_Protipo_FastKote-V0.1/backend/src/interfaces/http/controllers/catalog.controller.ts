import { Router } from 'express';
import { Mediator } from '../../../application/mediator/Mediator.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export function createCatalogController(mediator: Mediator) {
  const router = Router();
  router.use(authMiddleware);

  router.get('/packages', async (_req, res, next) => {
    try { res.json(await mediator.send('catalog.packages')); }
    catch (error) { next(error); }
  });

  return router;
}
