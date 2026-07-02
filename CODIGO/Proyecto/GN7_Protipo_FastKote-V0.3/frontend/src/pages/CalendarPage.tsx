import { useEffect, useState } from 'react';
import { listCalendar } from '../api/quotes';
import { Badge } from '../components/ui/Badge';

export function CalendarPage() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    listCalendar().then(setEntries);
  }, []);

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">Agenda comercial</p>
          <h1>Calendario de eventos</h1>
          <p>Fechas bloqueadas automáticamente cuando una cotización pasa a aceptada.</p>
        </div>
      </div>

      <section className="calendar-grid">
        {entries.length === 0 && <div className="empty-card">No hay fechas bloqueadas por ahora.</div>}
        {entries.map((entry) => (
          <article className="calendar-card" key={entry.id}>
            <Badge value={entry.status} />
            <h2>{String(entry.eventDate).slice(0, 10)}</h2>
            <p>{entry.quote?.client?.fullName}</p>
            <small>{entry.quote?.code} · {entry.reason}</small>
          </article>
        ))}
      </section>
    </main>
  );
}
