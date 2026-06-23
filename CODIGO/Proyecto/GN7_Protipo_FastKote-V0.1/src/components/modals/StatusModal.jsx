import { useState } from "react";
import { AppIcon } from "../ui/AppIcon";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { SelectField } from "../ui/SelectField";

const getSchedule = (quote) => `${quote.startTime || quote.time || "--:--"} - ${quote.endTime || "--:--"}`;

export function StatusModal({ quoteView, onClose, onUpdate }) {
  const [newStatus, setNewStatus] = useState("Aceptada");
  const allowed = quoteView.state === "Enviada";

  return (
    <Modal maxWidth="max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">CU-SGC-L1-15 / RN-02 / RN-03</p>
          <h3 className="text-2xl font-black text-slate-950">Actualizar estado</h3>
          <p className="text-sm text-slate-500">Solo una cotizacion Enviada puede cerrarse.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-slate-100"><AppIcon name="close" className="h-6 w-6" /></button>
      </div>
      <div className="mt-5 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="flex justify-between"><span className="text-slate-500">Codigo</span><strong>{quoteView.code} / V{quoteView.version}</strong></div>
        <div className="mt-2 flex justify-between"><span className="text-slate-500">Cliente</span><strong>{quoteView.clientName}</strong></div>
        <div className="mt-2 flex justify-between"><span className="text-slate-500">Fecha</span><strong>{quoteView.eventDate}</strong></div>
        <div className="mt-2 flex justify-between"><span className="text-slate-500">Horario</span><strong>{getSchedule(quoteView)}</strong></div>
        <div className="mt-2 flex justify-between"><span className="text-slate-500">Estado actual</span><Badge variant={quoteView.state}>{quoteView.state}</Badge></div>
      </div>
      {!allowed && (
        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-100">
          Regla aplicada: esta cotizacion no puede cerrarse porque no esta en estado Enviada.
        </div>
      )}
      <SelectField label="Nuevo estado" value={newStatus} onChange={setNewStatus}>
        <option>Aceptada</option>
        <option>Rechazada</option>
        <option>Vencida</option>
      </SelectField>
      <p className="mt-3 text-sm text-slate-500">Aceptada bloquea la fecha. Rechazada o Vencida dejan la fecha libre.</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onUpdate(quoteView.id, newStatus)} icon="check" disabled={!allowed}>Confirmar cambio</Button>
      </div>
    </Modal>
  );
}
