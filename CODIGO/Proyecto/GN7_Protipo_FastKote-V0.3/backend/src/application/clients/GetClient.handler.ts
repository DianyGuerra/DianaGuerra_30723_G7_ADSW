import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { ClientRepository } from '../../domain/repositories/ClientRepository.js';
import { HttpError } from '../../shared/errors/http-error.js';

const schema = z.object({ id: z.string().uuid() });

export class GetClientHandler implements RequestHandler {
  constructor(private readonly repository: ClientRepository) {}

  async handle(input: unknown) {
    const { id } = schema.parse(input);
    const client = await this.repository.findById(id);
    if (!client) throw new HttpError(404, 'Cliente no encontrado.');
    return client;
  }
}
