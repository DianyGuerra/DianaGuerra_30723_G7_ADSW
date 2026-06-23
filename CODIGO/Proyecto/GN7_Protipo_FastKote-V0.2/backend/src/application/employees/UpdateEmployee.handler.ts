import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { EmployeeRepository } from '../../domain/repositories/EmployeeRepository.js';
import { HttpError } from '../../shared/errors/http-error.js';

const schema = z.object({
  id: z.string().uuid(),
  identification: z.string().min(10).optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class UpdateEmployeeHandler implements RequestHandler {
  constructor(private readonly repository: EmployeeRepository) {}

  async handle(input: unknown) {
    const { id, ...data } = schema.parse(input);
    const exists = await this.repository.findById(id);
    if (!exists) throw new HttpError(404, 'Empleado no encontrado.');
    return this.repository.update(id, data);
  }
}
