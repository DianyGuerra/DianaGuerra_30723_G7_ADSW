import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
export function createCalendarController(mediator) {
    const router = Router();
    router.use(authMiddleware);
    router.get('/', async (_req, res, next) => {
        try {
            res.json(await mediator.send('calendar.list'));
        }
        catch (error) {
            next(error);
        }
    });
    router.patch('/:id/status', async (req, res, next) => {
        try {
            res.json(await mediator.send('calendar.updateStatus', { id: req.params.id, status: req.body.status }));
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
