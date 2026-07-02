import { z } from 'zod';
const schema = z.object({
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
export class ListClientsHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    handle(input) {
        return this.repository.list(schema.parse(input ?? {}));
    }
}
