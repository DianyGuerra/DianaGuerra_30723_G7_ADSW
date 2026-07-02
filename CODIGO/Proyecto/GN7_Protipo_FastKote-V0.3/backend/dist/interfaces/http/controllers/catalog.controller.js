import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
export function createCatalogController(mediator) {
    const router = Router();
    router.use(authMiddleware);
    router.get('/packages', async (_req, res, next) => {
        try {
            res.json(await mediator.send('catalog.manage', { action: 'list' }));
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/packages/:id', async (req, res, next) => {
        try {
            res.json(await mediator.send('catalog.manage', { action: 'detail', id: req.params.id }));
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/packages', async (req, res, next) => {
        try {
            res.status(201).json(await mediator.send('catalog.manage', { action: 'create', ...req.body }));
        }
        catch (error) {
            next(error);
        }
    });
    router.put('/packages/:id', async (req, res, next) => {
        try {
            res.json(await mediator.send('catalog.manage', { action: 'update', id: req.params.id, ...req.body }));
        }
        catch (error) {
            next(error);
        }
    });
    router.patch('/packages/:id/deactivate', async (req, res, next) => {
        try {
            res.json(await mediator.send('catalog.manage', { action: 'deactivate', id: req.params.id }));
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/packages/:id/items', async (req, res, next) => {
        try {
            res.json(await mediator.send('catalog.manage', { action: 'upsertItem', packageId: req.params.id, item: req.body }));
        }
        catch (error) {
            next(error);
        }
    });
    router.delete('/packages/items/:itemId', async (req, res, next) => {
        try {
            res.json(await mediator.send('catalog.manage', { action: 'deleteItem', itemId: req.params.itemId }));
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
