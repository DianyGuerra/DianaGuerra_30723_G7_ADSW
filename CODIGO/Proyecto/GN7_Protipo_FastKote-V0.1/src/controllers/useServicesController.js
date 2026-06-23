import { useMemo, useState } from "react";
import { servicesSeed } from "../models/services.model";
import { computeServiceCost, getServiceProfitRisk } from "../services/quoteCalculation.service";

export function useServicesController({ supplies, setNotice, initialServices = servicesSeed }) {
  const [services, setServices] = useState(() => (initialServices.length ? initialServices : servicesSeed));

  const serviceMetrics = useMemo(() => {
    const metrics = new Map();
    services.forEach((service) => {
      const cost = computeServiceCost(service, supplies);
      metrics.set(service.id, { cost, risk: getServiceProfitRisk(cost, service.price) });
    });
    return metrics;
  }, [services, supplies]);

  const saveService = (serviceData) => {
    setServices((current) => {
      const exists = current.some((item) => item.id === serviceData.id);
      return exists ? current.map((item) => (item.id === serviceData.id ? serviceData : item)) : [serviceData, ...current];
    });
    setNotice(`Servicio/producto "${serviceData.name}" guardado. Costos relacionados se recalculan visualmente.`);
  };

  const toggleService = (serviceId) => {
    setServices((current) =>
      current.map((item) => (item.id === serviceId ? { ...item, state: item.state === "Activo" ? "Inactivo" : "Activo" } : item)),
    );
    setNotice("Baja logica aplicada. Servicios/productos inactivos no se pueden agregar a paquetes ni cotizaciones.");
  };

  return { services, serviceMetrics, saveService, toggleService };
}
