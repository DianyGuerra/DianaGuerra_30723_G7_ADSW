import { Router } from 'express';
import { allowRoles, authMiddleware } from '../middlewares/auth.middleware.js';
export function createServicesController(mediator) {
    const router = Router();
    router.use(authMiddleware);
    router.use(allowRoles('Admin', 'Empleado'));
    router.get('/', async (_req, res, next) => {
        try {
            res.json(await mediator.send('services.manage', { action: 'list' }));
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/', async (req, res, next) => {
        try {
            res.status(201).json(await mediator.send('services.manage', { action: 'create', ...req.body }));
        }
        catch (error) {
            next(error);
        }
    });
    router.put('/:id', async (req, res, next) => {
        try {
            res.json(await mediator.send('services.manage', { action: 'update', id: req.params.id, ...req.body }));
        }
        catch (error) {
            next(error);
        }
    });
    router.patch('/:id/deactivate', async (req, res, next) => {
        try {
            res.json(await mediator.send('services.manage', { action: 'deactivate', id: req.params.id }));
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/:id/components', async (req, res, next) => {
        try {
            res.json(await mediator.send('services.manage', { action: 'upsertComponent', id: req.params.id, component: req.body }));
        }
        catch (error) {
            next(error);
        }
    });
    router.delete('/components/:componentId', async (req, res, next) => {
        try {
            res.json(await mediator.send('services.manage', { action: 'deleteComponent', componentId: req.params.componentId }));
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
