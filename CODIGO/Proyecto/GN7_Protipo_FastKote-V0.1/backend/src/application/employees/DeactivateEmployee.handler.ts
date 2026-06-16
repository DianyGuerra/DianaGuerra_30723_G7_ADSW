import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { EmployeeRepository } from '../../domain/repositories/EmployeeRepository.js';
import { HttpError } from '../../shared/errors/http-error.js';

const schema = z.object({ id: z.string().uuid() });

export class DeactivateEmployeeHandler implements RequestHandler {
  constructor(private readonly repository: EmployeeRepository) {}

  async handle(input: unknown) {
    const { id } = schema.parse(input);
    const exists = await this.repository.findById(id);
    if (!exists) throw new HttpError(404, 'Empleado no encontrado.');
    return this.repository.deactivate(id);
  }
}
