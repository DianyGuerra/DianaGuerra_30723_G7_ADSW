import { FormEvent, useEffect, useState } from 'react';
import { createService, deleteServiceComponent, deactivateService, listServices, ServiceRecord, upsertServiceComponent, updateService, listInventory, InventoryItem } from '../api/catalog';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const emptyService: { type: 'SERVICE' | 'PRODUCT'; name: string; description: string; suggestedPrice: number } = { type: 'SERVICE', name: '', description: '', suggestedPrice: 0 };

export function ServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [selected, setSelected] = useState<ServiceRecord | null>(null);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyService);
  const [component, setComponent] = useState({ inventoryItemId: '', name: '', unit: '', quantity: 1, unitCost: 0 });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [editingComponent, setEditingComponent] = useState<any>(null);

  async function load() {
    setServices(await listServices());
    try {
      setInventoryItems(await listInventory());
    } catch (err) {
      console.error(err);
    }
  }

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
    const qty = Number(component.quantity) > 0 ? Number(component.quantity) : 1;
    const payload = {
      inventoryItemId: component.inventoryItemId || null,
      name: component.name,
      unit: component.unit,
      quantity: qty,
      unitCost: Number(component.unitCost)
    };
    const updated = await upsertServiceComponent(selected.id, payload);
    setSelected(updated as ServiceRecord);
    setComponent({ inventoryItemId: '', name: '', unit: '', quantity: 1, unitCost: 0 });
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
            <label>Precio sugerido<input type="number" step="0.01" min="0" value={form.suggestedPrice} onChange={(e) => setForm({ ...form, suggestedPrice: Math.max(0, Number(e.target.value)) })} /></label>
            <label className="full-row">Descripción<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <button className="primary-btn">Guardar</button>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal title="Gestionar contenido de receta" onClose={() => setSelected(null)} style={{ width: 'min(900px, 100%)' }}>
          <div className="three-panel" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <section>
              <h3>Datos generales</h3>
              <p><strong>Nombre:</strong> {selected.name}</p>
              <p><strong>Tipo:</strong> {selected.type === 'SERVICE' ? 'Servicio' : 'Producto'}</p>
              <p><strong>Descripción:</strong> {selected.description}</p>
              <p><strong>Precio sugerido:</strong> ${Number(selected.suggestedPrice).toFixed(2)}</p>
            </section>
            
            <section style={{ display: 'flex', flexDirection: 'column' }}>
              <h3>Insumos vinculados (Receta)</h3>
              <div 
                style={{ 
                  maxHeight: '220px', 
                  overflowY: 'auto', 
                  marginBottom: '16px',
                  paddingRight: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {selected.components.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', margin: '20px 0' }}>No hay insumos vinculados a la receta.</p>
                ) : (
                  selected.components.map((item) => (
                    <div 
                      key={item.id} 
                      style={{
                        background: '#ffffff',
                        border: '1px solid rgba(124, 58, 237, 0.12)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(124, 58, 237, 0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, marginRight: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '13px', color: '#1f2937', fontWeight: '600', lineHeight: '1.3' }}>
                            {item.name}
                          </h4>
                        </div>
                        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
                          {item.unit ? `${item.unit}` : 'Unidad'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px dashed #f3f4f6', paddingTop: '6px' }}>
                        <div style={{ fontSize: '12px', color: '#4b5563' }}>
                          Costo unitario: <strong>${Number(item.unitCost).toFixed(2)}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {editingComponent?.id === item.id ? (
                            <>
                              <input 
                                type="number" 
                                style={{
                                  width: '50px',
                                  textAlign: 'center',
                                  padding: '4px',
                                  border: '1px solid #7c3aed',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  outline: 'none'
                                }} 
                                min="1" 
                                value={editingComponent.quantity} 
                                onChange={(e) => setEditingComponent({ ...editingComponent, quantity: Math.max(1, Number(e.target.value)) })}
                              />
                              <button 
                                onClick={async () => {
                                  const updated = await upsertServiceComponent(selected.id, {
                                    id: editingComponent.id,
                                    name: editingComponent.name,
                                    unit: editingComponent.unit,
                                    quantity: editingComponent.quantity,
                                    unitCost: Number(editingComponent.unitCost),
                                    inventoryItemId: editingComponent.inventoryItemId
                                  });
                                  setSelected(updated as ServiceRecord);
                                  setEditingComponent(null);
                                  await load();
                                }}
                                style={{
                                  padding: '4px 6px',
                                  background: '#10b981',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: 'bold'
                                }}
                              >
                                ✓
                              </button>
                              <button 
                                onClick={() => setEditingComponent(null)}
                                style={{
                                  padding: '4px 6px',
                                  background: '#9ca3af',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: 'bold'
                                }}
                              >
                                ✗
                              </button>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(124,58,237,0.1)' }}>
                                x{item.quantity}
                              </span>
                              <button 
                                onClick={() => setEditingComponent(item)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#e0e7ff',
                                  color: '#4f46e5',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}
                              >
                                Editar
                              </button>
                            </>
                          )}
                          <button 
                            onClick={async () => {
                              if (confirm(`¿Estás seguro de eliminar ${item.name} de este servicio?`)) {
                                const updated = await deleteServiceComponent(item.id);
                                setSelected(updated as ServiceRecord);
                                await load();
                              }
                            }}
                            style={{
                              padding: '4px 8px',
                              background: '#fee2e2',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="small-form" style={{ borderTop: '1px dashed rgba(124, 58, 237, 0.2)', paddingTop: '12px' }}>
                <select
                  value={inventoryItems.find(x => x.name === component.name)?.id || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const found = inventoryItems.find(x => x.id === selectedId);
                    if (found) {
                      setComponent({
                        ...component,
                        inventoryItemId: found.id,
                        name: found.name,
                        unit: found.unit,
                        unitCost: Number(found.currentCost)
                      });
                    } else {
                      setComponent({ ...component, inventoryItemId: '', name: '', unit: '', unitCost: 0 });
                    }
                  }}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '8px 10px', 
                    marginBottom: '8px',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: '#fff',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Seleccione un insumo --</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (${Number(item.currentCost).toFixed(2)} / {item.unit})
                    </option>
                  ))}
                </select>
                <input 
                  type="number" 
                  min="1" 
                  placeholder="Cantidad (defecto: 1)" 
                  value={component.quantity || ''} 
                  onChange={(e) => setComponent({ ...component, quantity: e.target.value ? Number(e.target.value) : 0 })} 
                  style={{ 
                    width: '100%', 
                    padding: '8px 10px', 
                    marginBottom: '8px',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: '#fff',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                />
                <button 
                  className="secondary-btn" 
                  onClick={saveComponent}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '13px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(124, 58, 237, 0.15)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  Vincular al paquete
                </button>
              </div>
            </section>
          </div>
        </Modal>
      )}
    </main>
  );
}