import { useMemo, useState } from "react";
import { quotesSeed } from "../models/quotes.model";
import { buildCalendarEntries, hasAcceptedTimeConflict } from "../services/calendar.service";
import { createPdfMetadata, simulatePdfGeneration } from "../services/pdf.service";
import { buildCalculationSnapshot, getById, getQuoteBreakdown } from "../services/quoteCalculation.service";
import { createNextQuoteVersion, getNextQuoteCode } from "../services/versioning.service";
import { hasValidPhone, simulateWhatsappSend } from "../services/whatsapp.service";

const defaultQuoteFields = {
  responsibleName: "",
  eventType: "",
  guestCount: 0,
  estimatedBudget: null,
  eventLocation: "",
  theme: "",
  requiresInvoice: false,
  commercialConditions: "",
};

function getCompositionSummary(quote, breakdown, packageName) {
  if (quote.quoteType === "Base") return packageName;

  if (quote.personalizationMode === "Importada desde paquete") {
    const sourceName = breakdown.sourcePackageSnapshot?.name || "paquete no disponible";
    return `Personalizada desde paquete: ${sourceName}`;
  }

  if (quote.personalizationMode === "Desde cero") return "Personalizada desde cero";

  const items = breakdown.customItemDetails || [];
  if (!items.length) return "Cotizacion personalizada desde catalogo";

  const names = items.slice(0, 2).map((item) => item.name).join(", ");
  return items.length > 2 ? `${names} +${items.length - 2}` : names;
}

export function useQuotesController({ clients, packages, services, supplies, promotions, setNotice }) {
  const normalizeQuote = (quote) => {
    const quoteType = quote.quoteType === "Personalizada" ? "Personalizada" : "Base";
    const customItems = quoteType === "Personalizada" ? quote.customItems || quote.addons || [] : [];
    const personalizationMode = quoteType === "Personalizada" ? quote.personalizationMode || "Desde cero" : null;
    const normalized = {
      ...defaultQuoteFields,
      ...quote,
      quoteType,
      isPersonalized: quoteType === "Personalizada",
      personalizationMode,
      packageId: quoteType === "Base" ? quote.packageId || "" : null,
      sourcePackageId: quoteType === "Personalizada" ? quote.sourcePackageId || null : null,
      customItems,
      addons: [],
      responsibleName: quote.responsibleName || "",
      eventType: quote.eventType || "Otro",
      guestCount: Number(quote.guestCount || 1),
      estimatedBudget: quote.estimatedBudget === "" || quote.estimatedBudget == null ? null : Number(quote.estimatedBudget),
      eventLocation: quote.eventLocation || "Lugar por confirmar",
      startTime: quote.startTime || quote.time || "16:00",
      endTime: quote.endTime || "18:00",
      theme: quote.theme || "",
      requiresInvoice: Boolean(quote.requiresInvoice),
      commercialConditions: quote.commercialConditions || quote.observations || "",
      observations: quote.observations || quote.commercialConditions || "",
      pdfGenerated: quote.pdfGenerated ?? false,
      pdfGeneratedAt: quote.pdfGeneratedAt || "",
      pdfFileName: quote.pdfFileName || "",
    };

    const calculationSnapshot = quote.calculationSnapshot || buildCalculationSnapshot(normalized, packages, services, supplies, promotions);

    return {
      ...normalized,
      customItems: normalized.quoteType === "Personalizada"
        ? calculationSnapshot.customItemDetails.map((item) => ({
            serviceId: item.serviceId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          }))
        : [],
      calculationSnapshot,
    };
  };

  const [quotes, setQuotes] = useState(() => quotesSeed.map(normalizeQuote));

  const quoteViews = useMemo(() => {
    const maxVersionByCode = quotes.reduce((acc, quote) => {
      acc[quote.code] = Math.max(acc[quote.code] || 0, quote.version);
      return acc;
    }, {});

    return [...quotes]
      .sort((a, b) => b.code.localeCompare(a.code) || b.version - a.version)
      .map((quote) => {
        const client = getById(clients, quote.clientId);
        const packageItem = getById(packages, quote.packageId);
        const breakdown = getQuoteBreakdown(quote, packages, services, supplies, promotions);
        const packageName = quote.quoteType === "Base"
          ? packageItem?.name || breakdown.packageSnapshot?.name || "Paquete no disponible"
          : "Cotizacion personalizada desde catalogo";

        return {
          ...quote,
          clientName: client?.name || "Cliente no disponible",
          packageName,
          compositionSummary: getCompositionSummary(quote, breakdown, packageName),
          breakdown,
          isLatest: maxVersionByCode[quote.code] === quote.version,
        };
      });
  }, [quotes, clients, packages, services, supplies, promotions]);

  const calendarEntries = useMemo(() => buildCalendarEntries(quoteViews), [quoteViews]);

  const buildQuoteData = (quoteData) => {
    const quoteType = quoteData.quoteType === "Personalizada" ? "Personalizada" : "Base";
    const personalizationMode = quoteType === "Personalizada" ? quoteData.personalizationMode || "Desde cero" : null;
    const baseData = {
      ...defaultQuoteFields,
      ...quoteData,
      quoteType,
      isPersonalized: quoteType === "Personalizada",
      personalizationMode,
      packageId: quoteType === "Base" ? quoteData.packageId : null,
      sourcePackageId: quoteType === "Personalizada" ? quoteData.sourcePackageId || null : null,
      customItems: quoteType === "Personalizada" ? quoteData.customItems || [] : [],
      addons: [],
      guestCount: Number(quoteData.guestCount || 0),
      estimatedBudget: quoteData.estimatedBudget === "" || quoteData.estimatedBudget == null ? null : Number(quoteData.estimatedBudget),
      requiresInvoice: Boolean(quoteData.requiresInvoice),
      observations: quoteData.commercialConditions || quoteData.observations || "",
      pdfGenerated: false,
      pdfGeneratedAt: "",
      pdfFileName: "",
    };
    const calculationSnapshot = buildCalculationSnapshot(baseData, packages, services, supplies, promotions);

    return {
      ...baseData,
      customItems: quoteType === "Personalizada"
        ? calculationSnapshot.customItemDetails.map((item) => ({
            serviceId: item.serviceId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          }))
        : [],
      calculationSnapshot,
    };
  };

  const createQuote = (quoteData) => {
    if (hasAcceptedTimeConflict(quoteData, quoteViews)) {
      setNotice("Conflicto de agenda: horario no disponible");
      return false;
    }
    const code = getNextQuoteCode(quotes);
    const normalizedQuoteData = buildQuoteData(quoteData);
    setQuotes((current) => [
      {
        id: `${code}-v1-${Date.now().toString(36)}`,
        code,
        version: 1,
        state: "Borrador",
        ...normalizedQuoteData,
      },
      ...current,
    ]);
    setNotice(`Cotizacion ${code} creada en estado Borrador. Cumple RN-01 y queda lista para PDF/WhatsApp simulado.`);
    return true;
  };

  const startEditQuote = (quoteId) => {
    const quote = quoteViews.find((item) => item.id === quoteId);
    if (!quote?.isLatest || !["Borrador", "Enviada"].includes(quote.state)) {
      setNotice("La cotizacion no puede ser modificada en su estado actual");
      return null;
    }
    return quote;
  };

  const saveQuoteVersion = (quoteId, quoteData) => {
    const quote = quotes.find((item) => item.id === quoteId);
    const quoteView = quoteViews.find((item) => item.id === quoteId);
    if (!quote || !quoteView?.isLatest || !["Borrador", "Enviada"].includes(quote.state)) {
      setNotice("La cotizacion no puede ser modificada en su estado actual");
      return false;
    }
    if (hasAcceptedTimeConflict(quoteData, quoteViews, quoteId)) {
      setNotice("Conflicto de agenda: horario no disponible");
      return false;
    }
    const normalizedQuoteData = buildQuoteData(quoteData);
    const nextQuote = createNextQuoteVersion(quote, quotes, normalizedQuoteData);
    setQuotes((current) => [nextQuote, ...current]);
    setNotice(`Se creo ${quote.code} V${nextQuote.version}. La version anterior permanece visible como historial.`);
    return true;
  };

  const generatePdf = (quoteId) => {
    const quote = quoteViews.find((item) => item.id === quoteId);
    if (!quote?.isLatest) return;
    const metadata = createPdfMetadata(quote);
    setQuotes((current) => current.map((item) => (item.id === quoteId ? { ...item, ...metadata } : item)));
    setNotice(simulatePdfGeneration({ ...quote, ...metadata }));
  };

  const sendWhatsapp = (quoteId) => {
    const quote = quotes.find((item) => item.id === quoteId);
    const quoteView = quoteViews.find((item) => item.id === quoteId);
    if (!quote) return;
    if (!quoteView?.isLatest) return;
    if (!quote.pdfGenerated) {
      setNotice("Primero se debe generar el PDF de la cotizacion");
      return;
    }
    const client = getById(clients, quote.clientId);
    if (!hasValidPhone(client)) {
      setNotice("El cliente no cuenta con un numero de contacto valido");
      return;
    }
    setQuotes((current) =>
      current.map((item) => (item.id === quoteId && item.state === "Borrador" ? { ...item, state: "Enviada" } : item)),
    );
    setNotice(simulateWhatsappSend(quote));
  };

  const updateQuoteStatus = (quoteId, state) => {
    const quote = quotes.find((item) => item.id === quoteId);
    const quoteView = quoteViews.find((item) => item.id === quoteId);
    if (!quote || !quoteView?.isLatest) return;
    if (quote.state !== "Enviada") {
      setNotice(`RN-02 bloquea el cambio: ${quote.code} V${quote.version} no esta en estado Enviada.`);
      return;
    }
    if (state === "Aceptada" && hasAcceptedTimeConflict(quote, quoteViews, quoteId)) {
      setNotice("Conflicto: la fecha ya no se encuentra disponible");
      return;
    }
    setQuotes((current) => current.map((item) => (item.id === quoteId ? { ...item, state } : item)));
    setNotice(state === "Aceptada" ? `${quote.code} V${quote.version} ahora bloquea la fecha ${quote.eventDate}.` : `${quote.code} V${quote.version} queda ${state}; la fecha ${quote.eventDate} queda libre.`);
  };

  return {
    quotes,
    quoteViews,
    calendarEntries,
    createQuote,
    startEditQuote,
    saveQuoteVersion,
    generatePdf,
    sendWhatsapp,
    updateQuoteStatus,
  };
}
