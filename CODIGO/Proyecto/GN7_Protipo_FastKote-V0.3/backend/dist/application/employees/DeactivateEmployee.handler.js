import { z } from 'zod';
import { HttpError } from '../../shared/errors/http-error.js';
const schema = z.object({ id: z.string().uuid() });
export class DeactivateEmployeeHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async handle(input) {
        const { id } = schema.parse(input);
        const exists = await this.repository.findById(id);
        if (!exists)
            throw new HttpError(404, 'Empleado no encontrado.');
        return this.repository.deactivate(id);
    }
}
