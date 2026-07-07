import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createPackage, deactivatePackage, deletePackageItem, getPackage, listPackages, PackageRecord, upsertPackageItem, updatePackage } from '../api/catalog';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const emptyPackage = { name: '', description: '', eventTypes: 'Cumpleaños infantil', marginPercent: 35 };

export function PackagesPage() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [selected, setSelected] = useState<PackageRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PackageRecord | null>(null);
  const [form, setForm] = useState(emptyPackage);
  const [itemForm, setItemForm] = useState({ name: '', category: '', unit: '', quantity: 1, basePrice: 0 });
  const eventTypes = useMemo(() => ['Cumpleaños infantil', 'Fiesta infantil', 'Evento escolar', 'Mesa dulce', 'Evento familiar', 'Evento corporativo', 'Navidad', 'Dia del Niño'], []);

  async function load() {
    setPackages(await listPackages());
  }

  useEffect(() => { load(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...form, eventTypes: form.eventTypes.split(',').map((item) => item.trim()).filter(Boolean), marginPercent: Number(form.marginPercent) };
    if (editing) await updatePackage(editing.id, payload);
    else await createPackage(payload);
    setCreating(false);
    setEditing(null);
    setForm(emptyPackage);
    await load();
  }

  async function saveItem() {
    if (!selected) return;
    const updated = await upsertPackageItem(selected.id, itemForm);
    setSelected(updated as PackageRecord);
    setItemForm({ name: '', category: '', unit: '', quantity: 1, basePrice: 0 });
    await load();
  }

  async function openDetail(id: string) {
    setSelected(await getPackage(id));
  }

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">RF17 - RF21</p>
          <h1>Paquetes comerciales</h1>
          <p>Consulta, crea, edita, gestiona contenido y desactiva ofertas base.</p>
        </div>
        <button className="primary-btn" onClick={() => setCreating(true)}>+ Crear Paquete</button>
      </div>

      <section className="table-card">
        <table>
          <thead><tr><th>Nombre</th><th>Margen</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {packages.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.marginPercent}%</td>
                <td>
                  {item.pricePerChild && Number(item.pricePerChild) > 0
                    ? `$${Number(item.pricePerChild).toFixed(2)} / niño`
                    : `$${item.salePrice ?? item.basePrice ?? '-'}`}
                </td>
                <td><Badge value={item.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                <td className="actions">
                  <button onClick={() => openDetail(item.id)}>Detalle</button>
                  <button onClick={() => { setEditing(item); setForm({ name: item.name, description: item.description, eventTypes: item.eventTypes.join(', '), marginPercent: Number(item.marginPercent) }); setCreating(true); }}>Editar</button>
                  <button onClick={async () => { await deactivatePackage(item.id); await load(); }}>Desactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {(creating || editing) && (
        <Modal title={editing ? 'Editar paquete' : 'Registrar paquete'} onClose={() => { setCreating(false); setEditing(null); setForm(emptyPackage); }}>
          <form className="form-grid" onSubmit={submit}>
            <label>Nombre<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Margen de ganancia<input type="number" step="0.1" min="0" value={form.marginPercent} onChange={(e) => setForm({ ...form, marginPercent: Math.max(0, Number(e.target.value)) })} /></label>
            <label className="full-row">Descripción<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></label>
            <label className="full-row">Tipos de evento<input value={form.eventTypes} onChange={(e) => setForm({ ...form, eventTypes: e.target.value })} /></label>
            <button className="primary-btn">Guardar</button>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal title="Detalle financiero y operativo" onClose={() => setSelected(null)}>
          <div className="three-panel">
            <section>
              <h3>Datos generales</h3>
              <p><strong>Nombre:</strong> {selected.name}</p>
              <p><strong>Descripción:</strong> {selected.description}</p>
              <p><strong>Estado:</strong> {selected.active ? 'Activo' : 'Inactivo'}</p>
              {selected.pricePerChild && Number(selected.pricePerChild) > 0 && (
                <>
                  <p><strong>Precio por niño:</strong> ${Number(selected.pricePerChild).toFixed(2)}</p>
                  <p><strong>Mínimo de niños:</strong> {selected.minChildren ?? '-'}</p>
                </>
              )}
            </section>
            <section>
              <h3>Desglose de ítems</h3>
              {selected.items.map((item) => (
                <p key={item.id}>{item.quantity} x {item.name} · ${item.basePrice}</p>
              ))}
              <div className="small-form">
                <input placeholder="Ítem" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
                <input placeholder="Categoría" value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} />
                <input placeholder="Unidad" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} />
                <input type="number" min="1" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: Math.max(1, Number(e.target.value)) })} />
                <input type="number" step="0.01" min="0" value={itemForm.basePrice} onChange={(e) => setItemForm({ ...itemForm, basePrice: Math.max(0, Number(e.target.value)) })} />
                <button className="secondary-btn" onClick={saveItem}>Vincular al paquete</button>
              </div>
            </section>
            <section>
              <h3>Indicadores financieros</h3>
              <p><strong>Costo total:</strong> ${selected.costTotal ?? '0.00'}</p>
              <p><strong>Margen:</strong> {selected.marginPercent}%</p>
              <p><strong>Precio final:</strong> {selected.pricePerChild && Number(selected.pricePerChild) > 0 
                ? `$${Number(selected.pricePerChild).toFixed(2)} / niño`
                : `$${selected.salePrice ?? selected.basePrice ?? '0.00'}`}
              </p>
            </section>
          </div>
          <button className="secondary-btn" onClick={() => setSelected(null)}>Cerrar</button>
        </Modal>
      )}
    </main>
  );
}