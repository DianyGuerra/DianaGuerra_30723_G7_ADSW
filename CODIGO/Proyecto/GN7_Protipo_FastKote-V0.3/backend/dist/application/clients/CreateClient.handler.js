import { z } from 'zod';
import { HttpError } from '../../shared/errors/http-error.js';
const schema = z.object({
    type: z.enum(['NATURAL', 'JURIDICAL']).default('NATURAL'),
    fullName: z.string().min(3),
    identification: z.string().min(10).max(20),
    email: z.string().email(),
    phone: z.string().min(7),
    address: z.string().min(3),
    privacyConsent: z.boolean(),
    createdById: z.string().uuid().optional(),
});
export class CreateClientHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async handle(input) {
        const data = schema.parse(input);
        if (!data.privacyConsent) {
            throw new HttpError(400, 'Se requiere consentimiento de tratamiento de datos personales para registrar al cliente.');
        }
        return this.repository.create(data);
    }
}
