import { JwtService } from '../../../infrastructure/services/JwtService.js';
import { HttpError } from '../../../shared/errors/http-error.js';
const jwtService = new JwtService();
export function authMiddleware(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        return next(new HttpError(401, 'Token no enviado.'));
    try {
        req.auth = jwtService.verify(header.slice(7));
        next();
    }
    catch {
        next(new HttpError(401, 'Token inválido o expirado.'));
    }
}
export function allowRoles(...roles) {
    return (req, _res, next) => {
        const userRoles = req.auth?.roles ?? [];
        const allowed = roles.some((role) => userRoles.includes(role));
        if (!allowed)
            return next(new HttpError(403, 'No tienes permisos para este módulo.'));
        next();
    };
}
