import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Client, listClients } from '../api/clients';
import { createQuote, downloadQuotePdf, listPackages, listQuotes, Package, Quote, sendQuoteWhatsApp, updateQuoteStatus, updateQuote } from '../api/quotes';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { listPromotions, PromotionRecord } from '../api/catalog';

const eventTypes = ['Cumpleaños infantil', 'Fiesta infantil', 'Evento escolar', 'Mesa dulce', 'Evento familiar', 'Evento corporativo', 'Navidad', 'Dia del Niño'];

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  EXPIRED: 'Vencida',
};

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '' });
  const [wizard, setWizard] = useState(false);
  const [statusQuote, setStatusQuote] = useState<Quote | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ clientId: '', eventDate: '', eventType: eventTypes[0], packageId: '', childrenCount: 20, discount: 0, notes: '' });
  const [selectedPromoId, setSelectedPromoId] = useState<string>('');
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  async function load() {
    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    setQuotes(await listQuotes(activeFilters));
    setClients(await listClients());
    setPackages(await listPackages());
    try {
      setPromotions(await listPromotions());
    } catch (err) {
      console.error('No se pudieron cargar las promociones', err);
    }
  }

  useEffect(() => { load(); }, []);

  const activePromosForSelectedPackage = useMemo(() => {
    if (!form.packageId) return [];
    const now = new Date();
    return promotions.filter((promo) => {
      if (!promo.active) return false;
      const targetsPackage = promo.packages.some((p) => p.package.id === form.packageId);
      if (!targetsPackage) return false;

      // Opcional: verificación de fechas de vigencia
      if (promo.startDate) {
        const start = new Date(promo.startDate);
        if (start > now) return false;
      }
      if (promo.endDate) {
        const end = new Date(promo.endDate + 'T23:59:59');
        if (end < now) return false;
      }
      return true;
    });
  }, [promotions, form.packageId]);

  function handlePackageChange(packageId: string) {
    setSelectedPromoId('');
    setForm((f) => ({ ...f, packageId, discount: 0 }));
  }

  function handlePromoChange(promoId: string) {
    setSelectedPromoId(promoId);
    const promo = activePromosForSelectedPackage.find((p) => p.id === promoId);
    if (promo) {
      setForm((f) => ({ ...f, discount: Number(promo.discountPercent) }));
    } else {
      setForm((f) => ({ ...f, discount: 0 }));
    }
  }

  function calculateSubtotal() {
    const selectedPkg = packages.find((p) => p.id === form.packageId);
    if (!selectedPkg) return 100; // Personalizado simple base price
    if (selectedPkg.pricePerChild && Number(selectedPkg.pricePerChild) > 0) {
      const minChildren = Number(selectedPkg.minChildren ?? 1);
      const childrenCount = Math.max(Number(form.childrenCount ?? minChildren), minChildren);
      return childrenCount * Number(selectedPkg.pricePerChild);
    }
    return Number(selectedPkg.basePrice ?? 0);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const subtotal = calculateSubtotal();
    const discountPercent = Math.min(100, Math.max(0, Number(form.discount)));
    const discountAmount = Number((subtotal * (discountPercent / 100)).toFixed(2));

    const payload = {
      ...form,
      childrenCount: Number(form.childrenCount),
      discount: discountAmount,
      customItems: form.packageId ? undefined : [{ description: 'Servicio personalizado', category: 'Personalizado', quantity: 1, unitPrice: 100 }],
    };

    if (editingQuoteId) {
      await updateQuote(editingQuoteId, { ...payload, id: editingQuoteId });
    } else {
      await createQuote(payload);
    }
    setWizard(false);
    setEditingQuoteId(null);
    setSelectedPromoId('');
    setForm({ clientId: '', eventDate: '', eventType: eventTypes[0], packageId: '', childrenCount: 20, discount: 0, notes: '' });
    await load();
  }

  function handleEdit(quote: any) {
    setEditingQuoteId(quote.id);
    const sub = Number(quote.subtotal) || 1;
    const discAmt = Number(quote.discount) || 0;
    const discPct = Math.round((discAmt / sub) * 100);

    setForm({
      clientId: quote.clientId,
      eventDate: String(quote.eventDate).slice(0, 10),
      eventType: quote.eventType,
      packageId: quote.packageId || '',
      childrenCount: quote.childrenCount || 20,
      discount: discPct,
      notes: quote.notes || '',
    });
    setWizard(true);
  }

  async function changeStatus(status: Quote['status']) {
    if (!statusQuote) return;
    await updateQuoteStatus(statusQuote.id, status);
    setStatusQuote(null);
    await load();
  }

  async function sendWhatsApp(quote: Quote) {
    try {
      const response = await sendQuoteWhatsApp(quote.id);
      if (response.simulated) {
        let digits = quote.client.phone.replace(/\D/g, '');
        if (digits.length === 10 && digits.startsWith('0')) {
          digits = '593' + digits.substring(1);
        }
        const text = encodeURIComponent(
          `¡Hola ${quote.client.fullName}! Le compartimos los detalles de su cotización de tipo *${quote.eventType}* con código *${quote.code}* por un total de *$${quote.total}*.`
        );
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${digits}&text=${text}`;
        window.open(whatsappUrl, '_blank');
        setMessage(`Simulación: Redirigiendo a WhatsApp Web para enviar a ${quote.client.fullName}.`);
      } else if (response.delivered) {
        setMessage('¡Cotización enviada con éxito por WhatsApp en segundo plano!');
      } else {
        setMessage(response.message ?? 'El proveedor de WhatsApp no pudo procesar el envío.');
      }
    } catch (error: any) {
      console.error(error);
      setMessage(`Error al enviar por WhatsApp: ${error.message || error}`);
    }
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
                  <button onClick={() => handleEdit(quote)}>Editar</button>
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
        <Modal title={editingQuoteId ? "Editar Cotización" : "Wizard de generación de cotización"} onClose={() => { setWizard(false); setEditingQuoteId(null); setSelectedPromoId(''); setForm({ clientId: '', eventDate: '', eventType: eventTypes[0], packageId: '', childrenCount: 20, discount: 0, notes: '' }); }}>
          <form className="form-grid wizard" onSubmit={submit}>
            <h3>Paso 1: Cliente</h3>
            <label>Cliente<select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}><option value="">Seleccione</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}</option>)}</select></label>
            <h3>Paso 2: Paquete base</h3>
            <label>Paquete<select value={form.packageId} onChange={(e) => handlePackageChange(e.target.value)}><option value="">Personalizado simple</option>{packages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <h3>Paso 3: Fecha y tipo de evento</h3>
            <label>Fecha tentativa<input required type="date" min={new Date().toLocaleDateString('sv').split('T')[0]} value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></label>
            <label>Tipo de evento<select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>{eventTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <h3>Paso 4: Ajustes comerciales</h3>
            <label>Número de niños/personas<input type="number" min="1" value={form.childrenCount} onChange={(e) => setForm({ ...form, childrenCount: Math.max(1, Number(e.target.value)) })} /></label>
            
            {form.packageId && activePromosForSelectedPackage.length > 0 && (
              <label>
                Promoción activa aplicable
                <select value={selectedPromoId} onChange={(e) => handlePromoChange(e.target.value)}>
                  <option value="">Sin promoción aplicada</option>
                  {activePromosForSelectedPackage.map((promo) => (
                    <option key={promo.id} value={promo.id}>
                      {promo.name} ({Number(promo.discountPercent)}% desc.)
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>Descuento (%)<input type="number" min="0" max="100" step="0.1" disabled={!!selectedPromoId} value={form.discount} onChange={(e) => { setSelectedPromoId(''); setForm({ ...form, discount: Math.min(100, Math.max(0, Number(e.target.value))) }); }} /></label>
            <label>Notas<input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            <button className="primary-btn">{editingQuoteId ? "Guardar cambios" : "Generar cotización"}</button>
          </form>
        </Modal>
      )}

      {statusQuote && (
        <Modal title="Actualizar Estado de Cotización" onClose={() => setStatusQuote(null)}>
          <p>Cotización: <strong>{statusQuote.code}</strong></p>
          <div className="status-actions">
            {(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'] as Quote['status'][]).map((status) => (
              <button key={status} className="secondary-btn" onClick={() => changeStatus(status)}>{statusLabels[status] || status}</button>
            ))}
          </div>
        </Modal>
      )}
    </main>
  );
}
