import { prisma } from '../../shared/prisma/prisma.js';
import { CatalogRepository } from '../../domain/repositories/CatalogRepository.js';
import { HttpError } from '../../shared/errors/http-error.js';

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function formatMoney(value: number) {
  return Number(value.toFixed(2));
}

function packageFinancials(record: any) {
  const items = record.items ?? [];
  const costTotal = formatMoney(items.reduce((sum: number, item: any) => sum + toNumber(item.basePrice) * Number(item.quantity ?? 1), 0));
  const minPrice = toNumber(record.minPrice ?? 0);
  const marginPercent = toNumber(record.marginPercent ?? 0);
  const marginAmount = formatMoney(costTotal * (marginPercent / 100));
  const salePrice = formatMoney(minPrice + costTotal + marginAmount);

  return {
    ...record,
    minPrice: minPrice.toFixed(2),
    basePrice: salePrice.toFixed(2),
    marginPercent: marginPercent.toFixed(2),
    costTotal: costTotal.toFixed(2),
    marginAmount: marginAmount.toFixed(2),
    salePrice: salePrice.toFixed(2),
  };
}

function isPromotionActive(promotion: any) {
  const now = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);
  if (!promotion.active) return false;
  if (now < startDate || now > endDate) return false;
  if (promotion.allowedDays?.length) {
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    if (!promotion.allowedDays.includes(currentDay)) return false;
  }
  return true;
}

function targetMatchesPromotion(promotion: any, targetType: 'PACKAGE' | 'SERVICE', targetId: string) {
  const collection = targetType === 'PACKAGE' ? promotion.packages : promotion.services;
  return collection?.some((item: any) => (targetType === 'PACKAGE' ? item.packageId : item.serviceId) === targetId);
}

export class PrismaCatalogRepository implements CatalogRepository {
  private syncPackagePrice(packageId: string) {
    return prisma.catalogPackage.findUnique({ where: { id: packageId }, include: { items: true } }).then((record: any) => {
      if (!record) return null;
      if (record.pricePerChild) return record;
      const minPrice = toNumber(record.minPrice ?? 0);
      const totalCost = record.items.reduce((sum: number, item: any) => sum + toNumber(item.basePrice) * Number(item.quantity ?? 1), 0);
      const marginPercent = toNumber(record.marginPercent ?? 0);
      const salePrice = formatMoney(minPrice + totalCost + (totalCost * marginPercent / 100));
      return prisma.catalogPackage.update({ where: { id: packageId }, data: { basePrice: salePrice } });
    });
  }

  async listPackages() {
    const records = await prisma.catalogPackage.findMany({
      orderBy: { name: 'asc' },
      include: { items: true, promotions: true },
    });
    return records.map((record: any) => packageFinancials(record));
  }

  async getPackageById(id: string) {
    const record = await prisma.catalogPackage.findUnique({
      where: { id },
      include: { items: true, promotions: { include: { promotion: true } } },
    });
    return record ? packageFinancials(record) : null;
  }

  async createPackage(data: Record<string, unknown>) {
    const created = await prisma.catalogPackage.create({
      data: {
        name: String(data.name),
        description: String(data.description ?? ''),
        eventTypes: Array.isArray(data.eventTypes) ? data.eventTypes as string[] : [],
        marginPercent: Number(data.marginPercent ?? 0),
        minPrice: Number(data.minPrice ?? 0),
        active: data.active !== false,
      },
    });
    return this.getPackageById(created.id);
  }

  async updatePackage(id: string, data: Record<string, unknown>) {
    await prisma.catalogPackage.update({
      where: { id },
      data: {
        name: data.name ? String(data.name) : undefined,
        description: data.description !== undefined ? String(data.description) : undefined,
        eventTypes: Array.isArray(data.eventTypes) ? data.eventTypes as string[] : undefined,
        marginPercent: data.marginPercent !== undefined ? Number(data.marginPercent) : undefined,
        minPrice: data.minPrice !== undefined ? Number(data.minPrice) : undefined,
        active: typeof data.active === 'boolean' ? data.active : undefined,
      },
    });
    await this.syncPackagePrice(id);
    return this.getPackageById(id);
  }

  async deactivatePackage(id: string) {
    await prisma.catalogPackage.update({ where: { id }, data: { active: false } });
    return this.getPackageById(id);
  }

  async upsertPackageItem(packageId: string, data: Record<string, unknown>) {
    if (data.id) {
      await prisma.catalogItem.update({
        where: { id: String(data.id) },
        data: {
          name: data.name ? String(data.name) : undefined,
          category: data.category !== undefined ? String(data.category) : undefined,
          unit: data.unit !== undefined ? String(data.unit) : undefined,
          quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
          basePrice: data.basePrice !== undefined ? Number(data.basePrice) : undefined,
          inventoryItemId: data.inventoryItemId !== undefined ? (data.inventoryItemId as string | null) : undefined,
          serviceId: data.serviceId !== undefined ? (data.serviceId as string | null) : undefined,
          packageId,
        },
      });
    } else {
      await prisma.catalogItem.create({
        data: {
          packageId,
          name: String(data.name),
          category: data.category ? String(data.category) : null,
          unit: data.unit ? String(data.unit) : null,
          quantity: Number(data.quantity ?? 1),
          basePrice: Number(data.basePrice ?? 0),
          inventoryItemId: data.inventoryItemId ? String(data.inventoryItemId) : null,
          serviceId: data.serviceId ? String(data.serviceId) : null,
        },
      });
    }
    await this.syncPackagePrice(packageId);
    return this.getPackageById(packageId);
  }

  async deletePackageItem(itemId: string) {
    const item = await prisma.catalogItem.findUnique({ where: { id: itemId } });
    if (!item?.packageId) return null;
    await prisma.catalogItem.delete({ where: { id: itemId } });
    await this.syncPackagePrice(item.packageId);
    return this.getPackageById(item.packageId);
  }

  async listInventory() {
    return prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' },
      include: { movements: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async createInventoryItem(data: Record<string, unknown>) {
    return prisma.inventoryItem.create({
      data: {
        name: String(data.name),
        unit: String(data.unit),
        brand: data.brand ? String(data.brand) : null,
        currentCost: Number(data.currentCost ?? 0),
        stock: Number(data.stock ?? 0),
      },
      include: { movements: true },
    });
  }

  async updateInventoryCost(id: string, newCost: number) {
    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) return null;
    await prisma.inventoryMovement.create({
      data: {
        inventoryItemId: id,
        type: 'COST_UPDATE',
        quantity: 0,
        previousCost: item.currentCost,
        newCost,
      },
    });
    return prisma.inventoryItem.update({ where: { id }, data: { currentCost: newCost }, include: { movements: { orderBy: { createdAt: 'desc' } } } });
  }

  async recordInventoryMovement(data: Record<string, unknown>) {
    const item = await prisma.inventoryItem.findUnique({ where: { id: String(data.inventoryItemId) } });
    if (!item) return null;
    const movementType = String(data.type);
    const quantity = Number(data.quantity ?? 0);
    const nextStock = movementType === 'OUT' ? item.stock - quantity : item.stock + quantity;
    await prisma.inventoryMovement.create({
      data: {
        inventoryItemId: item.id,
        type: movementType as any,
        quantity,
        previousCost: item.currentCost,
        newCost: Number(data.newCost ?? item.currentCost),
        notes: data.notes ? String(data.notes) : null,
      },
    });
    return prisma.inventoryItem.update({ where: { id: item.id }, data: { stock: nextStock, currentCost: data.newCost !== undefined ? Number(data.newCost) : undefined }, include: { movements: { orderBy: { createdAt: 'desc' } } } });
  }

  async listInventoryMovements(filters: Record<string, unknown>) {
    return prisma.inventoryMovement.findMany({
      where: filters.inventoryItemId ? { inventoryItemId: String(filters.inventoryItemId) } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { inventoryItem: true },
    });
  }

  async listServices() {
    return prisma.serviceCatalog.findMany({
      orderBy: { name: 'asc' },
      include: { components: { include: { inventoryItem: true } }, promotions: true },
    });
  }

  async createService(data: Record<string, unknown>) {
    return prisma.serviceCatalog.create({
      data: {
        type: String(data.type).toUpperCase() as any,
        name: String(data.name),
        description: String(data.description ?? ''),
        suggestedPrice: Number(data.suggestedPrice ?? 0),
        active: data.active !== false,
      },
      include: { components: true },
    });
  }

  async updateService(id: string, data: Record<string, unknown>) {
    return prisma.serviceCatalog.update({
      where: { id },
      data: {
        type: data.type ? String(data.type).toUpperCase() as any : undefined,
        name: data.name ? String(data.name) : undefined,
        description: data.description !== undefined ? String(data.description) : undefined,
        suggestedPrice: data.suggestedPrice !== undefined ? Number(data.suggestedPrice) : undefined,
        active: typeof data.active === 'boolean' ? data.active : undefined,
      },
      include: { components: { include: { inventoryItem: true } } },
    });
  }

  async deactivateService(id: string) {
    return prisma.serviceCatalog.update({ where: { id }, data: { active: false }, include: { components: true } });
  }

  async upsertServiceComponent(serviceId: string, data: Record<string, unknown>) {
    const payload = {
      inventoryItemId: data.inventoryItemId ? String(data.inventoryItemId) : null,
      name: String(data.name),
      unit: data.unit ? String(data.unit) : null,
      quantity: Number(data.quantity ?? 1),
      unitCost: Number(data.unitCost ?? 0),
      serviceId,
    };
    if (data.id) {
      await prisma.serviceRecipeComponent.update({ where: { id: String(data.id) }, data: payload });
    } else {
      await prisma.serviceRecipeComponent.create({ data: payload });
    }
    return prisma.serviceCatalog.findUnique({ where: { id: serviceId }, include: { components: { include: { inventoryItem: true } } } });
  }

  async deleteServiceComponent(componentId: string) {
    const component = await prisma.serviceRecipeComponent.findUnique({ where: { id: componentId } });
    if (!component) return null;
    await prisma.serviceRecipeComponent.delete({ where: { id: componentId } });
    return prisma.serviceCatalog.findUnique({ where: { id: component.serviceId }, include: { components: { include: { inventoryItem: true } } } });
  }

  async listPromotions() {
    return prisma.promotion.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        packages: { include: { package: true } },
        services: { include: { service: true } },
      },
    });
  }

  async createPromotion(data: Record<string, unknown>) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.startDate) {
      const [sy, sm, sd] = String(data.startDate).split('-').map(Number);
      const start = new Date(sy, sm - 1, sd);
      if (start < today) {
        throw new HttpError(400, 'La fecha de inicio de la promoción no puede ser anterior a la fecha actual.');
      }
    }
    if (data.endDate) {
      const [ey, em, ed] = String(data.endDate).split('-').map(Number);
      const end = new Date(ey, em - 1, ed);
      if (end < today) {
        throw new HttpError(400, 'La fecha de fin de la promoción no puede ser anterior a la fecha actual.');
      }
    }

    const promotion = await prisma.promotion.create({
      data: {
        name: String(data.name),
        discountPercent: Number(data.discountPercent),
        startDate: new Date(String(data.startDate)),
        endDate: new Date(String(data.endDate)),
        allowedDays: Array.isArray(data.allowedDays) ? data.allowedDays as string[] : [],
        minAmount: data.minAmount !== undefined && data.minAmount !== '' ? Number(data.minAmount) : null,
        active: data.active !== false,
      },
    });
    if (data.packageIds || data.serviceIds) {
      await this.setPromotionTargets(promotion.id, data);
    }
    return prisma.promotion.findUnique({
      where: { id: promotion.id },
      include: { packages: { include: { package: true } }, services: { include: { service: true } } },
    });
  }

  async updatePromotion(id: string, data: Record<string, unknown>) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.startDate) {
      const [sy, sm, sd] = String(data.startDate).split('-').map(Number);
      const start = new Date(sy, sm - 1, sd);
      const existing = await prisma.promotion.findUnique({ where: { id } });
      if (existing) {
        const existingStr = existing.startDate.toISOString().slice(0, 10);
        if (String(data.startDate) !== existingStr && start < today) {
          throw new HttpError(400, 'La fecha de inicio de la promoción no puede ser anterior a la fecha actual.');
        }
      }
    }
    if (data.endDate) {
      const [ey, em, ed] = String(data.endDate).split('-').map(Number);
      const end = new Date(ey, em - 1, ed);
      const existing = await prisma.promotion.findUnique({ where: { id } });
      if (existing) {
        const existingStr = existing.endDate.toISOString().slice(0, 10);
        if (String(data.endDate) !== existingStr && end < today) {
          throw new HttpError(400, 'La fecha de fin de la promoción no puede ser anterior a la fecha actual.');
        }
      }
    }

    await prisma.promotion.update({
      where: { id },
      data: {
        name: data.name ? String(data.name) : undefined,
        discountPercent: data.discountPercent !== undefined ? Number(data.discountPercent) : undefined,
        startDate: data.startDate ? new Date(String(data.startDate)) : undefined,
        endDate: data.endDate ? new Date(String(data.endDate)) : undefined,
        allowedDays: Array.isArray(data.allowedDays) ? data.allowedDays as string[] : undefined,
        minAmount: data.minAmount !== undefined && data.minAmount !== '' ? Number(data.minAmount) : undefined,
        active: typeof data.active === 'boolean' ? data.active : undefined,
      },
    });
    if (data.packageIds || data.serviceIds) {
      await this.setPromotionTargets(id, data);
    }
    return prisma.promotion.findUnique({
      where: { id },
      include: { packages: { include: { package: true } }, services: { include: { service: true } } },
    });
  }

  async togglePromotion(id: string, active: boolean) {
    return prisma.promotion.update({
      where: { id },
      data: { active },
      include: { packages: { include: { package: true } }, services: { include: { service: true } } },
    });
  }

  async setPromotionTargets(id: string, data: Record<string, unknown>) {
    await prisma.promotionPackage.deleteMany({ where: { promotionId: id } });
    await prisma.promotionService.deleteMany({ where: { promotionId: id } });
    const packageIds = Array.isArray(data.packageIds) ? data.packageIds as string[] : [];
    const serviceIds = Array.isArray(data.serviceIds) ? data.serviceIds as string[] : [];
    if (packageIds.length) {
      await prisma.promotionPackage.createMany({ data: packageIds.map((packageId) => ({ promotionId: id, packageId })) });
    }
    if (serviceIds.length) {
      await prisma.promotionService.createMany({ data: serviceIds.map((serviceId) => ({ promotionId: id, serviceId })) });
    }
    return prisma.promotion.findUnique({
      where: { id },
      include: { packages: { include: { package: true } }, services: { include: { service: true } } },
    });
  }

  async listPromotionPreview() {
    const promotions = await prisma.promotion.findMany({
      include: {
        packages: { include: { package: { include: { items: true } } } },
        services: { include: { service: true } },
      },
    });

    const packages = await prisma.catalogPackage.findMany({ include: { items: true } });
    const services = await prisma.serviceCatalog.findMany();

    const packagePreview = packages.map((record: any) => {
      const financials = packageFinancials(record);
      const promotion = promotions.find((candidate: any) => isPromotionActive(candidate) && targetMatchesPromotion(candidate, 'PACKAGE', record.id));
      const discountPercent = promotion ? toNumber(promotion.discountPercent) : 0;
      const baseVal = record.pricePerChild ? toNumber(record.pricePerChild) : toNumber(financials.salePrice);
      const discountedPrice = formatMoney(baseVal * (1 - discountPercent / 100));
      return {
        ...financials,
        promotionName: promotion?.name ?? null,
        discountPercent,
        discountedPrice: discountedPrice.toFixed(2),
        savings: formatMoney(baseVal - discountedPrice).toFixed(2),
      };
    });

    const servicePreview = services.map((record: any) => {
      const promotion = promotions.find((candidate: any) => isPromotionActive(candidate) && targetMatchesPromotion(candidate, 'SERVICE', record.id));
      const discountPercent = promotion ? toNumber(promotion.discountPercent) : 0;
      const discountedPrice = formatMoney(toNumber(record.suggestedPrice) * (1 - discountPercent / 100));
      return {
        ...record,
        promotionName: promotion?.name ?? null,
        discountPercent,
        discountedPrice: discountedPrice.toFixed(2),
        savings: formatMoney(toNumber(record.suggestedPrice) - discountedPrice).toFixed(2),
      };
    });

    return { packages: packagePreview, services: servicePreview };
  }
}