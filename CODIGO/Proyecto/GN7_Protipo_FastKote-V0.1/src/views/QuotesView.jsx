import { useMemo, useState } from "react";
import { QuoteDetailModal } from "../components/modals/QuoteDetailModal";
import { QuoteModal } from "../components/modals/QuoteModal";
import { StatusModal } from "../components/modals/StatusModal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { SearchBar } from "../components/ui/SearchBar";
import { SectionHeader } from "../components/ui/SectionHeader";
import { currency } from "../services/quoteCalculation.service";

const quoteStates = ["Borrador", "Enviada", "Aceptada", "Rechazada", "Vencida"];

const getSchedule = (quote) => `${quote.startTime || quote.time || "--:--"} - ${quote.endTime || "--:--"}`;

const defaultFilters = {
  searchTerm: "",
  statusFilter: "Todos",
  dateFrom: "",
  dateTo: "",
};

export function QuotesView({
  clients,
  packages,
  packageMetrics,
  services,
  promotions,
  eventTypes,
  quoteViews,
  onCreateQuote,
  onStartEditQuote,
  onSaveQuoteVersion,
  onGeneratePdf,
  onSendWhatsapp,
  onUpdateStatus,
}) {
  const [showQuote, setShowQuote] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [statusQuote, setStatusQuote] = useState(null);
  const [detailQuote, setDetailQuote] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);

  const filteredQuoteViews = useMemo(() => {
    const query = filters.searchTerm.trim().toLowerCase();

    return quoteViews.filter((quote) => {
      const searchableText = [quote.code, quote.clientName, quote.eventType, quote.compositionSummary].join(" ").toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);
      const matchesStatus = filters.statusFilter === "Todos" || quote.state === filters.statusFilter;
      const matchesDateFrom = !filters.dateFrom || quote.eventDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || quote.eventDate <= filters.dateTo;

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [quoteViews, filters]);

  const total = filteredQuoteViews.reduce((acc, quote) => acc + quote.breakdown.total, 0);

  const openEdit = (quoteId) => {
    const quote = onStartEditQuote(quoteId);
    if (quote) setEditingQuote(quote);
  };

  const updateDraftFilter = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const applySearch = () => {
    setFilters(draftFilters);
  };

  const clearSearch = () => {
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  return (
    <div>
      <SectionHeader
        eyebrow="RF-02 / CU-SGC-L0-03"
        title="Administrar cotizaciones"
        description="Crear, consultar, editar/versionar, generar PDF, enviar por WhatsApp y actualizar estado respetando RN-01, RN-02 y RN-03."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" icon="search" onClick={() => setShowSearchPanel((current) => !current)}>Buscar cotizacion</Button>
            <Button icon="plus" onClick={() => setShowQuote(true)}>Generar cotizacion</Button>
          </div>
        }
      />
      {showSearchPanel && (
        <Card>
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto_auto]">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
              Cliente o codigo
              <SearchBar value={draftFilters.searchTerm} onChange={(value) => updateDraftFilter("searchTerm", value)} placeholder="Ej. Maria o FK-2026-014" />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
              Estado
              <select
                value={draftFilters.statusFilter}
                onChange={(event) => updateDraftFilter("statusFilter", event.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 [color-scheme:light]"
              >
                <option value="Todos">Todos los estados</option>
                {quoteStates.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
              Fecha desde
              <input value={draftFilters.dateFrom} onChange={(event) => updateDraftFilter("dateFrom", event.target.value)} type="date" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 [color-scheme:light]" />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
              Fecha hasta
              <input value={draftFilters.dateTo} onChange={(event) => updateDraftFilter("dateTo", event.target.value)} type="date" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 [color-scheme:light]" />
            </label>
            <Button variant="secondary" icon="search" className="self-end" onClick={applySearch}>Buscar</Button>
            <Button variant="ghost" icon="close" className="self-end" onClick={clearSearch}>Limpiar</Button>
          </div>
        </Card>
      )}
      {filteredQuoteViews.length ? (
        <DataTable
          headers={["Codigo", "Cliente", "Tipo evento", "Invitados", "Tipo cotizacion", "Paquete / composicion", "Fecha/hora", "Version", "Estado", "Total", "Acciones"]}
          rows={filteredQuoteViews.map((quote) => [
            <div>
              <p>{quote.code}</p>
              {!quote.isLatest && <div className="mt-1"><Badge variant="Historial">Historial</Badge></div>}
            </div>,
            quote.clientName,
            quote.eventType,
            quote.guestCount,
            quote.quoteType,
            <div>
              <p>{quote.compositionSummary}</p>
              {quote.quoteType === "Personalizada" && <p className="text-xs text-slate-500">Desde catalogo activo</p>}
            </div>,
            <div><p>{quote.eventDate}</p><p className="text-xs text-slate-500">{getSchedule(quote)}</p></div>,
            `V${quote.version}`,
            <Badge variant={quote.state}>{quote.state}</Badge>,
            currency(quote.breakdown.total),
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" icon="eye" onClick={() => setDetailQuote(quote)}>Ver</Button>
              {quote.isLatest && ["Borrador", "Enviada"].includes(quote.state) && <Button variant="ghost" icon="edit" onClick={() => openEdit(quote.id)}>Editar</Button>}
              {quote.isLatest && <Button variant="ghost" icon="settings" onClick={() => setStatusQuote(quote)}>Estado</Button>}
              {quote.isLatest && <Button variant="ghost" icon="download" onClick={() => onGeneratePdf(quote.id)}>PDF</Button>}
              {quote.isLatest && <Button variant="whatsapp" icon="whatsapp" onClick={() => onSendWhatsapp(quote.id)}>WhatsApp</Button>}
            </div>,
          ])}
        />
      ) : (
        <Card className="mt-5">
          <p className="text-sm font-semibold text-slate-700">No se encontraron registros</p>
        </Card>
      )}
      <div className="mt-4 flex justify-end text-sm text-slate-600">Monto total mostrado: <strong className="ml-2 text-slate-950">{currency(total)}</strong></div>
      {showQuote && (
        <QuoteModal
          clients={clients}
          packages={packages}
          packageMetrics={packageMetrics}
          services={services}
          promotions={promotions}
          eventTypes={eventTypes}
          onClose={() => setShowQuote(false)}
          onSave={(quote) => {
            if (onCreateQuote(quote)) setShowQuote(false);
          }}
        />
      )}
      {editingQuote && (
        <QuoteModal
          clients={clients}
          packages={packages}
          packageMetrics={packageMetrics}
          services={services}
          promotions={promotions}
          eventTypes={eventTypes}
          initialQuote={editingQuote}
          onClose={() => setEditingQuote(null)}
          onSave={(quote) => {
            if (onSaveQuoteVersion(editingQuote.id, quote)) setEditingQuote(null);
          }}
        />
      )}
      {statusQuote && (
        <StatusModal
          quoteView={statusQuote}
          onClose={() => setStatusQuote(null)}
          onUpdate={(id, state) => {
            onUpdateStatus(id, state);
            setStatusQuote(null);
          }}
        />
      )}
      {detailQuote && <QuoteDetailModal quoteView={detailQuote} onClose={() => setDetailQuote(null)} />}
    </div>
  );
}
