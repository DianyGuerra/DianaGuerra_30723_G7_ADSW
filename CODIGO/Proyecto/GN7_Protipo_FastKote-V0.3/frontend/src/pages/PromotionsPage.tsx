import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createPromotion, listPackages, listPromotions, listPromotionPreview, listServices, PromotionRecord, setPromotionTargets, togglePromotion, updatePromotion } from '../api/catalog';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const emptyPromotion = { name: '', discountPercent: 10, startDate: '', endDate: '', minAmount: 0, allowedDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as string[] };

function fixSpanishText(value: string) {
  return value
    .replace(/D\?\?a/g, 'Día')
    .replace(/Ni\?\?o/g, 'Niño')
    .replace(/S\?\?per/g, 'Súper')
    .replace(/Navide\?\?o/g, 'Navideño')
    .replace(/B\?\?sico/g, 'Básico')
    .replace(/M\?\?n/g, 'Mín')
    .replace(/Promoci\?\?n/g, 'Promoción')
    .replace(/aplicaci\?\?n/g, 'aplicación')
    .replace(/restricci\?\?n/g, 'restricción')
    .replace(/cotizaci\?\?n/g, 'cotización');
}

function formatMoney(value: unknown) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue.toFixed(2) : '0.00';
}

export function PromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [preview, setPreview] = useState<{ packages: any[]; services: any[] } | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PromotionRecord | null>(null);
  const [form, setForm] = useState(emptyPromotion);
  const [packageIds, setPackageIds] = useState<string[]>([]);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [catalogPackages, setCatalogPackages] = useState<any[]>([]);
  const [catalogServices, setCatalogServices] = useState<any[]>([]);

  const days = useMemo(() => ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], []);

  async function load() {
    setPromotions(await listPromotions());
    const [packages, services, promoPreview] = await Promise.all([listPackages(), listServices(), listPromotionPreview()]);
    setCatalogPackages(packages);
    setCatalogServices(services);
    setPreview(promoPreview);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...form, discountPercent: Number(form.discountPercent), minAmount: Number(form.minAmount), packageIds, serviceIds };
    if (editing) await updatePromotion(editing.id, payload);
    else await createPromotion(payload);
    setCreating(false); setEditing(null); setForm(emptyPromotion); setPackageIds([]); setServiceIds([]);
    await load();
  }

  async function saveTargets(id: string) {
    await setPromotionTargets(id, { packageIds, serviceIds });
    await load();
  }

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">RF25 - RF27</p>
          <h1>Promociones</h1>
          <p>Crea descuentos con vigencia, restricciones y aplicación a paquetes o productos.</p>
        </div>
        <button className="primary-btn" onClick={() => setCreating(true)}>+ Registrar Promoción</button>
      </div>

      {preview && (
        <section className="dashboard-panel">
          <h2>Tabla comparativa de precios</h2>
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Paquete / producto</th>
                  <th>Precio normal</th>
                  <th>Precio con descuento</th>
                  <th>Ahorro</th>
                  <th>Promoción</th>
                </tr>
              </thead>
              <tbody>
                {preview.packages.map((item: any) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{fixSpanishText(item.name)}</strong>
                      <span className="subtle-line">{fixSpanishText(item.description ?? '')}</span>
                    </td>
                    <td>
                      {item.pricePerChild && Number(item.pricePerChild) > 0
                        ? `$${formatMoney(item.pricePerChild)} / niño`
                        : `$${formatMoney(item.salePrice ?? item.basePrice)}`}
                    </td>
                    <td>
                      {item.pricePerChild && Number(item.pricePerChild) > 0
                        ? `$${formatMoney(item.discountedPrice)} / niño`
                        : `$${formatMoney(item.discountedPrice ?? item.salePrice ?? item.basePrice)}`}
                    </td>
                    <td>
                      {item.pricePerChild && Number(item.pricePerChild) > 0
                        ? `$${formatMoney(item.savings)} / niño`
                        : `$${formatMoney(item.savings ?? 0)}`}
                    </td>
                    <td>{item.promotionName ? fixSpanishText(item.promotionName) : 'Sin promoción'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="table-card">
        <table>
          <thead><tr><th>Nombre</th><th>Descuento</th><th>Vigencia</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion.id}>
                <td>
                  <strong>{fixSpanishText(promotion.name)}</strong>
                  <span className="subtle-line">{promotion.allowedDays.length ? promotion.allowedDays.join(' · ') : 'Sin restricciones por día'}</span>
                </td>
                <td>{promotion.discountPercent}%</td>
                <td>{promotion.startDate.slice(0, 10)} - {promotion.endDate.slice(0, 10)}</td>
                <td><Badge value={promotion.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                <td className="actions">
                  <button type="button" onClick={async () => { setEditing(promotion); setForm({ ...form, name: promotion.name, discountPercent: Number(promotion.discountPercent), startDate: promotion.startDate.slice(0, 10), endDate: promotion.endDate.slice(0, 10), minAmount: Number(promotion.minAmount ?? 0), allowedDays: promotion.allowedDays }); setPackageIds(promotion.packages.map((item) => item.package.id)); setServiceIds(promotion.services.map((item) => item.service.id)); setCreating(true); }}>Editar</button>
                  <button type="button" onClick={async () => { await togglePromotion(promotion.id, !promotion.active); await load(); }}>{promotion.active ? 'Desactivar' : 'Activar'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {(creating || editing) && (
        <Modal title={editing ? 'Modificar promoción' : 'Registrar promoción'} onClose={() => { setCreating(false); setEditing(null); setForm(emptyPromotion); setPackageIds([]); setServiceIds([]); }}>
          <form className="form-grid" onSubmit={submit}>
            <label>Nombre<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Porcentaje<input type="number" step="0.1" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} /></label>
            <label>Inicio<input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
            <label>Fin<input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label>
            <label>Monto mínimo<input type="number" step="0.01" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })} /></label>
            <label className="full-row">Días permitidos<div className="chip-row">{days.map((day) => <button key={day} type="button" className={form.allowedDays.includes(day) ? 'secondary-btn' : 'ghost-btn'} onClick={() => setForm({ ...form, allowedDays: form.allowedDays.includes(day) ? form.allowedDays.filter((value) => value !== day) : [...form.allowedDays, day] })}>{day}</button>)}</div></label>
            <label className="full-row">Paquetes<select multiple value={packageIds} onChange={(e) => setPackageIds(Array.from(e.target.selectedOptions, (option) => option.value))}>{catalogPackages.map((item) => <option key={item.id} value={item.id}>{fixSpanishText(item.name)}</option>)}</select></label>
            <label className="full-row">Servicios / productos<select multiple value={serviceIds} onChange={(e) => setServiceIds(Array.from(e.target.selectedOptions, (option) => option.value))}>{catalogServices.map((item) => <option key={item.id} value={item.id}>{fixSpanishText(item.name)}</option>)}</select></label>
            <button className="primary-btn">Guardar</button>
          </form>
          {editing && <button className="secondary-btn" onClick={() => saveTargets(editing.id)}>Actualizar vínculos</button>}
        </Modal>
      )}
    </main>
  );
}