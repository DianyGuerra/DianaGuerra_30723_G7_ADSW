import { Router } from 'express';
import { Mediator } from '../../../application/mediator/Mediator.js';
import { allowRoles, authMiddleware } from '../middlewares/auth.middleware.js';

export function createPromotionsController(mediator: Mediator) {
  const router = Router();
  router.use(authMiddleware);
  router.use(allowRoles('Admin', 'Empleado'));

  router.get('/', async (_req, res, next) => {
    try { res.json(await mediator.send('promotions.manage', { action: 'list' })); }
    catch (error) { next(error); }
  });

  router.get('/preview', async (_req, res, next) => {
    try { res.json(await mediator.send('promotions.manage', { action: 'preview' })); }
    catch (error) { next(error); }
  });

  router.post('/', async (req, res, next) => {
    try { res.status(201).json(await mediator.send('promotions.manage', { action: 'create', ...req.body })); }
    catch (error) { next(error); }
  });

  router.put('/:id', async (req, res, next) => {
    try { res.json(await mediator.send('promotions.manage', { action: 'update', id: req.params.id, ...req.body })); }
    catch (error) { next(error); }
  });

  router.patch('/:id/toggle', async (req, res, next) => {
    try { res.json(await mediator.send('promotions.manage', { action: 'toggle', id: req.params.id, active: req.body.active })); }
    catch (error) { next(error); }
  });

  router.put('/:id/targets', async (req, res, next) => {
    try { res.json(await mediator.send('promotions.manage', { action: 'targets', id: req.params.id, ...req.body })); }
    catch (error) { next(error); }
  });

  return router;
}