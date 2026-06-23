import { ActionButtons } from "../components/ui/ActionButtons";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { SearchBar } from "../components/ui/SearchBar";
import { SectionHeader } from "../components/ui/SectionHeader";

export function ClientsView({ clients }) {
  return (
    <div>
      <SectionHeader
        eyebrow="RF-03 · CU-SGC-L0-04"
        title="Administrar clientes"
        description="Registro, busqueda, actualizacion, consulta y baja logica de clientes para agilizar cotizaciones."
        action={<Button icon="plus">Registrar cliente</Button>}
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <SearchBar placeholder="Buscar por nombre o estado" />
          <select className="rounded-md border border-slate-200 px-3 py-2 text-sm"><option>Activos</option><option>Inactivos</option><option>Todos</option></select>
          <Button variant="secondary" icon="search">Filtrar</Button>
        </div>
      </Card>
      <DataTable
        headers={["Nombre", "Cedula/RUC", "Correo", "Telefono", "Direccion", "Estado", "Acciones"]}
        rows={clients.map((client) => [
          client.name,
          client.doc,
          client.email,
          client.phone,
          client.address,
          <Badge variant={client.state}>{client.state}</Badge>,
          <ActionButtons />,
        ])}
      />
    </div>
  );
}
