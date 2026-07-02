import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { QuoteRepository } from '../../domain/repositories/QuoteRepository.js';
import { PdfQuoteService } from '../../infrastructure/services/PdfQuoteService.js';
import { HttpError } from '../../shared/errors/http-error.js';

const schema = z.object({ id: z.string().uuid() });

export class GenerateQuotePdfHandler implements RequestHandler {
  constructor(private readonly repository: QuoteRepository, private readonly pdfService: PdfQuoteService) {}

  async handle(input: unknown) {
    const { id } = schema.parse(input);
    const quote = await this.repository.findById(id);
    if (!quote) throw new HttpError(404, 'Cotización no encontrada.');
    return this.pdfService.buildQuotePdf(quote);
  }
}
