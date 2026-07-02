import { Router } from 'express';
import { Mediator } from '../../../application/mediator/Mediator.js';
import { allowRoles, authMiddleware } from '../middlewares/auth.middleware.js';

export function createEmployeesController(mediator: Mediator) {
  const router = Router();
  router.use(authMiddleware);

  router.get('/', allowRoles('Admin'), async (req, res, next) => {
    try { res.json(await mediator.send('employees.list', req.query)); }
    catch (error) { next(error); }
  });

  router.post('/', allowRoles('Admin'), async (req, res, next) => {
    try { res.status(201).json(await mediator.send('employees.create', req.body)); }
    catch (error) { next(error); }
  });

  router.put('/:id', allowRoles('Admin'), async (req, res, next) => {
    try { res.json(await mediator.send('employees.update', { id: req.params.id, ...req.body })); }
    catch (error) { next(error); }
  });

  router.patch('/:id/deactivate', allowRoles('Admin'), async (req, res, next) => {
    try { res.json(await mediator.send('employees.deactivate', { id: req.params.id })); }
    catch (error) { next(error); }
  });

  router.put('/:id/roles', allowRoles('Admin'), async (req, res, next) => {
    try { res.json(await mediator.send('employees.assignRoles', { employeeId: req.params.id, roleIds: req.body.roleIds })); }
    catch (error) { next(error); }
  });

  return router;
}
