import { Router } from 'express';
import { allowRoles, authMiddleware } from '../middlewares/auth.middleware.js';
export function createQuotesController(mediator) {
    const router = Router();
    router.use(authMiddleware);
    router.use(allowRoles('Admin', 'Empleado'));
    router.get('/', async (req, res, next) => {
        try {
            res.json(await mediator.send('quotes.list', req.query));
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/', async (req, res, next) => {
        try {
            res.status(201).json(await mediator.send('quotes.create', { ...req.body, createdById: req.auth?.employeeId }));
        }
        catch (error) {
            next(error);
        }
    });
    router.put('/:id', async (req, res, next) => {
        try {
            res.json(await mediator.send('quotes.update', { id: req.params.id, ...req.body }));
        }
        catch (error) {
            next(error);
        }
    });
    router.patch('/:id/status', async (req, res, next) => {
        try {
            res.json(await mediator.send('quotes.updateStatus', { id: req.params.id, status: req.body.status }));
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/:id/pdf', async (req, res, next) => {
        try {
            const pdf = await mediator.send('quotes.pdf', { id: req.params.id });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="cotizacion-${req.params.id}.pdf"`);
            res.end(pdf);
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/:id/send-whatsapp', async (req, res, next) => {
        try {
            res.json(await mediator.send('quotes.sendWhatsapp', { id: req.params.id }));
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
