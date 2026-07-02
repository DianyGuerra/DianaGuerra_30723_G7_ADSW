import { Router } from 'express';
import { Mediator } from '../../../application/mediator/Mediator.js';
import { allowRoles, authMiddleware } from '../middlewares/auth.middleware.js';

export function createClientsController(mediator: Mediator) {
  const router = Router();
  router.use(authMiddleware);
  router.use(allowRoles('Admin', 'Empleado'));

  router.get('/', async (req, res, next) => {
    try {
      res.json(await mediator.send('clients.list', req.query));
    } catch (error) { next(error); }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      res.json(await mediator.send('clients.get', { id: req.params.id }));
    } catch (error) { next(error); }
  });

  router.post('/', async (req, res, next) => {
    try {
      res.status(201).json(await mediator.send('clients.create', { ...req.body, createdById: req.auth?.employeeId }));
    } catch (error) { next(error); }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      res.json(await mediator.send('clients.update', { id: req.params.id, ...req.body }));
    } catch (error) { next(error); }
  });

  return router;
}
