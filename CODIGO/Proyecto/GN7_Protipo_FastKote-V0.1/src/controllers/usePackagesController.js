import { useMemo, useState } from "react";
import { packagesSeed } from "../models/packages.model";
import { computePackageCost, computePackagePrice } from "../services/quoteCalculation.service";

export function usePackagesController({ services, supplies, setNotice, initialPackages = packagesSeed }) {
  const [packages, setPackages] = useState(() => (initialPackages.length ? initialPackages : packagesSeed));

  const packageMetrics = useMemo(() => {
    const metrics = new Map();
    packages.forEach((packageItem) => {
      metrics.set(packageItem.id, {
        cost: computePackageCost(packageItem, services, supplies),
        price: computePackagePrice(packageItem, services, supplies),
      });
    });
    return metrics;
  }, [packages, services, supplies]);

  const savePackage = (packageData) => {
    setPackages((current) => {
      const exists = current.some((item) => item.id === packageData.id);
      return exists ? current.map((item) => (item.id === packageData.id ? packageData : item)) : [packageData, ...current];
    });
    setNotice(`Paquete "${packageData.name}" guardado con costo y precio sugerido recalculados.`);
  };

  const togglePackage = (packageId) => {
    setPackages((current) =>
      current.map((item) => (item.id === packageId ? { ...item, state: item.state === "Activo" ? "Inactivo" : "Activo" } : item)),
    );
    setNotice("Baja logica de paquete aplicada. Los inactivos no se ofrecen al generar cotizaciones.");
  };

  return { packages, packageMetrics, savePackage, togglePackage };
}
