export const promotionsSeed = [
  { id: "temporada-escolar", name: "Temporada Escolar", startDate: "2026-05-20", endDate: "2026-06-30", discountPercent: 10, packageIds: ["cierre-curso"], minAmount: 300, condition: "Aplica a Cierre de Curso desde $300", state: "Activo" },
  { id: "dia-nino", name: "Dia del Nino", startDate: "2026-05-25", endDate: "2026-06-15", discountPercent: 15, packageIds: ["infantil-basico"], minAmount: 0, condition: "Solo paquetes infantiles", state: "Activo" },
  { id: "navidad-2025", name: "Navidad 2025", startDate: "2025-12-01", endDate: "2025-12-24", discountPercent: 12, packageIds: ["mesa-dulce-express"], minAmount: 0, condition: "Promocion de temporada cerrada", state: "Inactivo" },
];
