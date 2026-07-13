import { z } from 'zod';
import { env } from '../../shared/config/env.js';
import { HttpError } from '../../shared/errors/http-error.js';
const itemSchema = z.object({
    description: z.string().min(2),
    category: z.string().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
});
const schema = z.object({
    id: z.string().uuid(),
    eventDate: z.string().optional(),
    eventType: z.string().min(2),
    packageId: z.string().uuid().optional(),
    childrenCount: z.number().int().positive().optional(),
    customItems: z.array(itemSchema).optional(),
    discount: z.number().nonnegative().default(0),
    notes: z.string().optional(),
});
export class UpdateQuoteHandler {
    repository;
    pricingContext;
    constructor(repository, pricingContext) {
        this.repository = repository;
        this.pricingContext = pricingContext;
    }
    async handle(input) {
        const data = schema.parse(input);
        if (data.eventDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const [y, m, d] = data.eventDate.split('-').map(Number);
            const eventDateObj = new Date(y, m - 1, d);
            if (eventDateObj < today) {
                throw new HttpError(400, 'La fecha del evento no puede ser anterior a la fecha actual.');
            }
        }
        const quote = await this.repository.findById(data.id);
        if (!quote)
            throw new HttpError(404, 'Cotización no encontrada.');
        // Fallback to existing fields in quote if they are not provided in data
        const packageId = data.packageId !== undefined ? data.packageId : quote.packageId;
        const childrenCount = data.childrenCount !== undefined ? data.childrenCount : quote.childrenCount;
        const customItems = packageId === undefined && !data.customItems ? quote.items.map((i) => ({
            description: i.description,
            category: i.category,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
        })) : data.customItems;
        const packageRecord = packageId ? await this.repository.getPackageById(packageId) : undefined;
        const pricing = this.pricingContext.calculate({
            packageRecord,
            childrenCount,
            customItems,
            discount: data.discount,
            taxRate: env.TAX_RATE,
        });
        return this.repository.updateDraft(data.id, {
            ...data,
            packageId,
            childrenCount,
            ...pricing,
        });
    }
}
