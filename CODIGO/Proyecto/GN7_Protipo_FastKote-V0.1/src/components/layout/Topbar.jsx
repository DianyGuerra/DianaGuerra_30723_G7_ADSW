import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { AppIcon } from "../ui/AppIcon";

export function Topbar({ setOpen }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button type="button" className="rounded-md p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)}>
          <AppIcon name="menu" className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-bold text-slate-950">Prototipo academico FastKote</p>
          <p className="text-xs text-slate-500">React + Vite · Estado local · Flujo simulado sin backend</p>
        </div>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        <Badge variant="Enviada">Sprint academico</Badge>
        <Button variant="secondary" icon="logout">Salir</Button>
      </div>
    </header>
  );
}
