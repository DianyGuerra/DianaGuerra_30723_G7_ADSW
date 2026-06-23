import { useState } from "react";
import { slugify } from "../../services/versioning.service";
import { AppIcon } from "../ui/AppIcon";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Modal } from "../ui/Modal";

export function SupplyModal({ supply, onClose, onSave }) {
  const [form, setForm] = useState({
    name: supply?.name || "",
    unit: supply?.unit || "Unidad",
    refQty: supply?.refQty ?? 1,
    cost: supply?.cost ?? 0,
  });
  const canSave = form.name.trim() && form.unit.trim() && Number(form.cost) >= 0;

  const save = () => {
    if (!canSave) return;
    onSave({
      id: supply?.id || `${slugify(form.name) || "insumo"}-${Date.now().toString(36)}`,
      name: form.name.trim(),
      unit: form.unit.trim(),
      refQty: Number(form.refQty) || 0,
      cost: Number(form.cost) || 0,
      state: supply?.state || "Activo",
    });
  };

  return (
    <Modal maxWidth="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">CU-SGC-L1-36 al L1-40</p>
          <h3 className="text-2xl font-black text-slate-950">{supply ? "Actualizar insumo" : "Registrar insumo"}</h3>
          <p className="text-sm text-slate-500">La actualizacion de costo recalcula visualmente servicios y paquetes asociados.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-slate-100"><AppIcon name="close" className="h-6 w-6" /></button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
        <Field label="Unidad de medida" value={form.unit} onChange={(value) => setForm((current) => ({ ...current, unit: value }))} />
        <Field label="Cantidad referencial" value={form.refQty} onChange={(value) => setForm((current) => ({ ...current, refQty: value }))} type="number" min="0" step="0.1" />
        <Field label="Costo unitario" value={form.cost} onChange={(value) => setForm((current) => ({ ...current, cost: value }))} type="number" min="0" step="0.01" />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button icon="check" disabled={!canSave} onClick={save}>Guardar insumo</Button>
      </div>
    </Modal>
  );
}
