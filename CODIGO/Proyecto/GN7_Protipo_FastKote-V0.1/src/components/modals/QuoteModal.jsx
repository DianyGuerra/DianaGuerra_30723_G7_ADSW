import { useMemo, useState } from "react";
import { getMinEventDate, TAX_RATE } from "../../models/businessRules.model";
import { timeToMinutes } from "../../services/calendar.service";
import { currency, getActivePromotion, isActive, roundMoney } from "../../services/quoteCalculation.service";
import { AppIcon } from "../ui/AppIcon";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { SelectField } from "../ui/SelectField";

const fallbackEventTypes = ["Cumpleanos infantil", "Evento escolar", "Mesa dulce", "Evento familiar", "Otro"];
const personalizationModes = ["Desde cero", "Importada desde paquete"];

function customItemsToForm(items = []) {
  return items.map((item) => ({ serviceId: item.serviceId, qty: Number(item.qty || 1) }));
}

function getSelectedService(services, serviceId) {
  return services.find((service) => service.id === serviceId);
}

function getPackageItems(packageItem, services) {
  return (packageItem?.items || [])
    .map((item) => {
      const service = getSelectedService(services, item.serviceId);
      return service && isActive(service) ? { serviceId: service.id, qty: Number(item.qty || 1) } : null;
    })
    .filter(Boolean);
}

function matchesQuery(...values) {
  const query = values[0];
  return (value) => !query || String(value || "").toLowerCase().includes(query);
}

export function QuoteModal({ clients, packages, packageMetrics, services, promotions, eventTypes = fallbackEventTypes, initialQuote = null, onClose, onSave }) {
  const activeClients = clients.filter(isActive);
  const activePackages = packages.filter(isActive);
  const activeServices = services.filter(isActive);
  const minEventDate = useMemo(() => getMinEventDate(), []);
  const eventTypeOptions = eventTypes.length ? eventTypes : fallbackEventTypes;
  const isEditing = Boolean(initialQuote);
  const initialQuoteType = initialQuote?.quoteType === "Personalizada" ? "Personalizada" : "Base";
  const initialMode = initialQuoteType === "Personalizada" ? initialQuote?.personalizationMode || "Desde cero" : null;
  const [submitted, setSubmitted] = useState(false);
  const [packageSearch, setPackageSearch] = useState("");
  const [importPackageSearch, setImportPackageSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [importPackageId, setImportPackageId] = useState(initialQuote?.sourcePackageId || activePackages[0]?.id || "");
  const [form, setForm] = useState({
    clientId: initialQuote?.clientId || activeClients[0]?.id || "",
    responsibleName: initialQuote?.responsibleName || "",
    eventType: initialQuote?.eventType || eventTypeOptions[0] || "",
    guestCount: initialQuote?.guestCount || "",
    estimatedBudget: initialQuote?.estimatedBudget ?? "",
    eventLocation: initialQuote?.eventLocation || "",
    eventDate: initialQuote?.eventDate || minEventDate,
    startTime: initialQuote?.startTime || "16:00",
    endTime: initialQuote?.endTime || "18:00",
    theme: initialQuote?.theme || "",
    requiresInvoice: initialQuote?.requiresInvoice ? "Si" : "No",
    commercialConditions: initialQuote?.commercialConditions || initialQuote?.observations || "",
    quoteType: initialQuoteType,
    personalizationMode: initialMode,
    packageId: initialQuoteType === "Base" ? initialQuote?.packageId || activePackages[0]?.id || "" : "",
    sourcePackageId: initialQuoteType === "Personalizada" ? initialQuote?.sourcePackageId || null : null,
  });
  const [customItems, setCustomItems] = useState(() => customItemsToForm(initialQuote?.customItems || initialQuote?.addons || []));

  const isBase = form.quoteType === "Base";
  const isPersonalized = form.quoteType === "Personalizada";
  const isImported = isPersonalized && form.personalizationMode === "Importada desde paquete";
  const packageMatcher = matchesQuery(packageSearch.trim().toLowerCase());
  const importPackageMatcher = matchesQuery(importPackageSearch.trim().toLowerCase());
  const filteredBasePackages = activePackages.filter((packageItem) => packageMatcher(packageItem.name) || packageMatcher(packageItem.desc));
  const filteredImportPackages = activePackages.filter((packageItem) => importPackageMatcher(packageItem.name) || importPackageMatcher(packageItem.desc));
  const packageSelected = activePackages.find((packageItem) => packageItem.id === form.packageId);
  const importPackageSelected = activePackages.find((packageItem) => packageItem.id === importPackageId);
  const packagePreview = packageMetrics.get(form.packageId);
  const baseSubtotal = isBase ? roundMoney(packagePreview?.price || 0) : 0;
  const customDetails = customItems
    .map((item) => {
      const service = getSelectedService(activeServices, item.serviceId);
      if (!service) return null;
      const qty = Number(item.qty || 0);
      return {
        service,
        qty,
        subtotal: roundMoney(service.price * qty),
      };
    })
    .filter(Boolean);
  const customSubtotal = roundMoney(customDetails.reduce((total, item) => total + item.subtotal, 0));
  const subtotal = isBase ? baseSubtotal : customSubtotal;
  const promotion = isBase ? getActivePromotion(promotions, form.packageId, form.eventDate, subtotal) : null;
  const discount = promotion ? roundMoney((subtotal * promotion.discountPercent) / 100) : 0;
  const tax = roundMoney(Math.max(subtotal - discount, 0) * TAX_RATE);
  const total = roundMoney(subtotal - discount + tax);
  const budget = Number(form.estimatedBudget || 0);
  const budgetDiff = roundMoney(total - budget);
  const selectedServiceIds = new Set(customItems.map((item) => item.serviceId));
  const serviceMatcher = matchesQuery(serviceSearch.trim().toLowerCase());
  const visibleServices = activeServices.filter((service) => {
    return !selectedServiceIds.has(service.id) && (serviceMatcher(service.name) || serviceMatcher(service.type) || serviceMatcher(service.desc));
  });

  const errors = {
    clientId: form.clientId ? "" : "Selecciona un cliente.",
    eventType: form.eventType ? "" : "Selecciona el tipo de evento.",
    guestCount: Number(form.guestCount) > 0 ? "" : "Ingresa un numero de invitados mayor que 0.",
    estimatedBudget: form.estimatedBudget === "" || Number(form.estimatedBudget) > 0 ? "" : "El presupuesto debe ser mayor que 0.",
    eventLocation: form.eventLocation.trim() ? "" : "Ingresa el lugar del evento.",
    eventDate: !form.eventDate ? "Selecciona una fecha." : form.eventDate < minEventDate ? `La fecha minima es ${minEventDate}.` : "",
    startTime: form.startTime ? "" : "Selecciona hora de inicio.",
    endTime: !form.endTime
      ? "Selecciona hora de fin."
      : timeToMinutes(form.endTime) <= timeToMinutes(form.startTime)
        ? "La hora final debe ser mayor que la inicial."
        : "",
    packageId: !isBase || activePackages.some((packageItem) => packageItem.id === form.packageId) ? "" : "Selecciona un paquete activo.",
    personalizationMode: !isPersonalized || form.personalizationMode ? "" : "Selecciona un modo de personalizacion.",
    importPackage: !isImported || form.sourcePackageId ? "" : "Importa un paquete activo antes de guardar.",
    customItems: !isPersonalized || customDetails.length > 0 ? "" : "Agrega al menos un servicio o producto activo.",
    customQty: !isPersonalized || customItems.every((item) => Number(item.qty) > 0) ? "" : "Todas las cantidades deben ser mayores que 0.",
  };
  const isValid = Object.values(errors).every((error) => !error);

  const updateForm = (field, value) => {
    setForm((current) => {
      if (field === "quoteType") {
        if (value === "Base") {
          setCustomItems([]);
          return {
            ...current,
            quoteType: "Base",
            personalizationMode: null,
            packageId: current.packageId || activePackages[0]?.id || "",
            sourcePackageId: null,
          };
        }
        setCustomItems([]);
        return {
          ...current,
          quoteType: "Personalizada",
          personalizationMode: "Desde cero",
          packageId: "",
          sourcePackageId: null,
        };
      }
      if (field === "personalizationMode") {
        setCustomItems([]);
        return {
          ...current,
          personalizationMode: value,
          packageId: "",
          sourcePackageId: null,
        };
      }
      return { ...current, [field]: value };
    });
  };

  const importPackage = () => {
    const packageItem = activePackages.find((item) => item.id === importPackageId);
    if (!packageItem) return;
    setCustomItems(getPackageItems(packageItem, activeServices));
    setForm((current) => ({ ...current, sourcePackageId: packageItem.id }));
  };

  const addCustomItem = (serviceId) => {
    setCustomItems((current) => [...current, { serviceId, qty: 1 }]);
    setServiceSearch("");
  };

  const updateCustomQty = (serviceId, value) => {
    setCustomItems((current) =>
      current.map((item) => (item.serviceId === serviceId ? { ...item, qty: Math.max(0, Number(value) || 0) } : item)),
    );
  };

  const removeCustomItem = (serviceId) => {
    setCustomItems((current) => current.filter((item) => item.serviceId !== serviceId));
  };

  const save = () => {
    setSubmitted(true);
    if (!isValid) return;
    onSave({
      clientId: form.clientId,
      responsibleName: form.responsibleName.trim(),
      eventType: form.eventType,
      guestCount: Number(form.guestCount),
      estimatedBudget: form.estimatedBudget === "" ? null : Number(form.estimatedBudget),
      eventLocation: form.eventLocation.trim(),
      eventDate: form.eventDate,
      startTime: form.startTime,
      endTime: form.endTime,
      theme: form.theme.trim(),
      requiresInvoice: form.requiresInvoice === "Si",
      commercialConditions: form.commercialConditions.trim(),
      observations: form.commercialConditions.trim(),
      quoteType: form.quoteType,
      isPersonalized,
      personalizationMode: isBase ? null : form.personalizationMode,
      packageId: isBase ? form.packageId : null,
      sourcePackageId: isImported ? form.sourcePackageId : null,
      customItems: isBase
        ? []
        : customDetails.map(({ service, qty, subtotal: itemSubtotal }) => ({
            serviceId: service.id,
            qty,
            unitPrice: service.price,
            subtotal: itemSubtotal,
          })),
    });
  };

  return (
    <Modal maxWidth="max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">CU-SGC-L1-11 / L1-12 / RN-01</p>
          <h3 className="text-2xl font-black text-slate-950">{isEditing ? "Editar cotizacion" : "Generar cotizacion"}</h3>
          <p className="text-sm text-slate-500">{isEditing ? "Guarda una nueva version sin sobrescribir el historial." : "Registra datos del evento y separa cotizacion Base de Personalizada."}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-slate-100"><AppIcon name="close" className="h-6 w-6" /></button>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-950">Datos generales del evento</h4>
                <p className="text-sm text-slate-500">Informacion comercial solicitada antes de calcular la propuesta.</p>
              </div>
              <Badge variant="Borrador">RN-01</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Cliente *" value={form.clientId} onChange={(value) => updateForm("clientId", value)} error={submitted ? errors.clientId : ""}>
                {activeClients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </SelectField>
              <Field label="Responsable del evento" value={form.responsibleName} onChange={(value) => updateForm("responsibleName", value)} placeholder="Ej. Diana Guerra" />
              <SelectField label="Tipo de evento *" value={form.eventType} onChange={(value) => updateForm("eventType", value)} error={submitted ? errors.eventType : ""}>
                {eventTypeOptions.map((eventType) => <option key={eventType} value={eventType}>{eventType}</option>)}
              </SelectField>
              <Field label="Numero de invitados *" value={form.guestCount} onChange={(value) => updateForm("guestCount", value)} type="number" min="1" error={submitted ? errors.guestCount : ""} />
              <Field label="Presupuesto estimado" value={form.estimatedBudget} onChange={(value) => updateForm("estimatedBudget", value)} type="number" min="0" step="0.01" placeholder="Ej. 450" error={submitted ? errors.estimatedBudget : ""} />
              <Field label="Lugar / direccion del evento *" value={form.eventLocation} onChange={(value) => updateForm("eventLocation", value)} error={submitted ? errors.eventLocation : ""} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Fecha del evento *" value={form.eventDate} onChange={(value) => updateForm("eventDate", value)} type="date" min={minEventDate} error={submitted ? errors.eventDate : ""} />
              <Field label="Hora inicio *" value={form.startTime} onChange={(value) => updateForm("startTime", value)} type="time" error={submitted ? errors.startTime : ""} />
              <Field label="Hora fin *" value={form.endTime} onChange={(value) => updateForm("endTime", value)} type="time" error={submitted ? errors.endTime : ""} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px]">
              <Field label="Tematica o necesidad visual" value={form.theme} onChange={(value) => updateForm("theme", value)} placeholder="Ej. colores, personaje, estilo de mesa" />
              <SelectField label="Requiere factura / IVA" value={form.requiresInvoice} onChange={(value) => updateForm("requiresInvoice", value)}>
                <option>No</option>
                <option>Si</option>
              </SelectField>
            </div>
            <div className="mt-4">
              <Field label="Condiciones comerciales u observaciones" value={form.commercialConditions} onChange={(value) => updateForm("commercialConditions", value)} as="textarea" placeholder="Ej. anticipo, alcance, restricciones, notas del cliente" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="font-bold text-slate-950">Tipo de cotizacion *</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {["Base", "Personalizada"].map((quoteType) => (
                <button
                  key={quoteType}
                  type="button"
                  onClick={() => updateForm("quoteType", quoteType)}
                  className={`rounded-lg border p-4 text-left transition ${
                    form.quoteType === quoteType ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="block font-bold text-slate-950">{quoteType}</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {quoteType === "Base" ? "Usa un paquete activo del catalogo comercial." : "Crea desde cero o importa un paquete como plantilla editable."}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid content-start gap-4">
          {isBase ? (
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-4">
                <h4 className="font-bold text-slate-950">Paquete base</h4>
                <p className="text-sm text-slate-500">Cotizacion construida desde un paquete activo. No permite editar items.</p>
              </div>
              <Field label="Buscar paquete" value={packageSearch} onChange={setPackageSearch} placeholder="Ej. infantil, navideno, combo" />
              <SelectField label="Paquete base activo *" value={form.packageId} onChange={(value) => updateForm("packageId", value)} error={submitted ? errors.packageId : ""}>
                {filteredBasePackages.map((packageItem) => <option key={packageItem.id} value={packageItem.id}>{packageItem.name}</option>)}
              </SelectField>
              {packageSelected && (
                <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm ring-1 ring-slate-200">
                  <p className="font-bold text-slate-900">{packageSelected.name}</p>
                  <p className="mt-1 text-slate-500">{packageSelected.desc}</p>
                  <div className="mt-3 grid gap-2">
                    {(packageSelected.items || []).map((item) => {
                      const service = getSelectedService(services, item.serviceId);
                      return service ? <div key={item.serviceId} className="flex justify-between gap-3"><span>{service.name}</span><strong>x{item.qty}</strong></div> : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-950">Modo de personalizacion</h4>
                  <p className="text-sm text-slate-500">El paquete importado solo funciona como plantilla local editable.</p>
                </div>
                <Badge variant="Activo">Catalogo JSON</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {personalizationModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateForm("personalizationMode", mode)}
                    className={`rounded-lg border p-3 text-left text-sm transition ${
                      form.personalizationMode === mode ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <strong className="block text-slate-950">{mode === "Desde cero" ? "Crear desde cero" : "Importar desde paquete"}</strong>
                    <span className="text-slate-500">{mode === "Desde cero" ? "Inicia con lista vacia." : "Copia items de un paquete activo."}</span>
                  </button>
                ))}
              </div>

              {isImported && (
                <div className="mt-4 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                  <Field label="Buscar paquete para importar" value={importPackageSearch} onChange={setImportPackageSearch} placeholder="Ej. navideno, infantil" />
                  <SelectField label="Paquete plantilla" value={importPackageId} onChange={setImportPackageId} error={submitted ? errors.importPackage : ""}>
                    {filteredImportPackages.map((packageItem) => <option key={packageItem.id} value={packageItem.id}>{packageItem.name}</option>)}
                  </SelectField>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">{importPackageSelected?.desc || "Selecciona un paquete activo para copiar sus items."}</p>
                    <Button variant="secondary" icon="download" disabled={!importPackageSelected} onClick={importPackage}>Importar paquete</Button>
                  </div>
                  {form.sourcePackageId && <p className="mt-2 text-xs font-semibold text-emerald-700">Plantilla importada: {activePackages.find((item) => item.id === form.sourcePackageId)?.name}</p>}
                </div>
              )}

              <div className="mt-4">
                <Field label="Buscar servicio/producto" value={serviceSearch} onChange={setServiceSearch} placeholder="Ej. granizado, transporte, decoracion" />
                <div className="mt-3 grid max-h-44 gap-2 overflow-auto pr-1">
                  {visibleServices.map((service) => (
                    <button key={service.id} type="button" onClick={() => addCustomItem(service.id)} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-left text-sm ring-1 ring-slate-100 hover:bg-violet-50">
                      <span>
                        <strong className="block text-slate-800">{service.name}</strong>
                        <span className="text-xs text-slate-500">{service.type} / {currency(service.price)} por unidad</span>
                      </span>
                      <AppIcon name="plus" className="h-4 w-4 text-violet-700" />
                    </button>
                  ))}
                  {!visibleServices.length && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No hay servicios/productos activos disponibles con ese criterio.</p>}
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {customDetails.map(({ service, qty, subtotal: itemSubtotal }) => (
                  <div key={service.id} className="grid grid-cols-[1fr_76px_90px_32px] items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm">
                    <div>
                      <strong className="block text-slate-900">{service.name}</strong>
                      <span className="text-xs text-slate-500">{currency(service.price)} c/u</span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(event) => updateCustomQty(service.id, event.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 [color-scheme:light]"
                    />
                    <strong className="text-right text-slate-900">{currency(itemSubtotal)}</strong>
                    <button type="button" onClick={() => removeCustomItem(service.id)} className="rounded-md p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><AppIcon name="close" className="h-4 w-4" /></button>
                  </div>
                ))}
                {submitted && (errors.customItems || errors.customQty) && <p className="text-xs font-semibold text-rose-600">{errors.customItems || errors.customQty}</p>}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="flex justify-between text-sm"><span>Subtotal</span><strong>{currency(subtotal)}</strong></div>
            <div className="mt-2 flex justify-between text-sm"><span>Promocion</span><strong className="text-emerald-700">-{currency(discount)}</strong></div>
            {promotion ? <p className="mt-1 text-xs text-emerald-700">{promotion.name}: {promotion.discountPercent}%</p> : <p className="mt-1 text-xs text-slate-500">Sin promocion aplicable</p>}
            <div className="mt-2 flex justify-between text-sm"><span>IVA estimado 15%</span><strong>{currency(tax)}</strong></div>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-lg"><span className="font-black">Total</span><strong>{currency(total)}</strong></div>
            {budget > 0 && (
              <div className={`mt-3 rounded-lg p-3 text-sm ring-1 ${budgetDiff <= 0 ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-amber-50 text-amber-800 ring-amber-100"}`}>
                {budgetDiff <= 0 ? "Dentro del presupuesto" : `Supera el presupuesto por ${currency(budgetDiff)}`}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
            Estado inicial: <strong>Borrador</strong>. Borrador y Enviada son tentativas; solo Aceptada bloquea calendario.
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button icon={isEditing ? "edit" : "file"} disabled={!isValid} onClick={save}>{isEditing ? "Guardar nueva version" : "Guardar como borrador"}</Button>
      </div>
    </Modal>
  );
}
