import { z } from 'zod';
const schema = z.object({
    clientId: z.string().uuid().optional(),
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
});
export class ListQuotesHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    handle(input) {
        return this.repository.list(schema.parse(input ?? {}));
    }
}
