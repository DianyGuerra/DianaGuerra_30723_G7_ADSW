export interface CatalogRepository {
  listPackages(): Promise<unknown[]>;
  getPackageById(id: string): Promise<unknown | null>;
  createPackage(data: Record<string, unknown>): Promise<unknown>;
  updatePackage(id: string, data: Record<string, unknown>): Promise<unknown>;
  deactivatePackage(id: string): Promise<unknown>;
  upsertPackageItem(packageId: string, data: Record<string, unknown>): Promise<unknown>;
  deletePackageItem(itemId: string): Promise<unknown>;

  listInventory(): Promise<unknown[]>;
  createInventoryItem(data: Record<string, unknown>): Promise<unknown>;
  updateInventoryCost(id: string, newCost: number): Promise<unknown>;
  recordInventoryMovement(data: Record<string, unknown>): Promise<unknown>;
  listInventoryMovements(filters: Record<string, unknown>): Promise<unknown[]>;

  listServices(): Promise<unknown[]>;
  createService(data: Record<string, unknown>): Promise<unknown>;
  updateService(id: string, data: Record<string, unknown>): Promise<unknown>;
  deactivateService(id: string): Promise<unknown>;
  upsertServiceComponent(serviceId: string, data: Record<string, unknown>): Promise<unknown>;
  deleteServiceComponent(componentId: string): Promise<unknown>;

  listPromotions(): Promise<unknown[]>;
  createPromotion(data: Record<string, unknown>): Promise<unknown>;
  updatePromotion(id: string, data: Record<string, unknown>): Promise<unknown>;
  togglePromotion(id: string, active: boolean): Promise<unknown>;
  setPromotionTargets(id: string, data: Record<string, unknown>): Promise<unknown>;
  listPromotionPreview(): Promise<unknown>;
}