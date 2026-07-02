import { z } from 'zod';
import { HttpError } from '../../shared/errors/http-error.js';
const schema = z.object({ id: z.string().uuid() });
export class GetClientHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async handle(input) {
        const { id } = schema.parse(input);
        const client = await this.repository.findById(id);
        if (!client)
            throw new HttpError(404, 'Cliente no encontrado.');
        return client;
    }
}
