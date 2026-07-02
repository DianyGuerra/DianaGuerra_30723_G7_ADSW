import { ZodError } from 'zod';
import { HttpError } from '../../../shared/errors/http-error.js';
export function errorMiddleware(error, _req, res, _next) {
    if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Datos inválidos.', errors: error.flatten() });
    }
    if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message, details: error.details });
    }
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
}
