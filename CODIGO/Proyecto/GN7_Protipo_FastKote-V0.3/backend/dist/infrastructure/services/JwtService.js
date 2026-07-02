import jwt from 'jsonwebtoken';
import { env } from '../../shared/config/env.js';
export class JwtService {
    sign(payload) {
        return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    }
    verify(token) {
        return jwt.verify(token, env.JWT_SECRET);
    }
}
