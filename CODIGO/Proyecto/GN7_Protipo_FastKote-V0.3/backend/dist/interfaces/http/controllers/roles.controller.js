import { Router } from 'express';
import { allowRoles, authMiddleware } from '../middlewares/auth.middleware.js';
export function createRolesController(mediator) {
    const router = Router();
    router.use(authMiddleware, allowRoles('Admin'));
    router.get('/', async (_req, res, next) => {
        try {
            res.json(await mediator.send('roles.list'));
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
