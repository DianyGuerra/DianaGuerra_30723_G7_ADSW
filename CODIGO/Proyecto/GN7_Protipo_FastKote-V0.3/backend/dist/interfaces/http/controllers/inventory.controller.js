import { Router } from 'express';
import { allowRoles, authMiddleware } from '../middlewares/auth.middleware.js';
export function createInventoryController(mediator) {
    const router = Router();
    router.use(authMiddleware);
    router.use(allowRoles('Admin', 'Empleado'));
    router.get('/items', async (_req, res, next) => {
        try {
            res.json(await mediator.send('inventory.manage', { action: 'list' }));
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/items', async (req, res, next) => {
        try {
            res.status(201).json(await mediator.send('inventory.manage', { action: 'create', ...req.body }));
        }
        catch (error) {
            next(error);
        }
    });
    router.patch('/items/:id/cost', async (req, res, next) => {
        try {
            res.json(await mediator.send('inventory.manage', { action: 'updateCost', id: req.params.id, newCost: req.body.newCost }));
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/items/:id/movements', async (req, res, next) => {
        try {
            res.json(await mediator.send('inventory.manage', { action: 'movement', inventoryItemId: req.params.id, ...req.body }));
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/movements', async (req, res, next) => {
        try {
            res.json(await mediator.send('inventory.manage', { action: 'movements', ...req.query }));
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
