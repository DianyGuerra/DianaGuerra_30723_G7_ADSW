import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createPackage, deactivatePackage, deletePackageItem, getPackage, listPackages, PackageRecord, upsertPackageItem, updatePackage, listInventory, InventoryItem, listServices, ServiceRecord, PackageItem } from '../api/catalog';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const emptyPackage = { name: '', description: '', eventTypes: 'Cumpleaños infantil', marginPercent: 35, minPrice: 0 };

export function PackagesPage() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [selected, setSelected] = useState<PackageRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PackageRecord | null>(null);
  const [form, setForm] = useState(emptyPackage);
  const [itemForm, setItemForm] = useState({ name: '', category: 'Insumo', unit: '', quantity: 1, basePrice: 0, inventoryItemId: '', serviceId: '' });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [addItemType, setAddItemType] = useState<'INSUMO' | 'SERVICIO'>('INSUMO');
  const [editingItem, setEditingItem] = useState<PackageItem | null>(null);
  const eventTypes = useMemo(() => ['Cumpleaños infantil', 'Fiesta infantil', 'Evento escolar', 'Mesa dulce', 'Evento familiar', 'Evento corporativo', 'Navidad', 'Dia del Niño'], []);

  async function load() {
    setPackages(await listPackages());
    try {
      setInventoryItems(await listInventory());
      setServices(await listServices());
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { 
      ...form, 
      eventTypes: form.eventTypes.split(',').map((item) => item.trim()).filter(Boolean), 
      marginPercent: Number(form.marginPercent),
      minPrice: Number(form.minPrice)
    };
    if (editing) await updatePackage(editing.id, payload);
    else await createPackage(payload);
    setCreating(false);
    setEditing(null);
    setForm(emptyPackage);
    await load();
  }

  async function saveItem() {
    if (!selected) return;
    const qty = Number(itemForm.quantity) > 0 ? Number(itemForm.quantity) : 1;
    const payload = {
      name: itemForm.name,
      category: itemForm.category,
      unit: itemForm.unit || 'Unidad',
      quantity: qty,
      basePrice: Number(itemForm.basePrice),
      inventoryItemId: itemForm.inventoryItemId || null,
      serviceId: itemForm.serviceId || null
    };
    const updated = await upsertPackageItem(selected.id, payload);
    setSelected(updated as PackageRecord);
    setItemForm({ name: '', category: 'Insumo', unit: '', quantity: 1, basePrice: 0, inventoryItemId: '', serviceId: '' });
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
                  <button onClick={() => { setEditing(item); setForm({ name: item.name, description: item.description, eventTypes: item.eventTypes.join(', '), marginPercent: Number(item.marginPercent), minPrice: Number(item.minPrice ?? 0) }); setCreating(true); }}>Editar</button>
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
            <label>Precio mínimo base ($)<input type="number" step="0.1" min="0" value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: Math.max(0, Number(e.target.value)) })} /></label>
            <label>Margen de ganancia (%)<input type="number" step="0.1" min="0" value={form.marginPercent} onChange={(e) => setForm({ ...form, marginPercent: Math.max(0, Number(e.target.value)) })} /></label>
            <label className="full-row">Descripción<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></label>
            <label className="full-row">Tipos de evento<input value={form.eventTypes} onChange={(e) => setForm({ ...form, eventTypes: e.target.value })} /></label>
            <button className="primary-btn">Guardar</button>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal title="Detalle financiero y operativo" onClose={() => setSelected(null)} style={{ width: 'min(1050px, 100%)' }}>
          <div className="three-panel">
            <section>
              <h3>Datos generales</h3>
              <p><strong>Nombre:</strong> {selected.name}</p>
              <p><strong>Descripción:</strong> {selected.description}</p>
              <p><strong>Estado:</strong> {selected.active ? 'Activo' : 'Inactivo'}</p>
              <p><strong>Precio mínimo base:</strong> ${Number(selected.minPrice ?? 0).toFixed(2)}</p>
              {selected.pricePerChild && Number(selected.pricePerChild) > 0 && (
                <>
                  <p><strong>Precio por niño:</strong> ${Number(selected.pricePerChild).toFixed(2)}</p>
                  <p><strong>Mínimo de niños:</strong> {selected.minChildren ?? '-'}</p>
                </>
              )}
            </section>
            <section style={{ display: 'flex', flexDirection: 'column' }}>
              <h3>Desglose de ítems y servicios</h3>
              <div 
                style={{ 
                  maxHeight: '280px', 
                  overflowY: 'auto', 
                  marginBottom: '16px',
                  paddingRight: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {selected.items.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', margin: '20px 0' }}>No hay insumos ni servicios vinculados.</p>
                ) : (
                  selected.items.map((item) => (
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
                          <span 
                            style={{
                              display: 'inline-block',
                              marginTop: '4px',
                              fontSize: '10px',
                              fontWeight: '600',
                              color: item.category === 'Servicio' ? '#4f46e5' : '#10b981',
                              background: item.category === 'Servicio' ? '#eef2ff' : '#ecfdf5',
                              padding: '2px 8px',
                              borderRadius: '20px'
                            }}
                          >
                            {item.category}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
                          {item.unit ? `${item.unit}` : 'Unidad'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px dashed #f3f4f6', paddingTop: '6px' }}>
                        <div style={{ fontSize: '12px', color: '#4b5563' }}>
                          Precio: <strong>${Number(item.basePrice).toFixed(2)}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {editingItem?.id === item.id ? (
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
                                value={editingItem.quantity} 
                                onChange={(e) => setEditingItem({ ...editingItem, quantity: Math.max(1, Number(e.target.value)) })}
                              />
                              <button 
                                onClick={async () => {
                                  const updated = await upsertPackageItem(selected.id, {
                                    id: editingItem.id,
                                    name: editingItem.name,
                                    category: editingItem.category,
                                    unit: editingItem.unit,
                                    quantity: editingItem.quantity,
                                    basePrice: Number(editingItem.basePrice),
                                    inventoryItemId: editingItem.inventoryItemId,
                                    serviceId: editingItem.serviceId
                                  });
                                  setSelected(updated as PackageRecord);
                                  setEditingItem(null);
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
                                onClick={() => setEditingItem(null)}
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
                                onClick={() => setEditingItem(item)}
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
                              if (confirm(`¿Estás seguro de eliminar ${item.name} de este paquete?`)) {
                                const updated = await deletePackageItem(item.id);
                                setSelected(updated as PackageRecord);
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
                <div style={{ display: 'flex', background: '#f3f4f6', padding: '3px', borderRadius: '10px', marginBottom: '8px', border: '1px solid #e5e7eb' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setAddItemType('INSUMO');
                      setItemForm({ name: '', category: 'Insumo', unit: '', quantity: 1, basePrice: 0, inventoryItemId: '', serviceId: '' });
                    }}
                    style={{ 
                      flex: 1, 
                      padding: '6px 10px', 
                      cursor: 'pointer', 
                      background: addItemType === 'INSUMO' ? '#ffffff' : 'transparent', 
                      color: addItemType === 'INSUMO' ? '#7c3aed' : '#4b5563', 
                      border: 'none', 
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: addItemType === 'INSUMO' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Insumo
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setAddItemType('SERVICIO');
                      setItemForm({ name: '', category: 'Servicio', unit: 'Servicio', quantity: 1, basePrice: 0, inventoryItemId: '', serviceId: '' });
                    }}
                    style={{ 
                      flex: 1, 
                      padding: '6px 10px', 
                      cursor: 'pointer', 
                      background: addItemType === 'SERVICIO' ? '#ffffff' : 'transparent', 
                      color: addItemType === 'SERVICIO' ? '#7c3aed' : '#4b5563', 
                      border: 'none', 
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: addItemType === 'SERVICIO' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Servicio
                  </button>
                </div>

                {addItemType === 'INSUMO' ? (
                  <select 
                    value={itemForm.inventoryItemId} 
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = inventoryItems.find(x => x.id === selectedId);
                      if (found) {
                        setItemForm({
                          ...itemForm,
                          name: found.name,
                          unit: found.unit,
                          basePrice: Number(found.currentCost),
                          inventoryItemId: found.id,
                          serviceId: ''
                        });
                      } else {
                        setItemForm({ ...itemForm, name: '', unit: '', basePrice: 0, inventoryItemId: '', serviceId: '' });
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
                ) : (
                  <select 
                    value={itemForm.serviceId} 
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = services.find(x => x.id === selectedId);
                      if (found) {
                        setItemForm({
                          ...itemForm,
                          name: found.name,
                          unit: 'Servicio',
                          basePrice: Number(found.suggestedPrice),
                          inventoryItemId: '',
                          serviceId: found.id
                        });
                      } else {
                        setItemForm({ ...itemForm, name: '', unit: '', basePrice: 0, inventoryItemId: '', serviceId: '' });
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
                    <option value="">-- Seleccione un servicio --</option>
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} (${Number(svc.suggestedPrice).toFixed(2)})
                      </option>
                    ))}
                  </select>
                )}

                <input 
                  type="number" 
                  min="1" 
                  placeholder="Cantidad (defecto: 1)" 
                  value={itemForm.quantity || ''} 
                  onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value ? Number(e.target.value) : 0 })} 
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
                  onClick={saveItem} 
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