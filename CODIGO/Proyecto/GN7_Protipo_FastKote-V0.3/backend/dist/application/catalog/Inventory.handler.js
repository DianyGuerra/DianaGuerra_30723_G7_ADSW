import { z } from 'zod';
import { HttpError } from '../../shared/errors/http-error.js';
const schema = z.object({
    action: z.enum(['list', 'create', 'updateCost', 'movement', 'movements']),
    id: z.string().uuid().optional(),
    name: z.string().min(2).optional(),
    unit: z.string().min(1).optional(),
    brand: z.string().optional(),
    currentCost: z.number().nonnegative().optional(),
    stock: z.number().int().optional(),
    newCost: z.number().nonnegative().optional(),
    inventoryItemId: z.string().uuid().optional(),
    quantity: z.number().int().positive().optional(),
    type: z.enum(['IN', 'OUT', 'COST_UPDATE']).optional(),
    notes: z.string().optional(),
});
export class InventoryHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    handle(input) {
        const data = schema.parse(input);
        switch (data.action) {
            case 'list': return this.repository.listInventory();
            case 'create': return this.repository.createInventoryItem(data);
            case 'updateCost': {
                if (!data.id || data.newCost === undefined)
                    throw new HttpError(400, 'Se requiere el insumo y el nuevo costo.');
                return this.repository.updateInventoryCost(data.id, data.newCost);
            }
            case 'movement': {
                if (!data.inventoryItemId || !data.type)
                    throw new HttpError(400, 'Se requiere el insumo y el tipo de movimiento.');
                return this.repository.recordInventoryMovement(data);
            }
            case 'movements':
                return this.repository.listInventoryMovements(data);
        }
    }
}
