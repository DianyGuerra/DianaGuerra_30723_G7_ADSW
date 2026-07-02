import { z } from 'zod';
import { HttpError } from '../../shared/errors/http-error.js';
const schema = z.object({ id: z.string().uuid() });
export class GenerateQuotePdfHandler {
    repository;
    pdfService;
    constructor(repository, pdfService) {
        this.repository = repository;
        this.pdfService = pdfService;
    }
    async handle(input) {
        const { id } = schema.parse(input);
        const quote = await this.repository.findById(id);
        if (!quote)
            throw new HttpError(404, 'Cotización no encontrada.');
        return this.pdfService.buildQuotePdf(quote);
    }
}
