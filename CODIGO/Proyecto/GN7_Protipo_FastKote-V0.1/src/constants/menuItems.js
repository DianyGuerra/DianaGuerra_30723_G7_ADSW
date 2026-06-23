import { TRACEABILITY } from "./traceability";

export const menuItems = [
  { id: "dashboard", label: "Resumen", icon: "dashboard", trace: TRACEABILITY.dashboard },
  { id: "cotizaciones", label: "Cotizaciones", icon: "quote", trace: TRACEABILITY.cotizaciones },
  { id: "clientes", label: "Clientes", icon: "client", trace: TRACEABILITY.clientes },
  { id: "calendario", label: "Calendario", icon: "calendar", trace: TRACEABILITY.calendario },
  { id: "paquetes", label: "Paquetes", icon: "package", trace: TRACEABILITY.paquetes },
  { id: "promociones", label: "Promociones", icon: "promo", trace: TRACEABILITY.promociones },
  { id: "servicios", label: "Servicios y productos", icon: "service", trace: TRACEABILITY.servicios },
  { id: "insumos", label: "Insumos", icon: "supply", trace: TRACEABILITY.insumos },
  { id: "empleados", label: "Empleados y roles", icon: "employee", trace: TRACEABILITY.empleados },
];
