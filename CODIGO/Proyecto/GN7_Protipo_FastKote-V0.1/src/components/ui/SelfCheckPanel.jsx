import { AppIcon } from "./AppIcon";
import { Badge } from "./Badge";

export function SelfCheckPanel({ checks }) {
  const failed = checks.filter((check) => !check.pass);

  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">Pruebas internas del prototipo</p>
          <p className="text-xs text-slate-500">Validaciones simples sobre datos mock, reglas RN y trazabilidad.</p>
        </div>
        <Badge variant={failed.length === 0 ? "Activo" : "Critico"}>{failed.length === 0 ? "Todas pasan" : `${failed.length} fallan`}</Badge>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {checks.map((check) => (
          <div key={check.name} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
            <AppIcon name={check.pass ? "check" : "alert"} className={check.pass ? "h-4 w-4 text-emerald-600" : "h-4 w-4 text-red-600"} />
            <span className="text-xs text-slate-700">{check.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
