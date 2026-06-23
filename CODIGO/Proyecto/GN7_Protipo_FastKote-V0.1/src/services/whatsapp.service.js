export function simulateWhatsappSend(quote) {
  if (quote.state === "Borrador") {
    return `${quote.code} V${quote.version} fue marcada como Enviada por WhatsApp simulado.`;
  }

  return `WhatsApp simulado registrado para ${quote.code} V${quote.version}; el estado no cambia porque ya no esta en Borrador.`;
}

export function hasValidPhone(client) {
  const digits = String(client?.phone || "").replace(/\D/g, "");
  return digits.length >= 7;
}
