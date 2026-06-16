import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { QuoteRepository } from '../../domain/repositories/QuoteRepository.js';
import { PricingContext } from './strategies/pricing/PricingContext.js';
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

export class UpdateQuoteHandler implements RequestHandler {
  constructor(private readonly repository: QuoteRepository, private readonly pricingContext: PricingContext) {}

  async handle(input: unknown) {
    const data = schema.parse(input);
    const quote = await this.repository.findById(data.id);
    if (!quote) throw new HttpError(404, 'Cotización no encontrada.');
    if (quote.status !== 'DRAFT') throw new HttpError(409, 'Solo se pueden modificar cotizaciones en estado borrador.');

    const packageRecord = data.packageId ? await this.repository.getPackageById(data.packageId) : undefined;
    const pricing = this.pricingContext.calculate({
      packageRecord,
      childrenCount: data.childrenCount,
      customItems: data.customItems,
      discount: data.discount,
      taxRate: env.TAX_RATE,
    });

    return this.repository.updateDraft(data.id, { ...data, ...pricing });
  }
}
