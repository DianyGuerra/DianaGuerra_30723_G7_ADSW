import { menuItems } from "../../constants/menuItems";
import { AppIcon } from "../ui/AppIcon";

export function Sidebar({ active, setActive, open, setOpen }) {
  return (
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-4 transition lg:static lg:translate-x-0`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-700 p-2.5 text-white"><AppIcon name="wand" className="h-6 w-6" /></div>
          <div>
            <h1 className="text-lg font-black text-slate-950">FastKote</h1>
            <p className="text-xs text-slate-500">Chichi Esta de Fiesta</p>
          </div>
        </div>
        <button type="button" className="rounded-md p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(false)}>
          <AppIcon name="close" className="h-5 w-5" />
        </button>
      </div>
      <div className="mb-4 rounded-lg bg-violet-50 p-3 text-xs text-violet-900 ring-1 ring-violet-100">
        <p className="font-bold">Rol activo</p>
        <p>Administrador de Cotizaciones</p>
      </div>
      <nav className="grid gap-1.5">
        {menuItems.map((item) => {
          const isCurrent = active === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setActive(item.id);
                setOpen(false);
              }}
              className={`flex items-center rounded-lg px-3 py-3 text-left transition ${isCurrent ? "bg-violet-700 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <AppIcon name={item.icon} className={`h-4 w-4 ${isCurrent ? "text-white" : "text-slate-500"}`} />
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
        <p className="text-xs font-bold text-slate-700">Trazabilidad visible</p>
        <p className="mt-1 text-xs text-slate-500">Cada modulo muestra RF/CU para defensa academica.</p>
      </div>
    </aside>
  );
}
