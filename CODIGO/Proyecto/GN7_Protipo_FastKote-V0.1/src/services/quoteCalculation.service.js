import { TAX_RATE } from "../models/businessRules.model";

export const currency = (value) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(Number(value) || 0);

export const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const getById = (items, id) => items.find((item) => item.id === id);

export const isActive = (item) => item?.state === "Activo";

export const isBaseQuote = (quote) => (quote?.quoteType || "Base") === "Base";

export function computeServiceCost(service, supplies) {
  return roundMoney(
    (service.recipe || []).reduce((total, item) => {
      const supply = getById(supplies, item.supplyId);
      if (!isActive(supply)) return total;
      return total + supply.cost * Number(item.qty || 0);
    }, 0),
  );
}

export function computePackageCost(packageItem, services, supplies) {
  return roundMoney(
    (packageItem.items || []).reduce((total, item) => {
      const service = getById(services, item.serviceId);
      if (!isActive(service)) return total;
      return total + computeServiceCost(service, supplies) * Number(item.qty || 0);
    }, 0),
  );
}

export function computePackagePrice(packageItem, services, supplies) {
  if (Number(packageItem?.price || 0) > 0) return roundMoney(packageItem.price);
  const cost = computePackageCost(packageItem, services, supplies);
  return roundMoney(cost * (1 + Number(packageItem.margin || 0) / 100));
}

export function getActivePromotion(promotions, packageId, eventDate, subtotal = 0) {
  if (!packageId) return null;

  return promotions.find((promotion) => {
    const inDateRange = !eventDate || (eventDate >= promotion.startDate && eventDate <= promotion.endDate);
    const minAmount = Number(promotion.minAmount || 0);
    return isActive(promotion) && promotion.packageIds.includes(packageId) && inDateRange && subtotal >= minAmount;
  });
}

function getPackageItemDetails(packageItem, services) {
  return (packageItem?.items || [])
    .map((item) => {
      const service = getById(services, item.serviceId);
      if (!isActive(service)) return null;
      const qty = Number(item.qty || 0);
      return {
        serviceId: service.id,
        name: service.name,
        type: service.type,
        qty,
        unitPrice: service.price,
        subtotal: roundMoney(service.price * qty),
      };
    })
    .filter(Boolean);
}

export function getCustomItemDetails(customItems = [], services) {
  return customItems
    .map((item) => {
      const service = getById(services, item.serviceId);
      if (!isActive(service)) return null;
      const qty = Number(item.qty || 0);
      if (qty <= 0) return null;
      const unitPrice = Number(item.unitPrice ?? service.price);
      return {
        serviceId: service.id,
        name: service.name,
        type: service.type,
        qty,
        unitPrice,
        subtotal: roundMoney(unitPrice * qty),
      };
    })
    .filter(Boolean);
}

export function getQuoteBreakdown(quote, packages, services, supplies, promotions) {
  if (quote.calculationSnapshot) return quote.calculationSnapshot;

  if (!isBaseQuote(quote)) {
    const customItemDetails = getCustomItemDetails(quote.customItems || quote.addons || [], services);
    const sourcePackage = getById(packages, quote.sourcePackageId);
    const subtotal = roundMoney(customItemDetails.reduce((total, item) => total + item.subtotal, 0));
    const tax = roundMoney(subtotal * TAX_RATE);

    return {
      quoteType: "Personalizada",
      personalizationMode: quote.personalizationMode || "Desde cero",
      sourcePackageId: quote.sourcePackageId || null,
      sourcePackageSnapshot: sourcePackage
        ? {
            packageId: sourcePackage.id,
            name: sourcePackage.name,
            desc: sourcePackage.desc,
            price: computePackagePrice(sourcePackage, services, supplies),
            state: sourcePackage.state,
          }
        : null,
      packageSnapshot: null,
      packageItemDetails: [],
      customItemDetails,
      base: 0,
      customTotal: subtotal,
      subtotal,
      promotion: null,
      discount: 0,
      tax,
      total: roundMoney(subtotal + tax),
    };
  }

  const packageItem = getById(packages, quote.packageId);
  const packageIsUsable = isActive(packageItem);
  const base = packageIsUsable ? computePackagePrice(packageItem, services, supplies) : 0;
  const subtotal = roundMoney(base);
  const promotion = packageIsUsable ? getActivePromotion(promotions, quote.packageId, quote.eventDate, subtotal) : null;
  const discount = promotion ? roundMoney((subtotal * promotion.discountPercent) / 100) : 0;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = roundMoney(taxable * TAX_RATE);

  return {
    quoteType: "Base",
    personalizationMode: null,
    sourcePackageId: null,
    sourcePackageSnapshot: null,
    packageSnapshot: packageItem
      ? {
          packageId: packageItem.id,
          name: packageItem.name,
          desc: packageItem.desc,
          margin: packageItem.margin,
          state: packageItem.state,
          price: base,
        }
      : null,
    packageItemDetails: getPackageItemDetails(packageItem, services),
    customItemDetails: [],
    base,
    customTotal: 0,
    subtotal,
    promotion,
    discount,
    tax,
    total: roundMoney(taxable + tax),
  };
}

function buildEventSnapshot(quoteData) {
  return {
    eventType: quoteData.eventType,
    guestCount: Number(quoteData.guestCount || 0),
    estimatedBudget: quoteData.estimatedBudget === "" || quoteData.estimatedBudget == null ? null : Number(quoteData.estimatedBudget),
    eventLocation: quoteData.eventLocation,
    responsibleName: quoteData.responsibleName,
    theme: quoteData.theme,
    requiresInvoice: Boolean(quoteData.requiresInvoice),
    commercialConditions: quoteData.commercialConditions || quoteData.observations || "",
    eventDate: quoteData.eventDate,
    startTime: quoteData.startTime,
    endTime: quoteData.endTime,
  };
}

export function buildCalculationSnapshot(quoteData, packages, services, supplies, promotions) {
  const eventSnapshot = buildEventSnapshot(quoteData);

  if (!isBaseQuote(quoteData)) {
    const customItemDetails = getCustomItemDetails(quoteData.customItems || quoteData.addons || [], services);
    const sourcePackage = getById(packages, quoteData.sourcePackageId);
    const subtotal = roundMoney(customItemDetails.reduce((total, item) => total + item.subtotal, 0));
    const tax = roundMoney(subtotal * TAX_RATE);

    return {
      quoteType: "Personalizada",
      personalizationMode: quoteData.personalizationMode || "Desde cero",
      sourcePackageId: quoteData.sourcePackageId || null,
      sourcePackageSnapshot: sourcePackage
        ? {
            packageId: sourcePackage.id,
            name: sourcePackage.name,
            desc: sourcePackage.desc,
            price: computePackagePrice(sourcePackage, services, supplies),
            state: sourcePackage.state,
          }
        : null,
      eventSnapshot,
      packageSnapshot: null,
      packageItemDetails: [],
      customItemDetails,
      base: 0,
      customTotal: subtotal,
      subtotal,
      promotion: null,
      discount: 0,
      tax,
      total: roundMoney(subtotal + tax),
    };
  }

  const packageItem = getById(packages, quoteData.packageId);
  const packageIsUsable = isActive(packageItem);
  const base = packageIsUsable ? computePackagePrice(packageItem, services, supplies) : 0;
  const subtotal = roundMoney(base);
  const promotion = packageIsUsable ? getActivePromotion(promotions, quoteData.packageId, quoteData.eventDate, subtotal) : null;
  const discount = promotion ? roundMoney((subtotal * promotion.discountPercent) / 100) : 0;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = roundMoney(taxable * TAX_RATE);

  return {
    quoteType: "Base",
    personalizationMode: null,
    sourcePackageId: null,
    sourcePackageSnapshot: null,
    eventSnapshot,
    packageSnapshot: packageItem
      ? {
          packageId: packageItem.id,
          name: packageItem.name,
          desc: packageItem.desc,
          margin: packageItem.margin,
          state: packageItem.state,
          price: base,
        }
      : null,
    packageItemDetails: getPackageItemDetails(packageItem, services),
    customItemDetails: [],
    base,
    customTotal: 0,
    subtotal,
    promotion: promotion
      ? {
          id: promotion.id,
          name: promotion.name,
          discountPercent: promotion.discountPercent,
          minAmount: promotion.minAmount || 0,
        }
      : null,
    discount,
    tax,
    total: roundMoney(taxable + tax),
  };
}

export function getServiceProfitRisk(cost, price) {
  if (cost >= Number(price || 0)) return "Critico";
  if (cost >= Number(price || 0) * 0.85) return "Margen bajo";
  return "Rentable";
}

export function isPersonalizedQuote(quoteData = {}) {
  return quoteData.quoteType === "Personalizada" || (quoteData.customItems || quoteData.addons || []).some((item) => Number(item.qty || 0) > 0);
}
