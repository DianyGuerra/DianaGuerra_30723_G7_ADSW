import jwt from 'jsonwebtoken';
import { env } from '../../shared/config/env.js';

export interface JwtPayload {
  userId: string;
  employeeId?: string;
  username: string;
  roles: string[];
}

export class JwtService {
  sign(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  }

  verify(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }
}
