import { apiFetch } from './http';

export interface PackageItem {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  quantity: number;
  basePrice: string;
}

export interface PackageRecord {
  id: string;
  name: string;
  description: string;
  eventTypes: string[];
  marginPercent: string;
  basePrice?: string;
  pricePerChild?: string;
  minChildren?: number;
  capacityMax?: number;
  active: boolean;
  items: PackageItem[];
  costTotal?: string;
  marginAmount?: string;
  salePrice?: string;
}

export interface InventoryMovement {
  id: string;
  type: 'IN' | 'OUT' | 'COST_UPDATE';
  quantity: number;
  previousCost: string;
  newCost: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  brand?: string;
  currentCost: string;
  stock: number;
  active: boolean;
  movements: InventoryMovement[];
}

export interface ServiceComponent {
  id: string;
  name: string;
  unit?: string;
  quantity: number;
  unitCost: string;
  inventoryItem?: { id: string; name: string } | null;
}

export interface ServiceRecord {
  id: string;
  type: 'SERVICE' | 'PRODUCT';
  name: string;
  description: string;
  suggestedPrice: string;
  active: boolean;
  components: ServiceComponent[];
}

export interface PromotionTargetPackage {
  package: { id: string; name: string };
}

export interface PromotionTargetService {
  service: { id: string; name: string };
}

export interface PromotionRecord {
  id: string;
  name: string;
  discountPercent: string;
  startDate: string;
  endDate: string;
  allowedDays: string[];
  minAmount?: string;
  active: boolean;
  packages: PromotionTargetPackage[];
  services: PromotionTargetService[];
}

export interface PromotionPreviewPackage extends PackageRecord {
  promotionName?: string | null;
  discountPercent?: number;
  discountedPrice?: string;
  savings?: string;
}

export interface PromotionPreviewService {
  id: string;
  type: 'SERVICE' | 'PRODUCT';
  name: string;
  description: string;
  suggestedPrice: string;
  promotionName?: string | null;
  discountPercent?: number;
  discountedPrice?: string;
  savings?: string;
}

export function listPackages() {
  return apiFetch<PackageRecord[]>('/catalog/packages');
}

export function getPackage(id: string) {
  return apiFetch<PackageRecord>(`/catalog/packages/${id}`);
}

export function createPackage(payload: unknown) {
  return apiFetch<PackageRecord>('/catalog/packages', { method: 'POST', body: JSON.stringify(payload) });
}

export function updatePackage(id: string, payload: unknown) {
  return apiFetch<PackageRecord>(`/catalog/packages/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deactivatePackage(id: string) {
  return apiFetch<PackageRecord>(`/catalog/packages/${id}/deactivate`, { method: 'PATCH' });
}

export function upsertPackageItem(packageId: string, payload: unknown) {
  return apiFetch<PackageRecord>(`/catalog/packages/${packageId}/items`, { method: 'POST', body: JSON.stringify(payload) });
}

export function deletePackageItem(itemId: string) {
  return apiFetch<PackageRecord>(`/catalog/packages/items/${itemId}`, { method: 'DELETE' });
}

export function listInventory() {
  return apiFetch<InventoryItem[]>('/inventory/items');
}

export function createInventoryItem(payload: unknown) {
  return apiFetch<InventoryItem>('/inventory/items', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateInventoryCost(id: string, newCost: number) {
  return apiFetch<InventoryItem>(`/inventory/items/${id}/cost`, { method: 'PATCH', body: JSON.stringify({ newCost }) });
}

export function createInventoryMovement(id: string, payload: unknown) {
  return apiFetch<InventoryItem>(`/inventory/items/${id}/movements`, { method: 'POST', body: JSON.stringify(payload) });
}

export function listInventoryMovements() {
  return apiFetch<InventoryMovement[]>('/inventory/movements');
}

export function listServices() {
  return apiFetch<ServiceRecord[]>('/services');
}

export function createService(payload: unknown) {
  return apiFetch<ServiceRecord>('/services', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateService(id: string, payload: unknown) {
  return apiFetch<ServiceRecord>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deactivateService(id: string) {
  return apiFetch<ServiceRecord>(`/services/${id}/deactivate`, { method: 'PATCH' });
}

export function upsertServiceComponent(id: string, payload: unknown) {
  return apiFetch<ServiceRecord>(`/services/${id}/components`, { method: 'POST', body: JSON.stringify(payload) });
}

export function deleteServiceComponent(componentId: string) {
  return apiFetch<ServiceRecord>(`/services/components/${componentId}`, { method: 'DELETE' });
}

export function listPromotions() {
  return apiFetch<PromotionRecord[]>('/promotions');
}

export function createPromotion(payload: unknown) {
  return apiFetch<PromotionRecord>('/promotions', { method: 'POST', body: JSON.stringify(payload) });
}

export function updatePromotion(id: string, payload: unknown) {
  return apiFetch<PromotionRecord>(`/promotions/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function togglePromotion(id: string, active: boolean) {
  return apiFetch<PromotionRecord>(`/promotions/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ active }) });
}

export function setPromotionTargets(id: string, payload: unknown) {
  return apiFetch<PromotionRecord>(`/promotions/${id}/targets`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function listPromotionPreview() {
  return apiFetch<{ packages: PromotionPreviewPackage[]; services: PromotionPreviewService[] }>('/promotions/preview');
}