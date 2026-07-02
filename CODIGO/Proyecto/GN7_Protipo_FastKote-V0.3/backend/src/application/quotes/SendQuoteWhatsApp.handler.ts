import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { QuoteRepository } from '../../domain/repositories/QuoteRepository.js';
import { PdfQuoteService } from '../../infrastructure/services/PdfQuoteService.js';
import { WhatsAppGateway } from '../../infrastructure/services/WhatsAppGateway.js';
import { HttpError } from '../../shared/errors/http-error.js';

const schema = z.object({ id: z.string().uuid() });

export class SendQuoteWhatsAppHandler implements RequestHandler {
  constructor(
    private readonly repository: QuoteRepository,
    private readonly pdfService: PdfQuoteService,
    private readonly gateway: WhatsAppGateway,
  ) {}

  async handle(input: unknown) {
    const { id } = schema.parse(input);
    const quote = await this.repository.findById(id);
    if (!quote) throw new HttpError(404, 'Cotización no encontrada.');
    const pdf = await this.pdfService.buildQuotePdf(quote);
    return this.gateway.sendQuoteMessage({
      phone: quote.client.phone,
      quoteCode: quote.code,
      total: String(quote.total),
      pdfBase64: pdf.toString('base64'),
    });
  }
}
