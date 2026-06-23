import { BUSINESS_RULES } from "../models/businessRules.model";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AppIcon } from "../components/ui/AppIcon";
import { SectionHeader } from "../components/ui/SectionHeader";
import { isActive } from "../services/quoteCalculation.service";

export function DashboardView({ quoteViews, packages, services, supplies, calendarEntries, setActive }) {
  const stats = [
    ["Cotizaciones", quoteViews.length, "quote", "Incluye historial de versiones"],
    ["Paquetes activos", packages.filter(isActive).length, "package", "Usables en cotizaciones"],
    ["Servicios activos", services.filter(isActive).length, "service", "Disponibles para paquetes"],
    ["Fechas bloqueadas", calendarEntries.filter((entry) => entry.state === "Bloqueada").length, "calendar", "Solo por cotizaciones aceptadas"],
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="Panel general"
        title="Gestion centralizada de cotizaciones"
        description="Vista ejecutiva para defender el flujo: crear cotizacion, calcular con paquetes activos, enviar PDF/WhatsApp simulado y bloquear calendario solo cuando el estado es Aceptada."
        action={<Button icon="settings" onClick={() => setActive("cotizaciones")}>Gestionar cotizaciones</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([title, value, icon, note]) => (
          <Card key={title}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">{title}</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{note}</p>
              </div>
              <div className="rounded-lg bg-violet-50 p-3 text-violet-700"><AppIcon name={icon} className="h-5 w-5" /></div>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Embudo de cotizaciones</h3>
              <p className="text-sm text-slate-500">Estados definidos para RF-02 y CU-SGC-L0-03.</p>
            </div>
            <Badge variant="Borrador">RF-02</Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {["Borrador", "Enviada", "Aceptada", "Rechazada", "Vencida"].map((state) => {
              const count = quoteViews.filter((quote) => quote.state === state).length;
              return (
                <div key={state}>
                  <div className="mb-1 flex justify-between text-sm"><span>{state}</span><strong>{count}</strong></div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-violet-500" style={{ width: `${Math.min(count * 18, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><AppIcon name="alert" className="h-5 w-5" /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Reglas visibles</h3>
              <p className="text-sm text-slate-500">Puntos obligatorios para defensa.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            {BUSINESS_RULES.map((rule) => <div key={rule} className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">{rule}</div>)}
          </div>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card><p className="text-sm font-bold text-slate-950">Insumos de referencia</p><p className="mt-2 text-3xl font-black">{supplies.length}</p><p className="text-xs text-slate-500">No es inventario fisico completo.</p></Card>
        <Card><p className="text-sm font-bold text-slate-950">Promociones activas</p><p className="mt-2 text-3xl font-black">2</p><p className="text-xs text-slate-500">Aplicadas solo si estan activas.</p></Card>
        <Card><p className="text-sm font-bold text-slate-950">Demo controlada</p><p className="mt-2 text-3xl font-black">100%</p><p className="text-xs text-slate-500">Sin pagos, facturacion ni portal publico.</p></Card>
      </div>
    </div>
  );
}
