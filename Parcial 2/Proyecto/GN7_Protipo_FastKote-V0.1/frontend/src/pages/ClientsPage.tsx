import { FormEvent, useEffect, useState } from 'react';
import { Client, ClientPayload, createClient, listClients, updateClient } from '../api/clients';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const emptyClient: ClientPayload = {
  type: 'NATURAL',
  fullName: '',
  identification: '',
  email: '',
  phone: '',
  address: '',
  privacyConsent: true,
};

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ClientPayload>(emptyClient);
  const [error, setError] = useState('');

  async function load() {
    setClients(await listClients(search));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setCreating(true);
    setForm(emptyClient);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm(client);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      if (editing) await updateClient(editing.id, form);
      else await createClient(form);
      setEditing(null);
      setCreating(false);
      setForm(emptyClient);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cliente.');
    }
  }

  const showForm = creating || editing !== null;

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">RF2 - RF4</p>
          <h1>Administrar clientes</h1>
          <p>Catálogo con búsqueda, detalle, registro y actualización.</p>
        </div>
        <button className="primary-btn" onClick={openCreate}>+ Registrar Cliente</button>
      </div>

      <section className="toolbar">
        <input placeholder="Buscar por nombre, cédula/RUC, correo o teléfono" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="secondary-btn" onClick={load}>Buscar</button>
      </section>

      <section className="table-card">
        <table>
          <thead><tr><th>Nombre</th><th>Cédula/RUC</th><th>Correo</th><th>Teléfono</th><th>Dirección</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.fullName}</td>
                <td>{client.identification}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
                <td>{client.address}</td>
                <td><Badge value={client.status} /></td>
                <td className="actions">
                  <button onClick={() => setSelected(client)}>Ver</button>
                  <button onClick={() => openEdit(client)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selected && (
        <Modal title="Ver detalles del cliente" onClose={() => setSelected(null)}>
          <div className="detail-grid">
            <Badge value={selected.status} />
            <p><strong>Nombre:</strong> {selected.fullName}</p>
            <p><strong>Identificación:</strong> {selected.identification}</p>
            <p><strong>Correo:</strong> {selected.email}</p>
            <p><strong>Celular:</strong> {selected.phone}</p>
            <p><strong>Dirección:</strong> {selected.address}</p>
            <p><strong>Consentimiento LOPDP:</strong> {selected.privacyConsent ? 'Aceptado' : 'No aceptado'}</p>
          </div>
          <button className="secondary-btn" onClick={() => setSelected(null)}>Cerrar</button>
        </Modal>
      )}

      {showForm && (
        <Modal title={editing ? 'Actualizar datos del cliente' : 'Registrar Cliente'} onClose={() => { setEditing(null); setCreating(false); setForm(emptyClient); }}>
          <form className="form-grid" onSubmit={submit}>
            <label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ClientPayload['type'] })}><option value="NATURAL">Natural</option><option value="JURIDICAL">Jurídica</option></select></label>
            <label>Nombre<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
            <label>Cédula/RUC<input required value={form.identification} onChange={(e) => setForm({ ...form, identification: e.target.value })} /></label>
            <label>Correo<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Celular<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Dirección<input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
            <label className="check"><input type="checkbox" checked={form.privacyConsent} onChange={(e) => setForm({ ...form, privacyConsent: e.target.checked })} /> Acepta tratamiento de datos personales</label>
            {error && <div className="alert error">{error}</div>}
            <button className="primary-btn">{editing ? 'Guardar cambios' : 'Guardar'}</button>
          </form>
        </Modal>
      )}
    </main>
  );
}
