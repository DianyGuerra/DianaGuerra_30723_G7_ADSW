import { z } from 'zod';
import { env } from '../../shared/config/env.js';
const itemSchema = z.object({
    description: z.string().min(2),
    category: z.string().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
});
const schema = z.object({
    clientId: z.string().uuid(),
    eventDate: z.string(),
    eventType: z.string().min(2),
    packageId: z.string().uuid().optional(),
    childrenCount: z.number().int().positive().optional(),
    customItems: z.array(itemSchema).optional(),
    discount: z.number().nonnegative().default(0),
    notes: z.string().optional(),
    createdById: z.string().uuid().optional(),
});
export class CreateQuoteHandler {
    repository;
    pricingContext;
    constructor(repository, pricingContext) {
        this.repository = repository;
        this.pricingContext = pricingContext;
    }
    async handle(input) {
        const data = schema.parse(input);
        const packageRecord = data.packageId ? await this.repository.getPackageById(data.packageId) : undefined;
        const pricing = this.pricingContext.calculate({
            packageRecord,
            childrenCount: data.childrenCount,
            customItems: data.customItems,
            discount: data.discount,
            taxRate: env.TAX_RATE,
        });
        const now = new Date();
        const validUntil = new Date(now);
        validUntil.setDate(validUntil.getDate() + 15);
        return this.repository.create({
            code: `FK-${now.getFullYear()}-${Date.now().toString().slice(-6)}`,
            clientId: data.clientId,
            eventDate: data.eventDate,
            eventType: data.eventType,
            validUntil,
            notes: data.notes,
            createdById: data.createdById,
            ...pricing,
        });
    }
}
