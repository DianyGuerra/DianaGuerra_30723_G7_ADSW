import rawCatalog from "../../fastkote_catalogo.json";

const fallbackEventTypes = ["Cumpleanos infantil", "Evento escolar", "Mesa dulce", "Evento familiar", "Otro"];

const text = (value) => String(value || "").trim();

export const slugify = (value) =>
  text(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeText = (value) =>
  text(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function getReferencePrice(item, type) {
  const explicitPrice = Number(item.precio || item.price || 0);
  if (explicitPrice > 0) return explicitPrice;

  const name = normalizeText(item.nombre || item.name);
  const category = normalizeText(item.categoria);
  const productPrices = [
    ["canguil", 1.5],
    ["algodon", 2],
    ["granizado", 1.75],
    ["hot dog", 2.5],
    ["pancake", 2],
    ["brocheta", 2.75],
    ["almidon", 1],
    ["fresas", 2.5],
    ["jugo", 1.25],
  ];
  const servicePrices = [
    ["canguil", 35],
    ["algodon", 40],
    ["granizado", 45],
    ["snacks", 50],
    ["juegos", 60],
    ["playground", 80],
    ["cancha", 45],
    ["futbolin", 35],
    ["escalar", 50],
    ["salon", 120],
    ["mesa principal", 75],
    ["centros", 35],
    ["fondos", 45],
    ["decoracion", 90],
    ["pinata", 30],
    ["photo booth", 120],
    ["personal", 25],
    ["transporte", 60],
  ];
  const source = type === "Producto" ? productPrices : servicePrices;
  const match = source.find(([keyword]) => name.includes(keyword) || category.includes(keyword));

  return match?.[1] || (type === "Producto" ? 2 : 45);
}

function buildCatalogItem(item, type) {
  const name = text(item.nombre || item.name);
  const unit = item.unidad ? ` / ${item.unidad}` : "";
  const price = getReferencePrice(item, type);
  return {
    id: slugify(name),
    name,
    type,
    desc: `${item.categoria || "Catalogo comercial"}${unit}. Precio referencial del prototipo.`,
    price,
    state: "Activo",
    recipe: [],
    catalogSource: "fastkote_catalogo.json",
  };
}

function parseQuantity(value) {
  const match = text(value).match(/\d+/);
  const qty = match ? Number(match[0]) : 1;
  return Number.isFinite(qty) && qty > 0 ? qty : 1;
}

function findCatalogItem(items, label) {
  const normalizedLabel = normalizeText(label);
  const labelTokens = normalizedLabel.split(" ").filter((token) => token.length > 2 && !["vasos", "horas", "unidades", "personalizables", "ilimitado"].includes(token));

  return items.find((item) => {
    const itemName = normalizeText(item.name);
    return itemName === normalizedLabel || labelTokens.some((token) => itemName.includes(token) || token.includes(itemName));
  });
}

function ensureDerivedItem(items, label) {
  const name = text(label).replace(/^\d+\s*/, "").trim() || "Servicio derivado";
  const existing = findCatalogItem(items, name);
  if (existing) return existing;

  const derived = {
    id: slugify(name),
    name,
    type: "Servicio",
    desc: "Item derivado desde el campo incluye del paquete. Precio referencial del prototipo.",
    price: getReferencePrice({ nombre: name }, "Servicio"),
    state: "Activo",
    recipe: [],
    catalogSource: "fastkote_catalogo.json",
    derivedFromPackageText: true,
  };
  items.push(derived);
  return derived;
}

function normalizePackage(packageItem, catalogItems) {
  const name = text(packageItem.nombre || packageItem.name);
  const price = Number(packageItem.precio || 0) || Number(packageItem.precioPorNino || 0) * Number(packageItem.minimoNinos || 1);
  const includeItems = Array.isArray(packageItem.incluye) ? packageItem.incluye : [];
  const optionItems = Array.isArray(packageItem.opcionesDisponibles) ? packageItem.opcionesDisponibles : [];
  const itemLabels = [...includeItems, ...optionItems];
  const items = itemLabels.map((label) => {
    const item = findCatalogItem(catalogItems, label) || ensureDerivedItem(catalogItems, label);
    return { serviceId: item.id, qty: parseQuantity(label) };
  });

  return {
    id: slugify(name),
    name,
    desc: [
      Array.isArray(packageItem.tipoEvento) && packageItem.tipoEvento.length ? `Tipo: ${packageItem.tipoEvento.join(", ")}` : "",
      packageItem.capacidadMaxima ? `Capacidad maxima: ${packageItem.capacidadMaxima}` : "",
      packageItem.minimoNinos ? `Minimo ninos: ${packageItem.minimoNinos}` : "",
    ].filter(Boolean).join(" / ") || "Paquete normalizado desde fastkote_catalogo.json.",
    margin: 30,
    price: Number(price || 0),
    state: "Activo",
    items: items.length ? items : [{ serviceId: ensureDerivedItem(catalogItems, name).id, qty: 1 }],
    typeEvent: packageItem.tipoEvento || [],
    catalogSource: "fastkote_catalogo.json",
  };
}

function parseDiscount(value) {
  const match = text(value).match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function normalizePromotion(promotion, packages) {
  const appliesTo = Array.isArray(promotion.aplicaA) ? promotion.aplicaA : [];
  const packageIds = packages
    .filter((packageItem) => appliesTo.some((name) => normalizeText(name) === normalizeText(packageItem.name)))
    .map((packageItem) => packageItem.id);
  const currentYear = new Date().getFullYear();

  return {
    id: slugify(promotion.nombre),
    name: text(promotion.nombre),
    discountPercent: parseDiscount(promotion.descuento),
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
    packageIds,
    minAmount: 0,
    condition: `${promotion.condicion || "Promocion del catalogo"}. Vigencia referencial para demo.`,
    state: "Activo",
    catalogSource: "fastkote_catalogo.json",
  };
}

export function buildFastKoteCatalog(catalog = rawCatalog) {
  const eventTypes = Array.isArray(catalog.tiposEvento) && catalog.tiposEvento.length ? catalog.tiposEvento : fallbackEventTypes;
  const catalogItems = [
    ...(catalog.productos || []).map((item) => buildCatalogItem(item, "Producto")),
    ...(catalog.servicios || []).map((item) => buildCatalogItem(item, "Servicio")),
  ];

  ensureDerivedItem(catalogItems, "Transporte local");

  const packages = (catalog.paquetes || []).map((packageItem) => normalizePackage(packageItem, catalogItems));
  const promotions = (catalog.promociones || []).map((promotion) => normalizePromotion(promotion, packages));

  return {
    eventTypes,
    services: catalogItems,
    packages,
    promotions,
    catalogLoaded: true,
    catalogSource: "fastkote_catalogo.json",
  };
}

export const fastKoteCatalog = buildFastKoteCatalog();
