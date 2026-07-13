import { z } from 'zod';
const schema = z.object({
    id: z.string().uuid(),
    status: z.enum(['BLOCKED', 'RELEASED', 'COMPLETED']),
});
export class UpdateReservationStatusHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async handle(input) {
        const { id, status } = schema.parse(input);
        return this.repository.updateReservationStatus(id, status);
    }
}
