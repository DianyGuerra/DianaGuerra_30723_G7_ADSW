import { Badge } from "../ui/Badge";
import { Notice } from "../ui/Notice";
import { ScopeNote } from "../ui/ScopeNote";
import { SelfCheckPanel } from "../ui/SelfCheckPanel";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout({ navigation, notice, clearNotice, checks, children }) {
  const { active, setActive, sidebarOpen, setSidebarOpen, activeItem } = navigation;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="min-w-0 flex-1">
          <Topbar setOpen={setSidebarOpen} />
          <div className="px-4 py-6 lg:px-8">
            <Notice notice={notice} onClose={clearNotice} />
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Modulo seleccionado</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{activeItem.trace}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="Activo">Cliente-servidor web</Badge>
                <Badge variant="Borrador">PostgreSQL previsto</Badge>
                <Badge variant="Enviada">PDF + WhatsApp simulado</Badge>
              </div>
            </div>
            {children}
            <SelfCheckPanel checks={checks} />
            <ScopeNote />
          </div>
        </main>
      </div>
    </div>
  );
}
