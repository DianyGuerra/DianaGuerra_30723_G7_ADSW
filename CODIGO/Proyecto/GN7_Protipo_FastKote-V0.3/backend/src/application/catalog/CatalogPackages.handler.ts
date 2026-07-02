import { z } from 'zod';
import { RequestHandler } from '../mediator/Mediator.js';
import { CatalogRepository } from '../../domain/repositories/CatalogRepository.js';
import { HttpError } from '../../shared/errors/http-error.js';

const itemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  category: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  basePrice: z.number().nonnegative().optional(),
});

const schema = z.object({
  action: z.enum(['list', 'detail', 'create', 'update', 'deactivate', 'upsertItem', 'deleteItem']),
  id: z.string().uuid().optional(),
  packageId: z.string().uuid().optional(),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  eventTypes: z.array(z.string()).optional(),
  marginPercent: z.number().nonnegative().optional(),
  active: z.boolean().optional(),
  item: itemSchema.optional(),
  itemId: z.string().uuid().optional(),
});

export class CatalogPackagesHandler implements RequestHandler {
  constructor(private readonly repository: CatalogRepository) {}

  handle(input: unknown) {
    const data = schema.parse(input);
    switch (data.action) {
      case 'list': return this.repository.listPackages();
      case 'detail': {
        if (!data.id) throw new HttpError(400, 'Se requiere el identificador del paquete.');
        return this.repository.getPackageById(data.id);
      }
      case 'create': return this.repository.createPackage(data);
      case 'update': {
        if (!data.id) throw new HttpError(400, 'Se requiere el identificador del paquete.');
        return this.repository.updatePackage(data.id, data);
      }
      case 'deactivate': {
        if (!data.id) throw new HttpError(400, 'Se requiere el identificador del paquete.');
        return this.repository.deactivatePackage(data.id);
      }
      case 'upsertItem': {
        if (!data.packageId || !data.item) throw new HttpError(400, 'Se requiere paquete e ítem.');
        return this.repository.upsertPackageItem(data.packageId, data.item);
      }
      case 'deleteItem': {
        if (!data.itemId) throw new HttpError(400, 'Se requiere el ítem a eliminar.');
        return this.repository.deletePackageItem(data.itemId);
      }
    }
  }
}