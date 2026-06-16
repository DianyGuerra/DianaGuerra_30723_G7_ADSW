import { apiFetch } from './http';

export interface Client {
  id: string;
  type: 'NATURAL' | 'JURIDICAL';
  fullName: string;
  identification: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  privacyConsent: boolean;
}

export type ClientPayload = Omit<Client, 'id' | 'status'> & { status?: Client['status'] };

export function listClients(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch<Client[]>(`/clients${query}`);
}

export function createClient(payload: ClientPayload) {
  return apiFetch<Client>('/clients', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateClient(id: string, payload: Partial<ClientPayload>) {
  return apiFetch<Client>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}
