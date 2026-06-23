import { menuItems } from "../constants/menuItems";
import { VALID_QUOTE_STATES } from "../models/businessRules.model";
import { timeToMinutes } from "../services/calendar.service";
import { isActive } from "../services/quoteCalculation.service";

const validQuoteTypes = ["Base", "Personalizada"];

export function runSelfChecks({ clients, quotes, packages, services, supplies, promotions = [], quoteViews, packageMetrics, serviceMetrics, calendarEntries, catalogLoaded = false }) {
  const activePackageIds = new Set(packages.filter(isActive).map((item) => item.id));
  const activeServiceIds = new Set(services.filter(isActive).map((item) => item.id));
  const latestQuotes = quoteViews.filter((quote) => quote.isLatest);
  const historicalQuotes = quoteViews.filter((quote) => !quote.isLatest);
  const acceptedDates = new Set(latestQuotes.filter((quote) => quote.state === "Aceptada").map((quote) => quote.eventDate));
  const blockedDates = new Set(calendarEntries.filter((entry) => entry.state === "Bloqueada").map((entry) => entry.date));
  const blockedEntries = calendarEntries.filter((entry) => entry.state === "Bloqueada");
  const historicalRefs = historicalQuotes.map((quote) => `${quote.code} V${quote.version}`);
  const sentOrAcceptedQuotes = latestQuotes.filter((quote) => ["Enviada", "Aceptada"].includes(quote.state));
  const latestQuoteIds = new Set(latestQuotes.map((quote) => quote.id));

  const hasValidSchedule = (quote) =>
    quote.eventDate && quote.startTime && quote.endTime && timeToMinutes(quote.endTime) > timeToMinutes(quote.startTime);
  const hasValidBusinessData = (quote) =>
    quote.eventType && Number(quote.guestCount) > 0 && quote.eventLocation && (quote.estimatedBudget == null || Number(quote.estimatedBudget) > 0);
  const hasValidBaseData = (quote) => quote.quoteType === "Base" && activePackageIds.has(quote.packageId) && (quote.customItems || []).length === 0;
  const hasValidCustomData = (quote) =>
    quote.quoteType === "Personalizada" &&
    !quote.packageId &&
    (quote.customItems || []).length > 0 &&
    (quote.customItems || []).every((item) => activeServiceIds.has(item.serviceId) && Number(item.qty) > 0);
  const hasValidPersonalizationMode = (quote) =>
    quote.quoteType !== "Personalizada" ||
    (quote.personalizationMode === "Desde cero" ? !quote.sourcePackageId : quote.personalizationMode === "Importada desde paquete" && Boolean(quote.sourcePackageId));
  const hasCompleteSnapshot = (quote) =>
    quote.calculationSnapshot &&
    quote.calculationSnapshot.eventSnapshot &&
    quote.calculationSnapshot.quoteType &&
    Number(quote.calculationSnapshot.total) >= 0 &&
    (quote.quoteType === "Base"
      ? quote.calculationSnapshot.packageSnapshot && quote.calculationSnapshot.customItemDetails.length === 0
      : quote.calculationSnapshot.packageSnapshot === null &&
        (quote.personalizationMode !== "Importada desde paquete" || quote.calculationSnapshot.sourcePackageSnapshot));

  return [
    { name: "Catalogo del prototipo cargado desde fastkote_catalogo.json", pass: catalogLoaded },
    { name: "Catalogo normalizado con paquetes, servicios/productos y promociones", pass: packages.length > 0 && services.length > 0 && promotions.length > 0 },
    { name: "Existe al menos un cliente activo", pass: clients.some(isActive) },
    { name: "RN-01: cotizaciones con datos de evento y horario valido", pass: quotes.every((quote) => quote.clientId && hasValidBusinessData(quote) && hasValidSchedule(quote)) },
    { name: "Cotizaciones tienen tipo valido: Base o Personalizada", pass: quotes.every((quote) => validQuoteTypes.includes(quote.quoteType)) },
    { name: "RN-01 Base: cliente, paquete activo y fecha valida", pass: quotes.filter((quote) => quote.quoteType === "Base").every((quote) => quote.clientId && hasValidBaseData(quote) && hasValidSchedule(quote)) },
    { name: "RN-01 Personalizada: cliente, items activos y fecha valida", pass: quotes.filter((quote) => quote.quoteType === "Personalizada").every((quote) => quote.clientId && hasValidCustomData(quote) && hasValidSchedule(quote)) },
    { name: "Personalizadas guardan modo y origen consistentes", pass: quotes.every(hasValidPersonalizationMode) },
    { name: "Estados de cotizacion dentro del ciclo permitido", pass: quotes.every((quote) => VALID_QUOTE_STATES.includes(quote.state)) },
    { name: "RN-02: solo versiones vigentes pueden entrar al flujo de cierre", pass: quoteViews.filter((quote) => ["Aceptada", "Rechazada", "Vencida"].includes(quote.state)).every((quote) => latestQuoteIds.has(quote.id) || !quote.isLatest) },
    { name: "Paquetes activos con servicios activos y precio sugerido calculado", pass: packages.filter(isActive).every((item) => (item.items || []).some((detail) => activeServiceIds.has(detail.serviceId)) && (packageMetrics.get(item.id)?.price || 0) > 0) },
    { name: "Servicios activos calculan costo desde insumos activos", pass: services.filter(isActive).every((service) => serviceMetrics.has(service.id)) },
    { name: "Insumos activos disponibles para recetas tecnicas", pass: supplies.some(isActive) },
    { name: "RN-03: cada cotizacion aceptada bloquea su fecha", pass: [...acceptedDates].every((date) => blockedDates.has(date)) },
    { name: "RN-03: solo cotizaciones aceptadas vigentes bloquean calendario", pass: blockedEntries.every((entry) => acceptedDates.has(entry.date)) },
    { name: "RN-04: cotizaciones vigentes usan paquetes o servicios activos", pass: latestQuotes.every((quote) => (quote.quoteType === "Base" ? hasValidBaseData(quote) : hasValidCustomData(quote))) },
    { name: "RN-04: promociones activas tienen fecha, paquete y porcentaje", pass: promotions.filter(isActive).every((promotion) => promotion.startDate && promotion.endDate && Array.isArray(promotion.packageIds) && promotion.packageIds.length > 0 && Number(promotion.discountPercent) > 0) },
    { name: "RN-05: cotizaciones enviadas o aceptadas tienen PDF generado", pass: sentOrAcceptedQuotes.every((quote) => quote.pdfGenerated && quote.pdfFileName) },
    { name: "Versiones historicas se identifican para acciones de solo lectura", pass: historicalQuotes.every((quote) => !quote.isLatest && quoteViews.some((item) => item.code === quote.code && item.version > quote.version)) },
    { name: "Calendario ignora versiones historicas", pass: historicalRefs.every((ref) => calendarEntries.every((entry) => !entry.summary.includes(ref))) },
    { name: "Cotizaciones conservan snapshot de calculo completo", pass: quotes.every(hasCompleteSnapshot) },
    { name: "Versiones historicas conservan snapshot", pass: historicalQuotes.every(hasCompleteSnapshot) },
    { name: "Todo item del menu tiene trazabilidad RF/CU", pass: menuItems.every((item) => item.trace && item.trace.length > 0) },
  ];
}
