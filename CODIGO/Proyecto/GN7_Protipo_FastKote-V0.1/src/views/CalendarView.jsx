import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { SectionHeader } from "../components/ui/SectionHeader";

export function CalendarView({ calendarEntries }) {
  return (
    <div>
      <SectionHeader
        eyebrow="CU-SGC-L1-16 · CU-SGC-L1-17 · RN-03"
        title="Calendario de eventos"
        description="La disponibilidad se calcula desde las cotizaciones: Aceptada bloquea; Borrador/Enviada queda tentativa; Rechazada/Vencida libera."
        action={<Button variant="secondary" icon="calendar">Consultar disponibilidad</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {calendarEntries.map((entry) => (
          <Card key={entry.date} className={entry.state === "Bloqueada" ? "ring-2 ring-emerald-100" : ""}>
            <p className="text-sm font-bold text-slate-500">{entry.date}</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">{entry.state}</h3>
            <p className="mt-2 text-sm text-slate-600">{entry.summary}</p>
            <p className="text-sm text-slate-500">{entry.client}</p>
            <div className="mt-4"><Badge variant={entry.state}>{entry.state}</Badge></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
