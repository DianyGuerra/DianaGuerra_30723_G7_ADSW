import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { EmployeeRepository } from '../../domain/repositories/EmployeeRepository.js';

const schema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class ListEmployeesHandler implements RequestHandler {
  constructor(private readonly repository: EmployeeRepository) {}

  handle(input: unknown) {
    return this.repository.list(schema.parse(input ?? {}));
  }
}
