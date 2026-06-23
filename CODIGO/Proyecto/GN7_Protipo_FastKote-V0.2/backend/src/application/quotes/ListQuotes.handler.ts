import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { QuoteRepository } from '../../domain/repositories/QuoteRepository.js';

const schema = z.object({
  clientId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export class ListQuotesHandler implements RequestHandler {
  constructor(private readonly repository: QuoteRepository) {}

  handle(input: unknown) {
    return this.repository.list(schema.parse(input ?? {}));
  }
}
