import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { ClientRepository } from '../../domain/repositories/ClientRepository.js';

const schema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class ListClientsHandler implements RequestHandler {
  constructor(private readonly repository: ClientRepository) {}

  handle(input: unknown) {
    return this.repository.list(schema.parse(input ?? {}));
  }
}
