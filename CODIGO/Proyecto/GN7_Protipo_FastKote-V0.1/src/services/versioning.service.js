export const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function getNextQuoteCode(quotes) {
  const nextNumber = Math.max(...quotes.map((quote) => Number(quote.code.split("-").pop()) || 0)) + 1;
  return `FK-2026-${String(nextNumber).padStart(3, "0")}`;
}

export function createNextQuoteVersion(quote, quotes, quoteData) {
  const nextVersion = Math.max(...quotes.filter((item) => item.code === quote.code).map((item) => item.version)) + 1;

  return {
    ...quote,
    ...quoteData,
    id: `${quote.code}-v${nextVersion}-${Date.now().toString(36)}`,
    version: nextVersion,
    state: "Borrador",
    pdfGenerated: false,
    pdfGeneratedAt: "",
    pdfFileName: "",
  };
}
