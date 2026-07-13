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

export class CreateQuoteHandler implements RequestHandler {
  constructor(
    private readonly repository: QuoteRepository,
    private readonly pricingContext: PricingContext,
  ) {}

  async handle(input: unknown) {
    const data = schema.parse(input);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = data.eventDate.split('-').map(Number);
    const eventDateObj = new Date(y, m - 1, d);
    if (eventDateObj < today) {
      throw new HttpError(400, 'La fecha del evento no puede ser anterior a la fecha actual.');
    }

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
      packageId: data.packageId,
      childrenCount: data.childrenCount,
      ...pricing,
    });
  }
}
