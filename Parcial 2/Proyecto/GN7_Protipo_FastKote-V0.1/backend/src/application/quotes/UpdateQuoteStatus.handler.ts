import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { QuoteRepository } from '../../domain/repositories/QuoteRepository.js';
import { QuoteStatusContext } from './strategies/status/QuoteStatusContext.js';
import { HttpError } from '../../shared/errors/http-error.js';

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']),
});

export class UpdateQuoteStatusHandler implements RequestHandler {
  constructor(
    private readonly repository: QuoteRepository,
    private readonly statusContext: QuoteStatusContext,
  ) {}

  async handle(input: unknown) {
    const { id, status } = schema.parse(input);
    const original = await this.repository.findById(id);
    if (!original) throw new HttpError(404, 'Cotización no encontrada.');

    const quote = await this.repository.updateStatus(id, status);
    await this.statusContext.apply(this.repository, quote);
    return this.repository.findById(id);
  }
}
