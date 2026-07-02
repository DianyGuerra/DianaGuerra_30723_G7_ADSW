import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { AuthRepository } from '../../domain/repositories/AuthRepository.js';
import { PasswordHasher } from '../../infrastructure/services/PasswordHasher.js';
import { JwtService } from '../../infrastructure/services/JwtService.js';
import { HttpError } from '../../shared/errors/http-error.js';

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export class LoginUserHandler implements RequestHandler {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async handle(input: unknown) {
    const data = schema.parse(input);
    const user = await this.authRepository.findByUsername(data.username);

    if (!user || !user.isActive || !user.employee || user.employee.status !== 'ACTIVE') {
      throw new HttpError(401, 'Credenciales inválidas o usuario inactivo.');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpError(423, 'Usuario bloqueado temporalmente por intentos fallidos.');
    }

    const valid = await this.passwordHasher.compare(data.password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedAttempts + 1;
      const lockedUntil = attempts >= 3 ? new Date(Date.now() + 5 * 60 * 1000) : null;
      await this.authRepository.registerFailedAttempt(user.id, attempts, lockedUntil);
      throw new HttpError(401, attempts >= 3 ? 'Usuario bloqueado por 5 minutos.' : 'Credenciales inválidas.');
    }

    await this.authRepository.clearFailedAttempts(user.id);
    const roles = user.employee.roles.map((item) => item.role.name);
    const token = this.jwtService.sign({ userId: user.id, employeeId: user.employee.id, username: user.username, roles });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        employeeId: user.employee.id,
        fullName: `${user.employee.firstName} ${user.employee.lastName}`,
        roles,
      },
    };
  }
}
