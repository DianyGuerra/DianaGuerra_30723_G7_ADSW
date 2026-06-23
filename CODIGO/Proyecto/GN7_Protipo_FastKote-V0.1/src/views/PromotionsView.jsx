import { ActionButtons } from "../components/ui/ActionButtons";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { SearchBar } from "../components/ui/SearchBar";
import { SectionHeader } from "../components/ui/SectionHeader";

export function PromotionsView({ promotions }) {
  return (
    <div>
      <SectionHeader
        eyebrow="CU-SGC-L0-02 / RN-04"
        title="Administrar promociones"
        description="Campanas de descuento con vigencia, condiciones y aplicacion visual solo cuando estan activas."
        action={<Button icon="plus">Registrar promocion</Button>}
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <SearchBar placeholder="Buscar por nombre o estado" />
          <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 [color-scheme:light]"><option>Activos</option><option>Inactivos</option><option>Todos</option></select>
          <Button variant="secondary" icon="search">Filtrar</Button>
        </div>
      </Card>
      <DataTable
        headers={["Promocion", "Descuento", "Vigencia", "Condicion", "Monto minimo", "Estado", "Acciones"]}
        rows={promotions.map((promotion) => [
          promotion.name,
          `${promotion.discountPercent}%`,
          `${promotion.startDate} al ${promotion.endDate}`,
          promotion.condition,
          `$${Number(promotion.minAmount || 0).toFixed(2)}`,
          <Badge variant={promotion.state}>{promotion.state}</Badge>,
          <ActionButtons />,
        ])}
      />
    </div>
  );
}
