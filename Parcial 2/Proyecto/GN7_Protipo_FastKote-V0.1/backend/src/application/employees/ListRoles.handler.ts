import { RequestHandler } from '../mediator/Mediator.js';
import { EmployeeRepository } from '../../domain/repositories/EmployeeRepository.js';

export class ListRolesHandler implements RequestHandler {
  constructor(private readonly repository: EmployeeRepository) {}

  handle() {
    return this.repository.listRoles();
  }
}
