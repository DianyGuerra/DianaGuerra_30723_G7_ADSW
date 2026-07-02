import { Router } from 'express';
export function createAuthController(mediator) {
    const router = Router();
    router.post('/login', async (req, res, next) => {
        try {
            const result = await mediator.send('auth.login', req.body);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
