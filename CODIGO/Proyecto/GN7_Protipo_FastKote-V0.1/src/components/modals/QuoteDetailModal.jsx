import { currency, roundMoney } from "../../services/quoteCalculation.service";
import { AppIcon } from "../ui/AppIcon";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";

const getSchedule = (quote) => `${quote.startTime || quote.time || "--:--"} - ${quote.endTime || "--:--"}`;

function BudgetStatus({ budget, total }) {
  if (!budget || Number(budget) <= 0) return null;

  const diff = roundMoney(total - Number(budget));
  return (
    <div className={`mt-3 rounded-lg p-3 text-sm ring-1 ${diff <= 0 ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-amber-50 text-amber-800 ring-amber-100"}`}>
      {diff <= 0 ? "Dentro del presupuesto" : `Supera el presupuesto por ${currency(diff)}`}
    </div>
  );
}

export function QuoteDetailModal({ quoteView, onClose }) {
  const promotion = quoteView.breakdown.promotion;
  const eventData = quoteView.breakdown.eventSnapshot || quoteView;
  const isBase = quoteView.quoteType === "Base";
  const isImported = quoteView.personalizationMode === "Importada desde paquete";

  return (
    <Modal maxWidth="max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">CU-SGC-L1-14 / CU-SGC-L1-18</p>
          <h3 className="text-2xl font-black text-slate-950">{quoteView.code} - V{quoteView.version}</h3>
          <p className="text-sm text-slate-500">Consulta de datos del evento y detalle consolidado para PDF simulado.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-slate-100"><AppIcon name="close" className="h-6 w-6" /></button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card className="shadow-none">
          <p className="text-xs uppercase text-slate-500">Cliente</p>
          <p className="mt-1 font-bold">{quoteView.clientName}</p>
          <p className="text-sm text-slate-500">{eventData.eventDate} / {getSchedule(eventData)}</p>
        </Card>
        <Card className="shadow-none">
          <p className="text-xs uppercase text-slate-500">Estado</p>
          <div className="mt-1"><Badge variant={quoteView.state}>{quoteView.state}</Badge></div>
          <p className="mt-2 text-sm text-slate-500">{quoteView.isLatest ? "Version vigente" : "Version historica visible"}</p>
        </Card>
        <Card className="shadow-none">
          <p className="text-xs uppercase text-slate-500">Tipo cotizacion</p>
          <p className="mt-1 font-bold text-slate-900">{quoteView.quoteType}</p>
          <p className="mt-2 text-sm text-slate-500">{isBase ? "Paquete base" : quoteView.personalizationMode}</p>
        </Card>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-4">
        <h4 className="font-bold text-slate-950">Datos generales del evento</h4>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div><span className="text-slate-500">Responsable</span><strong className="block text-slate-900">{eventData.responsibleName || "No registrado"}</strong></div>
          <div><span className="text-slate-500">Tipo de evento</span><strong className="block text-slate-900">{eventData.eventType}</strong></div>
          <div><span className="text-slate-500">Invitados</span><strong className="block text-slate-900">{eventData.guestCount}</strong></div>
          <div><span className="text-slate-500">Presupuesto estimado</span><strong className="block text-slate-900">{eventData.estimatedBudget ? currency(eventData.estimatedBudget) : "No registrado"}</strong></div>
          <div><span className="text-slate-500">Lugar</span><strong className="block text-slate-900">{eventData.eventLocation}</strong></div>
          <div><span className="text-slate-500">Factura / IVA</span><strong className="block text-slate-900">{eventData.requiresInvoice ? "Si" : "No"}</strong></div>
          <div><span className="text-slate-500">Tematica/necesidad visual</span><strong className="block text-slate-900">{eventData.theme || "No registrada"}</strong></div>
          <div><span className="text-slate-500">Condiciones comerciales</span><strong className="block text-slate-900">{eventData.commercialConditions || "Sin condiciones adicionales"}</strong></div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-4">
        {isBase ? (
          <>
            <h4 className="font-bold text-slate-950">Paquete base seleccionado</h4>
            <p className="mt-1 text-sm text-slate-500">{quoteView.breakdown.packageSnapshot?.name || quoteView.packageName}</p>
            {quoteView.breakdown.packageSnapshot?.desc && <p className="mt-1 text-sm text-slate-500">{quoteView.breakdown.packageSnapshot.desc}</p>}
            <div className="mt-4 grid gap-2 text-sm">
              {(quoteView.breakdown.packageItemDetails || []).map((item) => (
                <div key={item.serviceId} className="grid grid-cols-[1fr_80px_110px] gap-3 rounded-lg bg-slate-50 p-3">
                  <span><strong className="block text-slate-900">{item.name}</strong><span className="text-xs text-slate-500">{item.type}</span></span>
                  <span>x{item.qty}</span>
                  <strong className="text-right">{currency(item.subtotal)}</strong>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h4 className="font-bold text-slate-950">Servicios y productos personalizados</h4>
            {isImported && (
              <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
                <span className="text-slate-500">Paquete usado como plantilla</span>
                <strong className="block text-slate-900">{quoteView.breakdown.sourcePackageSnapshot?.name || "Paquete no disponible"}</strong>
              </div>
            )}
            <p className="mt-3 rounded-lg bg-violet-50 p-3 text-sm text-violet-800 ring-1 ring-violet-100">
              {isImported ? "El paquete fue usado solo como base de personalizacion; no se modifico el paquete global." : "Esta cotizacion personalizada no modifica paquetes globales."}
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              {(quoteView.breakdown.customItemDetails || []).map((item) => (
                <div key={item.serviceId} className="grid grid-cols-[1fr_70px_110px_110px] gap-3 rounded-lg bg-slate-50 p-3">
                  <span><strong className="block text-slate-900">{item.name}</strong><span className="text-xs text-slate-500">{item.type}</span></span>
                  <span>x{item.qty}</span>
                  <span>{currency(item.unitPrice)} c/u</span>
                  <strong className="text-right">{currency(item.subtotal)}</strong>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><strong>{currency(quoteView.breakdown.subtotal)}</strong></div>
          <div className="flex justify-between"><span>Descuento</span><strong className="text-emerald-700">-{currency(quoteView.breakdown.discount)}</strong></div>
          {promotion ? <p className="text-xs font-semibold text-emerald-700">{promotion.name}: {promotion.discountPercent}% aplicado</p> : <p className="text-xs text-slate-500">Sin promocion aplicable</p>}
          <div className="flex justify-between"><span>IVA estimado</span><strong>{currency(quoteView.breakdown.tax)}</strong></div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg"><span className="font-black">Total</span><strong>{currency(quoteView.breakdown.total)}</strong></div>
        </div>
        <BudgetStatus budget={eventData.estimatedBudget} total={quoteView.breakdown.total} />
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm ring-1 ring-slate-200">
        <div className="flex justify-between gap-4"><span className="text-slate-500">PDF generado</span><strong>{quoteView.pdfGenerated ? "Si" : "No"}</strong></div>
        {quoteView.pdfGenerated && (
          <>
            <div className="mt-2 flex justify-between gap-4"><span className="text-slate-500">Archivo</span><strong>{quoteView.pdfFileName}</strong></div>
            <div className="mt-2 flex justify-between gap-4"><span className="text-slate-500">Fecha generacion</span><strong>{quoteView.pdfGeneratedAt}</strong></div>
          </>
        )}
      </div>
      <div className="mt-5 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  );
}
