import { FormEvent, useEffect, useState } from 'react';
import { Client, listClients } from '../api/clients';
import { createQuote, downloadQuotePdf, listPackages, listQuotes, Package, Quote, sendQuoteWhatsApp, updateQuoteStatus } from '../api/quotes';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const eventTypes = ['Cumpleaños infantil', 'Fiesta infantil', 'Evento escolar', 'Mesa dulce', 'Evento familiar', 'Evento corporativo', 'Navidad', 'Dia del Niño'];

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '' });
  const [wizard, setWizard] = useState(false);
  const [statusQuote, setStatusQuote] = useState<Quote | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ clientId: '', eventDate: '', eventType: eventTypes[0], packageId: '', childrenCount: 20, discount: 0, notes: '' });

  async function load() {
    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    setQuotes(await listQuotes(activeFilters));
    setClients(await listClients());
    setPackages(await listPackages());
  }

  useEffect(() => { load(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await createQuote({
      ...form,
      childrenCount: Number(form.childrenCount),
      discount: Number(form.discount),
      customItems: form.packageId ? undefined : [{ description: 'Servicio personalizado', category: 'Personalizado', quantity: 1, unitPrice: 100 }],
    });
    setWizard(false);
    await load();
  }

  async function changeStatus(status: Quote['status']) {
    if (!statusQuote) return;
    await updateQuoteStatus(statusQuote.id, status);
    setStatusQuote(null);
    await load();
  }

  async function sendWhatsApp(quote: Quote) {
    const response = await sendQuoteWhatsApp(quote.id);
    setMessage(response.message ?? 'Solicitud de envío procesada.');
  }

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">RF11 - RF15</p>
          <h1>Cotizaciones</h1>
          <p>Historial, filtros, wizard, estado comercial, PDF y WhatsApp.</p>
        </div>
        <button className="primary-btn" onClick={() => setWizard(true)}>+ Crear Cotización</button>
      </div>

      {message && <div className="alert success">{message}</div>}

      <section className="toolbar three">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="SENT">Enviada</option>
          <option value="ACCEPTED">Aceptada</option>
          <option value="REJECTED">Rechazada</option>
          <option value="EXPIRED">Vencida</option>
        </select>
        <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
        <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
        <button className="secondary-btn" onClick={load}>Aplicar filtros</button>
      </section>

      <section className="table-card">
        <table>
          <thead><tr><th>Código</th><th>Cliente</th><th>Fecha Evento</th><th>Versión</th><th>Estado</th><th>Monto Total</th><th>Acciones</th></tr></thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td>{quote.code}</td>
                <td>{quote.client.fullName}</td>
                <td>{String(quote.eventDate).slice(0, 10)}</td>
                <td>v{quote.version}</td>
                <td><Badge value={quote.status} /></td>
                <td>${quote.total}</td>
                <td className="actions">
                  <button onClick={() => setStatusQuote(quote)}>Estado</button>
                  <button onClick={() => downloadQuotePdf(quote.id)}>PDF</button>
                  <button onClick={() => sendWhatsApp(quote)}>WhatsApp</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {wizard && (
        <Modal title="Wizard de generación de cotización" onClose={() => setWizard(false)}>
          <form className="form-grid wizard" onSubmit={submit}>
            <h3>Paso 1: Cliente</h3>
            <label>Cliente<select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}><option value="">Seleccione</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></label>
            <h3>Paso 2: Paquete base</h3>
            <label>Paquete<select value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })}><option value="">Personalizado simple</option>{packages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <h3>Paso 3: Fecha y tipo de evento</h3>
            <label>Fecha tentativa<input required type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></label>
            <label>Tipo de evento<select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>{eventTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <h3>Paso 4: Ajustes comerciales</h3>
            <label>Número de niños/personas<input type="number" value={form.childrenCount} onChange={(e) => setForm({ ...form, childrenCount: Number(e.target.value) })} /></label>
            <label>Descuento<input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} /></label>
            <label>Notas<input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            <button className="primary-btn">Generar cotización</button>
          </form>
        </Modal>
      )}

      {statusQuote && (
        <Modal title="Actualizar Estado de Cotización" onClose={() => setStatusQuote(null)}>
          <p>Cotización: <strong>{statusQuote.code}</strong></p>
          <div className="status-actions">
            {(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'] as Quote['status'][]).map((status) => (
              <button key={status} className="secondary-btn" onClick={() => changeStatus(status)}>{status}</button>
            ))}
          </div>
        </Modal>
      )}
    </main>
  );
}
