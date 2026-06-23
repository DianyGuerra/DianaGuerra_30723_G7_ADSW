import { employeesSeed } from "../models/employees.model";
import { ActionButtons } from "../components/ui/ActionButtons";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { SearchBar } from "../components/ui/SearchBar";
import { SectionHeader } from "../components/ui/SectionHeader";

export function EmployeesView() {
  return (
    <div>
      <SectionHeader
        eyebrow="RF-06 · CU-SGC-L0-05"
        title="Empleados, roles y permisos"
        description="Usuarios y roles operativos segun responsabilidad. El login sigue siendo simulado."
        action={<Button icon="plus">Registrar empleado</Button>}
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <SearchBar placeholder="Buscar por nombre o estado" />
          <select className="rounded-md border border-slate-200 px-3 py-2 text-sm"><option>Activos</option><option>Inactivos</option><option>Todos</option></select>
          <Button variant="secondary" icon="search">Filtrar</Button>
        </div>
      </Card>
      <DataTable
        headers={["Empleado", "Rol operativo", "Rol de sistema", "Estado", "Acciones"]}
        rows={employeesSeed.map((employee) => [
          employee.name,
          employee.workRole,
          employee.systemRole,
          <Badge variant={employee.state}>{employee.state}</Badge>,
          <ActionButtons />,
        ])}
      />
    </div>
  );
}
