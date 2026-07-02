import { Router } from 'express';
import { Mediator } from '../../../application/mediator/Mediator.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export function createCalendarController(mediator: Mediator) {
  const router = Router();
  router.use(authMiddleware);

  router.get('/', async (_req, res, next) => {
    try { res.json(await mediator.send('calendar.list')); }
    catch (error) { next(error); }
  });

  return router;
}
