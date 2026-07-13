import { useEffect, useState } from 'react';
import { listCalendar, updateReservationStatus } from '../api/quotes';
import { Badge } from '../components/ui/Badge';

export function CalendarPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    listCalendar().then(setEntries);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id: string, status: string) {
    try {
      await updateReservationStatus(id, status);
      setMessage('Estado de reserva actualizado con éxito.');
      setTimeout(() => setMessage(''), 4000);
      load();
    } catch (err: any) {
      console.error(err);
      setMessage('Error al actualizar el estado de la reserva.');
      setTimeout(() => setMessage(''), 4000);
    }
  }

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">Agenda comercial</p>
          <h1>Calendario de eventos</h1>
          <p>Consulta, bloquea o finaliza reservas de eventos comerciales de cotizaciones aceptadas.</p>
        </div>
      </div>

      {message && <div className="alert success">{message}</div>}

      <section className="calendar-grid">
        {entries.length === 0 && <div className="empty-card">No hay reservas de eventos por ahora.</div>}
        {entries.map((entry) => (
          <article className="calendar-card" key={entry.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Badge value={entry.status} />
              <small style={{ color: 'var(--text-muted)' }}>{entry.quote?.code}</small>
            </div>
            <h2>{String(entry.eventDate).slice(0, 10)}</h2>
            <p style={{ fontWeight: 'bold', margin: '4px 0' }}>{entry.quote?.client?.fullName}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', minHeight: '38px' }}>{entry.reason}</p>
            
            {entry.status === 'BLOCKED' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button 
                  className="primary-btn sm" 
                  style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                  onClick={() => changeStatus(entry.id, 'COMPLETED')}
                >
                  Completar
                </button>
                <button 
                  className="secondary-btn sm" 
                  style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                  onClick={() => changeStatus(entry.id, 'RELEASED')}
                >
                  Liberar
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
