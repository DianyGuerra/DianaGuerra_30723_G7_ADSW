import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { QuoteRepository } from '../../domain/repositories/QuoteRepository.js';

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(['BLOCKED', 'RELEASED', 'COMPLETED']),
});

export class UpdateReservationStatusHandler implements RequestHandler {
  constructor(private readonly repository: QuoteRepository) {}

  async handle(input: unknown) {
    const { id, status } = schema.parse(input);
    return this.repository.updateReservationStatus(id, status);
  }
}
