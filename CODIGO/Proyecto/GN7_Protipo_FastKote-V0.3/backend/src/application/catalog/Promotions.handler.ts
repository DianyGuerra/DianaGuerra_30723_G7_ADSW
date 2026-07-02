import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { CatalogRepository } from '../../domain/repositories/CatalogRepository.js';
import { HttpError } from '../../shared/errors/http-error.js';

const schema = z.object({
  action: z.enum(['list', 'create', 'update', 'toggle', 'targets', 'preview']),
  id: z.string().uuid().optional(),
  name: z.string().min(3).optional(),
  discountPercent: z.number().nonnegative().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  allowedDays: z.array(z.string()).optional(),
  minAmount: z.number().nonnegative().optional(),
  active: z.boolean().optional(),
  packageIds: z.array(z.string().uuid()).optional(),
  serviceIds: z.array(z.string().uuid()).optional(),
});

export class PromotionsHandler implements RequestHandler {
  constructor(private readonly repository: CatalogRepository) {}

  handle(input: unknown) {
    const data = schema.parse(input);
    switch (data.action) {
      case 'list': return this.repository.listPromotions();
      case 'create': return this.repository.createPromotion(data);
      case 'update': {
        if (!data.id) throw new HttpError(400, 'Se requiere el identificador de la promoción.');
        return this.repository.updatePromotion(data.id, data);
      }
      case 'toggle': {
        if (!data.id || typeof data.active !== 'boolean') throw new HttpError(400, 'Se requiere la promoción y el nuevo estado.');
        return this.repository.togglePromotion(data.id, data.active);
      }
      case 'targets': {
        if (!data.id) throw new HttpError(400, 'Se requiere el identificador de la promoción.');
        return this.repository.setPromotionTargets(data.id, data);
      }
      case 'preview': return this.repository.listPromotionPreview();
    }
  }
}