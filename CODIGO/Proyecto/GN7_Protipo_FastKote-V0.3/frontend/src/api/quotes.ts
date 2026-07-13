import { apiFetch } from './http';

export interface PackageItem { id: string; name: string; category?: string; unit?: string; basePrice: string; }
export interface Package { id: string; name: string; eventTypes: string[]; basePrice?: string; pricePerChild?: string; minChildren?: number; capacityMax?: number; items: PackageItem[]; }
export interface QuoteItem { id: string; description: string; category?: string; quantity: number; unitPrice: string; subtotal: string; }
export interface Quote {
  id: string;
  code: string;
  clientId: string;
  eventDate: string;
  eventType: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  version: number;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  client: { fullName: string; identification: string; phone: string };
  items: QuoteItem[];
}

export function listPackages() {
  return apiFetch<Package[]>('/catalog/packages');
}

export function listQuotes(filters: Record<string, string> = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiFetch<Quote[]>(`/quotes${params ? `?${params}` : ''}`);
}

export function createQuote(payload: unknown) {
  return apiFetch<Quote>('/quotes', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateQuoteStatus(id: string, status: Quote['status']) {
  return apiFetch<Quote>(`/quotes/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export function sendQuoteWhatsApp(id: string) {
  return apiFetch<{ message?: string; simulated?: boolean; delivered?: boolean }>(`/quotes/${id}/send-whatsapp`, { method: 'POST' });
}

export async function downloadQuotePdf(id: string) {
  const blob = await apiFetch<Blob>(`/quotes/${id}/pdf`, { headers: { Accept: 'application/pdf' } });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cotizacion-${id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export function listCalendar() {
  return apiFetch<any[]>('/calendar');
}

export function updateQuote(id: string, payload: unknown) {
  return apiFetch<Quote>(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function updateReservationStatus(id: string, status: string) {
  return apiFetch<any>(`/calendar/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
