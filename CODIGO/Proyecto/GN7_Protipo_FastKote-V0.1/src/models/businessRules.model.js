export const getMinEventDate = () => new Date().toISOString().split("T")[0];
export const TAX_RATE = 0.15;

export const VALID_QUOTE_STATES = ["Borrador", "Enviada", "Aceptada", "Rechazada", "Vencida"];

export const BUSINESS_RULES = [
  "RN-01: Base requiere cliente + paquete + fecha valida; Personalizada requiere cliente + item activo + fecha valida.",
  "RN-02: Cierre solo desde estado Enviada.",
  "RN-03: Solo Aceptada bloquea calendario.",
  "RN-04: Calculos con items, paquetes y promociones activos.",
  "RN-05: PDF y WhatsApp representados de forma simulada.",
];
