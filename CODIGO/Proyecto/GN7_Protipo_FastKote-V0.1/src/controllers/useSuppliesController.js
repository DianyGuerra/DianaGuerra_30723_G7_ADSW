import { useState } from "react";
import { suppliesSeed } from "../models/supplies.model";

export function useSuppliesController({ setNotice }) {
  const [supplies, setSupplies] = useState(suppliesSeed);

  const saveSupply = (supplyData) => {
    setSupplies((current) => {
      const exists = current.some((item) => item.id === supplyData.id);
      return exists ? current.map((item) => (item.id === supplyData.id ? supplyData : item)) : [supplyData, ...current];
    });
    setNotice(`Insumo "${supplyData.name}" guardado. Servicios, paquetes y cotizaciones reflejan el nuevo costo.`);
  };

  const toggleSupply = (supplyId, usedBy) => {
    const supply = supplies.find((item) => item.id === supplyId);
    if (supply?.state === "Activo" && usedBy.length) {
      setNotice(`Advertencia: no se desactivo el insumo porque esta asociado a receta activa: ${usedBy.join(", ")}.`);
      return;
    }
    setSupplies((current) =>
      current.map((item) => (item.id === supplyId ? { ...item, state: item.state === "Activo" ? "Inactivo" : "Activo" } : item)),
    );
    setNotice("Estado del insumo actualizado por baja logica.");
  };

  return { supplies, saveSupply, toggleSupply };
}
