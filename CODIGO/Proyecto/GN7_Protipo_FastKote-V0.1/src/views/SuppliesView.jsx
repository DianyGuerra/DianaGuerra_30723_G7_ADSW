import { useState } from "react";
import { SupplyModal } from "../components/modals/SupplyModal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { SectionHeader } from "../components/ui/SectionHeader";
import { currency, isActive } from "../services/quoteCalculation.service";

export function SuppliesView({ supplies, services, onSaveSupply, onToggleSupply }) {
  const [editing, setEditing] = useState(null);

  const usedByActiveServices = (supplyId) =>
    services
      .filter(isActive)
      .filter((service) => (service.recipe || []).some((item) => item.supplyId === supplyId && Number(item.qty) > 0))
      .map((service) => service.name);

  return (
    <div>
      <SectionHeader
        eyebrow="RF-05 · CU-SGC-L0-06"
        title="Catalogo de insumos"
        description="Materiales y costos de referencia para calcular servicios/productos. No representa inventario fisico completo."
        action={<Button icon="plus" onClick={() => setEditing({})}>Registrar insumo</Button>}
      />
      <DataTable
        headers={["Insumo", "Unidad", "Cantidad ref.", "Costo unitario", "Usado en receta activa", "Estado", "Acciones"]}
        rows={supplies.map((supply) => {
          const usedBy = usedByActiveServices(supply.id);
          return [
            supply.name,
            supply.unit,
            supply.refQty,
            currency(supply.cost),
            usedBy.length ? usedBy.join(", ") : "Sin asociaciones activas",
            <Badge variant={supply.state}>{supply.state}</Badge>,
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" icon="edit" onClick={() => setEditing(supply)}>Editar costo</Button>
              <Button variant={supply.state === "Activo" ? "ghost" : "secondary"} icon="close" onClick={() => onToggleSupply(supply.id, usedBy)}>
                {supply.state === "Activo" ? "Baja logica" : "Reactivar"}
              </Button>
            </div>,
          ];
        })}
      />
      {editing && (
        <SupplyModal
          supply={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSave={(supplyData) => {
            onSaveSupply(supplyData);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
