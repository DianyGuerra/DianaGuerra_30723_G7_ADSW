import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { CatalogRepository } from '../../domain/repositories/CatalogRepository.js';
import { HttpError } from '../../shared/errors/http-error.js';

const componentSchema = z.object({
  id: z.string().uuid().optional(),
  inventoryItemId: z.string().uuid().optional(),
  name: z.string().min(2),
  unit: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  unitCost: z.number().nonnegative().optional(),
});

const schema = z.object({
  action: z.enum(['list', 'create', 'update', 'deactivate', 'upsertComponent', 'deleteComponent']),
  id: z.string().uuid().optional(),
  type: z.enum(['SERVICE', 'PRODUCT']).optional(),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  suggestedPrice: z.number().nonnegative().optional(),
  active: z.boolean().optional(),
  component: componentSchema.optional(),
  componentId: z.string().uuid().optional(),
});

export class ServicesHandler implements RequestHandler {
  constructor(private readonly repository: CatalogRepository) {}

  handle(input: unknown) {
    const data = schema.parse(input);
    switch (data.action) {
      case 'list': return this.repository.listServices();
      case 'create': return this.repository.createService(data);
      case 'update': {
        if (!data.id) throw new HttpError(400, 'Se requiere el identificador del servicio o producto.');
        return this.repository.updateService(data.id, data);
      }
      case 'deactivate': {
        if (!data.id) throw new HttpError(400, 'Se requiere el identificador del servicio o producto.');
        return this.repository.deactivateService(data.id);
      }
      case 'upsertComponent': {
        if (!data.id || !data.component) throw new HttpError(400, 'Se requiere el servicio y el componente.');
        return this.repository.upsertServiceComponent(data.id, data.component);
      }
      case 'deleteComponent': {
        if (!data.componentId) throw new HttpError(400, 'Se requiere el componente a eliminar.');
        return this.repository.deleteServiceComponent(data.componentId);
      }
    }
  }
}