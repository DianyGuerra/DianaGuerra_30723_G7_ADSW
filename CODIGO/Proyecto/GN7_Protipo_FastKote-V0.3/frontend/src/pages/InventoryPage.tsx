import { FormEvent, useEffect, useState } from 'react';
import { createInventoryItem, createInventoryMovement, InventoryItem, listInventory, updateInventoryCost } from '../api/catalog';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const emptyItem = { name: '', unit: '', brand: '', currentCost: 0, stock: 0 };

function fixSpanishText(value: string) {
  return value
    .replace(/Az\?\?car/g, 'Azúcar')
    .replace(/Ca\?\?averal/g, 'Cañaveral')
    .replace(/Harina de trigo/g, 'Harina de trigo')
    .replace(/Vasos biodegradables/g, 'Vasos biodegradables')
    .replace(/Servilletas decoradas/g, 'Servilletas decoradas')
    .replace(/Azu\?\?car/g, 'Azúcar')
    .replace(/Can\?\?averal/g, 'Cañaveral');
}

function formatMoney(value: string | number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00';
}

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [costModal, setCostModal] = useState<InventoryItem | null>(null);
  const [movementModal, setMovementModal] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(emptyItem);
  const [movement, setMovement] = useState({ type: 'IN' as 'IN' | 'OUT' | 'COST_UPDATE', quantity: 1, newCost: 0, notes: '' });

  async function load() {
    setItems(await listInventory());
  }

  useEffect(() => { load(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await createInventoryItem({ ...form, currentCost: Number(form.currentCost), stock: Number(form.stock) });
    setCreating(false);
    setForm(emptyItem);
    await load();
  }

  async function saveCost() {
    if (!costModal) return;
    await updateInventoryCost(costModal.id, Number(costModal.currentCost));
    setCostModal(null);
    await load();
  }

  async function saveMovement() {
    if (!movementModal) return;
    await createInventoryMovement(movementModal.id, movement);
    setMovementModal(null);
    await load();
  }

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">RF16</p>
          <h1>Catálogo de insumos</h1>
          <p>Mantén materia prima, costos y auditoría de movimientos.</p>
        </div>
        <button className="primary-btn" onClick={() => setCreating(true)}>+ Registrar Insumo</button>
      </div>

      <section className="table-card">
        <table>
          <thead><tr><th>Nombre</th><th>Unidad</th><th>Marca</th><th>Costo</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{fixSpanishText(item.name)}</strong>
                  <span className="subtle-line">Insumo activo del catálogo</span>
                </td>
                <td>{fixSpanishText(item.unit)}</td>
                <td>{item.brand ? fixSpanishText(item.brand) : '-'}</td>
                <td>${formatMoney(item.currentCost)}</td>
                <td>{item.stock}</td>
                <td><Badge value={item.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                <td className="actions">
                  <button type="button" onClick={() => setSelected(item)}>Ver historial</button>
                  <button type="button" onClick={() => setCostModal(item)}>Actualizar costo</button>
                  <button type="button" onClick={() => setMovementModal(item)}>Movimiento</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {creating && (
        <Modal title="Registrar nuevo insumo" onClose={() => setCreating(false)}>
          <form className="form-grid" onSubmit={submit}>
            <label>Nombre<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Unidad<input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
            <label>Marca opcional<input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></label>
            <label>Costo actual<input type="number" step="0.01" value={form.currentCost} onChange={(e) => setForm({ ...form, currentCost: Number(e.target.value) })} /></label>
            <label>Stock inicial<input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></label>
            <button className="primary-btn">Guardar</button>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal title="Historial de movimientos" onClose={() => setSelected(null)}>
          <div className="detail-grid">
            <p><strong>Insumo:</strong> {fixSpanishText(selected.name)}</p>
            <p><strong>Unidad:</strong> {fixSpanishText(selected.unit)}</p>
            <p><strong>Marca:</strong> {selected.brand ? fixSpanishText(selected.brand) : 'Sin marca registrada'}</p>
            <p><strong>Costo actual:</strong> ${formatMoney(selected.currentCost)}</p>
            <p><strong>Stock:</strong> {selected.stock}</p>
            <p><strong>Auditoría:</strong> solo lectura</p>
            {selected.movements.map((movementItem) => (
              <article key={movementItem.id} className="audit-row">
                <strong>{movementItem.type}</strong>
                <span>{movementItem.createdAt.slice(0, 10)} · prev. ${movementItem.previousCost} → nuevo ${movementItem.newCost}</span>
                <p>{movementItem.notes ? fixSpanishText(movementItem.notes) : 'Sin observaciones'}</p>
              </article>
            ))}
          </div>
          <button type="button" className="secondary-btn" onClick={() => setSelected(null)}>Cerrar</button>
        </Modal>
      )}

      {costModal && (
        <Modal title="Actualizar costo de insumo" onClose={() => setCostModal(null)}>
          <p>Costo anterior: <strong>${formatMoney(costModal.currentCost)}</strong></p>
          <label className="full-row">Nuevo costo<input type="number" step="0.01" value={costModal.currentCost} onChange={(e) => setCostModal({ ...costModal, currentCost: e.target.value })} /></label>
          <button type="button" className="primary-btn" onClick={saveCost}>Guardar costo</button>
        </Modal>
      )}

      {movementModal && (
        <Modal title="Registrar movimiento" onClose={() => setMovementModal(null)}>
          <div className="form-grid">
            <label>Tipo<select value={movement.type} onChange={(e) => setMovement({ ...movement, type: e.target.value as any })}><option value="IN">Entrada</option><option value="OUT">Salida</option><option value="COST_UPDATE">Cambio de costo</option></select></label>
            <label>Cantidad<input type="number" value={movement.quantity} onChange={(e) => setMovement({ ...movement, quantity: Number(e.target.value) })} /></label>
            <label>Nuevo costo<input type="number" step="0.01" value={movement.newCost} onChange={(e) => setMovement({ ...movement, newCost: Number(e.target.value) })} /></label>
            <label>Notas<input value={movement.notes} onChange={(e) => setMovement({ ...movement, notes: e.target.value })} /></label>
            <button type="button" className="primary-btn" onClick={saveMovement}>Guardar movimiento</button>
          </div>
        </Modal>
      )}
    </main>
  );
}