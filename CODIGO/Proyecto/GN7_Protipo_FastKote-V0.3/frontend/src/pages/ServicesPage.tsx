import { FormEvent, useEffect, useState } from 'react';
import { createService, deleteServiceComponent, deactivateService, listServices, ServiceRecord, upsertServiceComponent, updateService } from '../api/catalog';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const emptyService: { type: 'SERVICE' | 'PRODUCT'; name: string; description: string; suggestedPrice: number } = { type: 'SERVICE', name: '', description: '', suggestedPrice: 0 };

export function ServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [selected, setSelected] = useState<ServiceRecord | null>(null);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyService);
  const [component, setComponent] = useState({ name: '', unit: '', quantity: 1, unitCost: 0 });

  async function load() { setServices(await listServices()); }
  useEffect(() => { load(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (editing) await updateService(editing.id, form);
    else await createService(form);
    setCreating(false); setEditing(null); setForm(emptyService);
    await load();
  }

  async function saveComponent() {
    if (!selected) return;
    const updated = await upsertServiceComponent(selected.id, component);
    setSelected(updated as ServiceRecord);
    setComponent({ name: '', unit: '', quantity: 1, unitCost: 0 });
    await load();
  }

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">RF22 - RF24</p>
          <h1>Servicios y productos</h1>
          <p>Alta, edición, componentes y baja definitiva del catálogo comercial.</p>
        </div>
        <button className="primary-btn" onClick={() => setCreating(true)}>+ Registrar Servicio</button>
      </div>

      <section className="table-card">
        <table>
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.name}</td>
                <td>{service.type}</td>
                <td>${service.suggestedPrice}</td>
                <td><Badge value={service.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                <td className="actions">
                  <button onClick={() => setSelected(service)}>Editar receta</button>
                  <button type="button" onClick={() => { setEditing(service); setForm({ type: service.type, name: service.name, description: service.description, suggestedPrice: Number(service.suggestedPrice) }); setCreating(true); }}>Editar</button>
                  <button onClick={async () => { await deactivateService(service.id); await load(); }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {(creating || editing) && (
        <Modal title={editing ? 'Modificar servicio/producto' : 'Registrar servicio/producto'} onClose={() => { setCreating(false); setEditing(null); setForm(emptyService); }}>
          <form className="form-grid" onSubmit={submit}>
            <label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'SERVICE' | 'PRODUCT' })}><option value="SERVICE">Servicio</option><option value="PRODUCT">Producto</option></select></label>
            <label>Nombre<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Precio sugerido<input type="number" step="0.01" value={form.suggestedPrice} onChange={(e) => setForm({ ...form, suggestedPrice: Number(e.target.value) })} /></label>
            <label className="full-row">Descripción<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <button className="primary-btn">Guardar</button>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal title="Gestionar contenido de paquete" onClose={() => setSelected(null)}>
          <div className="detail-grid">
            <p><strong>Nombre:</strong> {selected.name}</p>
            <p><strong>Tipo:</strong> {selected.type}</p>
            <p><strong>Descripción:</strong> {selected.description}</p>
            <p><strong>Componentes vinculados:</strong></p>
            {selected.components.map((item) => (
              <article key={item.id} className="audit-row">
                <strong>{item.name}</strong>
                <span>{item.quantity} · ${item.unitCost}</span>
                <button className="secondary-btn" onClick={async () => { await deleteServiceComponent(item.id); const refreshed = await listServices(); setSelected(refreshed.find((candidate) => candidate.id === selected.id) ?? null); }}>Eliminar</button>
              </article>
            ))}
            <div className="small-form">
              <input placeholder="Nombre componente" value={component.name} onChange={(e) => setComponent({ ...component, name: e.target.value })} />
              <input placeholder="Unidad" value={component.unit} onChange={(e) => setComponent({ ...component, unit: e.target.value })} />
              <input type="number" value={component.quantity} onChange={(e) => setComponent({ ...component, quantity: Number(e.target.value) })} />
              <input type="number" step="0.01" value={component.unitCost} onChange={(e) => setComponent({ ...component, unitCost: Number(e.target.value) })} />
              <button className="secondary-btn" onClick={saveComponent}>Vincular al paquete</button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}