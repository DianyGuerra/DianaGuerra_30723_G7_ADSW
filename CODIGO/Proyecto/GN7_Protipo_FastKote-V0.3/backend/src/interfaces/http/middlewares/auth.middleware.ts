import { NextFunction, Request, Response } from 'express';
import { JwtService, JwtPayload } from '../../../infrastructure/services/JwtService.js';
import { HttpError } from '../../../shared/errors/http-error.js';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

const jwtService = new JwtService();

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new HttpError(401, 'Token no enviado.'));

  try {
    req.auth = jwtService.verify(header.slice(7));
    next();
  } catch {
    next(new HttpError(401, 'Token inválido o expirado.'));
  }
}

export function allowRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRoles = req.auth?.roles ?? [];
    const allowed = roles.some((role) => userRoles.includes(role));
    if (!allowed) return next(new HttpError(403, 'No tienes permisos para este módulo.'));
    next();
  };
}
