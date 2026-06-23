import { useState } from "react";
import { PackageModal } from "../components/modals/PackageModal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { SearchBar } from "../components/ui/SearchBar";
import { SectionHeader } from "../components/ui/SectionHeader";
import { currency, getById, isActive } from "../services/quoteCalculation.service";

export function PackagesView({ packages, services, packageMetrics, serviceMetrics, onSavePackage, onTogglePackage }) {
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <SectionHeader
        eyebrow="RF-04 · CU-SGC-L0-07"
        title="Administrar paquetes"
        description="Registra, edita, consulta y desactiva paquetes de forma logica. Los paquetes inactivos no aparecen al generar cotizaciones."
        action={<Button icon="plus" onClick={() => setEditing({})}>Registrar paquete</Button>}
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <SearchBar placeholder="Buscar paquete" />
          <Badge variant="Activo">{packages.filter(isActive).length} activos</Badge>
          <Badge variant="Inactivo">{packages.filter((item) => item.state === "Inactivo").length} inactivos</Badge>
        </div>
      </Card>
      <DataTable
        headers={["Paquete", "Servicios/productos", "Costo", "Margen", "Precio sugerido", "Estado", "Acciones"]}
        rows={packages.map((packageItem) => {
          const metrics = packageMetrics.get(packageItem.id);
          const inactiveRefs = (packageItem.items || []).filter((item) => !isActive(getById(services, item.serviceId))).length;
          return [
            <div><p>{packageItem.name}</p><p className="text-xs text-slate-500">{packageItem.desc}</p>{inactiveRefs > 0 && <p className="mt-1 text-xs font-semibold text-amber-700">Tiene servicios inactivos omitidos del calculo.</p>}</div>,
            (packageItem.items || []).map((item) => {
              const service = getById(services, item.serviceId);
              return `${service?.name || "Servicio no disponible"} x${item.qty}`;
            }).join(", "),
            currency(metrics?.cost || 0),
            `${packageItem.margin}%`,
            currency(metrics?.price || 0),
            <Badge variant={packageItem.state}>{packageItem.state}</Badge>,
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" icon="edit" onClick={() => setEditing(packageItem)}>Editar</Button>
              <Button variant={packageItem.state === "Activo" ? "ghost" : "secondary"} icon="close" onClick={() => onTogglePackage(packageItem.id)}>
                {packageItem.state === "Activo" ? "Desactivar" : "Reactivar"}
              </Button>
            </div>,
          ];
        })}
      />
      {editing && (
        <PackageModal
          packageItem={editing.id ? editing : null}
          services={services}
          serviceMetrics={serviceMetrics}
          onClose={() => setEditing(null)}
          onSave={(packageData) => {
            onSavePackage(packageData);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
