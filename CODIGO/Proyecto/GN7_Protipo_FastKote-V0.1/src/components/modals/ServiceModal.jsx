import { useState } from "react";
import { currency, getServiceProfitRisk, isActive } from "../../services/quoteCalculation.service";
import { slugify } from "../../services/versioning.service";
import { AppIcon } from "../ui/AppIcon";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { SelectField } from "../ui/SelectField";

export function ServiceModal({ service, supplies, onClose, onSave }) {
  const activeSupplies = supplies.filter(isActive);
  const [form, setForm] = useState({
    name: service?.name || "",
    type: service?.type || "Servicio",
    desc: service?.desc || "",
    price: service?.price ?? 0,
  });
  const [recipe, setRecipe] = useState(() => Object.fromEntries((service?.recipe || []).map((item) => [item.supplyId, item.qty])));
  const cost = activeSupplies.reduce((total, supply) => total + Number(recipe[supply.id] || 0) * supply.cost, 0);
  const risk = getServiceProfitRisk(cost, form.price);
  const canSave = form.name.trim() && Number(form.price) > 0;
  const updateRecipe = (supplyId, value) => setRecipe((current) => ({ ...current, [supplyId]: Math.max(0, Number(value) || 0) }));

  const save = () => {
    if (!canSave) return;
    onSave({
      id: service?.id || `${slugify(form.name) || "servicio"}-${Date.now().toString(36)}`,
      name: form.name.trim(),
      type: form.type,
      desc: form.desc.trim(),
      price: Number(form.price),
      state: service?.state || "Activo",
      recipe: Object.entries(recipe)
        .filter(([, qty]) => Number(qty) > 0)
        .map(([supplyId, qty]) => ({ supplyId, qty: Number(qty) })),
    });
  };

  return (
    <Modal>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">CU-SGC-L1-31 al L1-35</p>
          <h3 className="text-2xl font-black text-slate-950">{service ? "Editar servicio/producto" : "Registrar servicio/producto"}</h3>
          <p className="text-sm text-slate-500">Asigna insumos activos como receta tecnica y calcula costo de produccion.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-slate-100"><AppIcon name="close" className="h-6 w-6" /></button>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          <Field label="Nombre" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <SelectField label="Tipo" value={form.type} onChange={(value) => setForm((current) => ({ ...current, type: value }))}>
            <option>Servicio</option>
            <option>Producto</option>
          </SelectField>
          <Field label="Precio sugerido" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} type="number" min="0" step="0.01" />
          <Field label="Descripcion" value={form.desc} onChange={(value) => setForm((current) => ({ ...current, desc: value }))} as="textarea" />
          <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="flex justify-between text-sm"><span>Costo calculado</span><strong>{currency(cost)}</strong></div>
            <div className="mt-2 flex justify-between text-sm"><span>Precio de venta</span><strong>{currency(form.price)}</strong></div>
            <div className="mt-3"><Badge variant={risk}>{risk}</Badge></div>
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-bold text-slate-950">Receta tecnica</h4>
            <Badge variant="Activo">Insumos activos</Badge>
          </div>
          <div className="grid gap-3">
            {activeSupplies.map((supply) => (
              <label key={supply.id} className="grid grid-cols-[1fr_90px] items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm ring-1 ring-slate-100">
                <span>
                  <strong className="block text-slate-800">{supply.name}</strong>
                  <span className="text-xs text-slate-500">{currency(supply.cost)} / {supply.unit}</span>
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={recipe[supply.id] || 0}
                  onChange={(event) => updateRecipe(supply.id, event.target.value)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-sm"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button icon="check" disabled={!canSave} onClick={save}>Guardar servicio</Button>
      </div>
    </Modal>
  );
}
