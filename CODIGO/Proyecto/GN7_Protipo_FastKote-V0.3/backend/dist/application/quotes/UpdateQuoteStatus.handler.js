import { z } from 'zod';
import { HttpError } from '../../shared/errors/http-error.js';
const schema = z.object({
    id: z.string().uuid(),
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']),
});
export class UpdateQuoteStatusHandler {
    repository;
    statusContext;
    constructor(repository, statusContext) {
        this.repository = repository;
        this.statusContext = statusContext;
    }
    async handle(input) {
        const { id, status } = schema.parse(input);
        const original = await this.repository.findById(id);
        if (!original)
            throw new HttpError(404, 'Cotización no encontrada.');
        const quote = await this.repository.updateStatus(id, status);
        await this.statusContext.apply(this.repository, quote);
        return this.repository.findById(id);
    }
}
