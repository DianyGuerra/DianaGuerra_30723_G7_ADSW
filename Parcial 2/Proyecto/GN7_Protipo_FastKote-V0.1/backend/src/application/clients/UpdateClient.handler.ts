import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { ClientRepository } from '../../domain/repositories/ClientRepository.js';
import { HttpError } from '../../shared/errors/http-error.js';

const schema = z.object({
  id: z.string().uuid(),
  type: z.enum(['NATURAL', 'JURIDICAL']).optional(),
  fullName: z.string().min(3).optional(),
  identification: z.string().min(10).max(20).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
  address: z.string().min(3).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  privacyConsent: z.boolean().optional(),
});

export class UpdateClientHandler implements RequestHandler {
  constructor(private readonly repository: ClientRepository) {}

  async handle(input: unknown) {
    const { id, ...data } = schema.parse(input);
    const exists = await this.repository.findById(id);
    if (!exists) throw new HttpError(404, 'Cliente no encontrado.');
    return this.repository.update(id, data);
  }
}
