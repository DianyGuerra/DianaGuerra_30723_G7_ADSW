import { useState } from "react";
import { computeServiceCost, currency, isActive, roundMoney } from "../../services/quoteCalculation.service";
import { slugify } from "../../services/versioning.service";
import { AppIcon } from "../ui/AppIcon";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Modal } from "../ui/Modal";

export function PackageModal({ packageItem, services, serviceMetrics, onClose, onSave }) {
  const activeServices = services.filter(isActive);
  const [form, setForm] = useState({
    name: packageItem?.name || "",
    desc: packageItem?.desc || "",
    margin: packageItem?.margin ?? 30,
  });
  const [items, setItems] = useState(() =>
    Object.fromEntries((packageItem?.items || []).map((item) => [item.serviceId, item.qty])),
  );

  const cost = activeServices.reduce((total, service) => total + Number(items[service.id] || 0) * (serviceMetrics.get(service.id)?.cost || computeServiceCost(service, [])), 0);
  const price = roundMoney(cost * (1 + Number(form.margin || 0) / 100));
  const canSave = form.name.trim() && Number(form.margin) >= 0 && Object.values(items).some((qty) => Number(qty) > 0);
  const updateItem = (serviceId, value) => setItems((current) => ({ ...current, [serviceId]: Math.max(0, Number(value) || 0) }));

  const save = () => {
    if (!canSave) return;
    onSave({
      id: packageItem?.id || `${slugify(form.name) || "paquete"}-${Date.now().toString(36)}`,
      name: form.name.trim(),
      desc: form.desc.trim(),
      margin: Number(form.margin),
      state: packageItem?.state || "Activo",
      items: Object.entries(items)
        .filter(([, qty]) => Number(qty) > 0)
        .map(([serviceId, qty]) => ({ serviceId, qty: Number(qty) })),
    });
  };

  return (
    <Modal>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">CU-SGC-L1-20 al L1-24</p>
          <h3 className="text-2xl font-black text-slate-950">{packageItem ? "Editar paquete" : "Registrar paquete"}</h3>
          <p className="text-sm text-slate-500">Asigna servicios/productos activos y calcula costo + precio sugerido.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-slate-100"><AppIcon name="close" className="h-6 w-6" /></button>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          <Field label="Nombre del paquete" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <Field label="Descripcion" value={form.desc} onChange={(value) => setForm((current) => ({ ...current, desc: value }))} as="textarea" />
          <Field label="Margen de ganancia (%)" value={form.margin} onChange={(value) => setForm((current) => ({ ...current, margin: value }))} type="number" min="0" step="1" />
          <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="flex justify-between text-sm"><span>Costo total del paquete</span><strong>{currency(cost)}</strong></div>
            <div className="mt-2 flex justify-between text-sm"><span>Precio sugerido</span><strong>{currency(price)}</strong></div>
            <p className="mt-2 text-xs text-slate-500">Solo considera servicios/productos activos para cumplir RN-04.</p>
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-bold text-slate-950">Servicios/productos incluidos</h4>
            <Badge variant="Activo">Activos</Badge>
          </div>
          <div className="grid gap-3">
            {activeServices.map((service) => (
              <label key={service.id} className="grid grid-cols-[1fr_90px] items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm ring-1 ring-slate-100">
                <span>
                  <strong className="block text-slate-800">{service.name}</strong>
                  <span className="text-xs text-slate-500">Costo calc.: {currency(serviceMetrics.get(service.id)?.cost || 0)}</span>
                </span>
                <input
                  type="number"
                  min="0"
                  value={items[service.id] || 0}
                  onChange={(event) => updateItem(service.id, event.target.value)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-sm"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button icon="check" disabled={!canSave} onClick={save}>Guardar paquete</Button>
      </div>
    </Modal>
  );
}
