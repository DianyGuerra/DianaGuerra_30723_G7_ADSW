export function timeToMinutes(time) {
  const [hours, minutes] = String(time || "00:00").split(":").map(Number);
  return hours * 60 + minutes;
}

export function rangesOverlap(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}

export function getLatestQuotes(quoteViews) {
  return quoteViews.filter((quote) => quote.isLatest);
}

export function hasAcceptedTimeConflict(candidate, quoteViews, excludeId = null) {
  return getLatestQuotes(quoteViews).some((quote) => {
    if (quote.id === excludeId) return false;
    if (quote.state !== "Aceptada") return false;
    if (quote.eventDate !== candidate.eventDate) return false;
    return rangesOverlap(candidate.startTime, candidate.endTime, quote.startTime, quote.endTime);
  });
}

export function buildCalendarEntries(quoteViews) {
  const latestQuotes = getLatestQuotes(quoteViews);
  const dates = [...new Set(latestQuotes.map((quote) => quote.eventDate))].sort();

  return dates.map((date) => {
    const accepted = latestQuotes.filter((quote) => quote.eventDate === date && quote.state === "Aceptada");
    const tentative = latestQuotes.filter((quote) => quote.eventDate === date && ["Borrador", "Enviada"].includes(quote.state));
    const closed = latestQuotes.filter((quote) => quote.eventDate === date && ["Rechazada", "Vencida"].includes(quote.state));

    if (accepted.length) {
      return { date, state: "Bloqueada", summary: accepted.map((quote) => `${quote.code} V${quote.version} / ${quote.startTime}-${quote.endTime}`).join(", "), client: accepted[0].clientName };
    }

    if (tentative.length) {
      return { date, state: "Tentativa", summary: tentative.map((quote) => `${quote.code} V${quote.version} / ${quote.startTime}-${quote.endTime}`).join(", "), client: "Pendiente de aceptacion" };
    }

    if (closed.length) {
      return { date, state: "Libre", summary: "Cotizacion cerrada sin bloqueo", client: closed[0].clientName };
    }

    return { date, state: "Libre", summary: "Sin evento aceptado", client: "Disponible" };
  });
}
