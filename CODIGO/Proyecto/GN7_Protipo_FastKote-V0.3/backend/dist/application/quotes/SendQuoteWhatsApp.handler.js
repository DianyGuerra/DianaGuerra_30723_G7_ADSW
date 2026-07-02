import { z } from 'zod';
import { HttpError } from '../../shared/errors/http-error.js';
const schema = z.object({ id: z.string().uuid() });
export class SendQuoteWhatsAppHandler {
    repository;
    pdfService;
    gateway;
    constructor(repository, pdfService, gateway) {
        this.repository = repository;
        this.pdfService = pdfService;
        this.gateway = gateway;
    }
    async handle(input) {
        const { id } = schema.parse(input);
        const quote = await this.repository.findById(id);
        if (!quote)
            throw new HttpError(404, 'Cotización no encontrada.');
        const pdf = await this.pdfService.buildQuotePdf(quote);
        return this.gateway.sendQuoteMessage({
            phone: quote.client.phone,
            quoteCode: quote.code,
            total: String(quote.total),
            pdfBase64: pdf.toString('base64'),
        });
    }
}
