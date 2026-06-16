import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { EmployeeRepository } from '../../domain/repositories/EmployeeRepository.js';

const schema = z.object({
  employeeId: z.string().uuid(),
  roleIds: z.array(z.string().uuid()).default([]),
});

export class AssignRolesHandler implements RequestHandler {
  constructor(private readonly repository: EmployeeRepository) {}

  handle(input: unknown) {
    const data = schema.parse(input);
    return this.repository.assignRoles(data.employeeId, data.roleIds);
  }
}
