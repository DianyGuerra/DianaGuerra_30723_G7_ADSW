import { useState } from "react";
import { ServiceModal } from "../components/modals/ServiceModal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { SectionHeader } from "../components/ui/SectionHeader";
import { currency } from "../services/quoteCalculation.service";

export function ServicesView({ services, supplies, serviceMetrics, onSaveService, onToggleService }) {
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <SectionHeader
        eyebrow="CU-SGC-L0-09"
        title="Servicios, productos y recetas tecnicas"
        description="Registra, consulta, edita y desactiva servicios/productos. El costo se recalcula segun los insumos activos asociados."
        action={<Button icon="plus" onClick={() => setEditing({})}>Registrar servicio/producto</Button>}
      />
      <DataTable
        headers={["Item", "Tipo", "Descripcion", "Precio sugerido", "Costo calculado", "Alerta", "Estado", "Acciones"]}
        rows={services.map((service) => {
          const metrics = serviceMetrics.get(service.id);
          return [
            service.name,
            service.type,
            service.desc,
            currency(service.price),
            currency(metrics?.cost || 0),
            <Badge variant={metrics?.risk || "Rentable"}>{metrics?.risk || "Rentable"}</Badge>,
            <Badge variant={service.state}>{service.state}</Badge>,
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" icon="edit" onClick={() => setEditing(service)}>Editar</Button>
              <Button variant={service.state === "Activo" ? "ghost" : "secondary"} icon="close" onClick={() => onToggleService(service.id)}>
                {service.state === "Activo" ? "Baja logica" : "Reactivar"}
              </Button>
            </div>,
          ];
        })}
      />
      {editing && (
        <ServiceModal
          service={editing.id ? editing : null}
          supplies={supplies}
          onClose={() => setEditing(null)}
          onSave={(serviceData) => {
            onSaveService(serviceData);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
