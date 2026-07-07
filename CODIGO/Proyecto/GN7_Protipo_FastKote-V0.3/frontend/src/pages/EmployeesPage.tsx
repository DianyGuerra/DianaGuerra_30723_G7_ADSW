import { FormEvent, useEffect, useState } from 'react';
import { assignRoles, createEmployee, deactivateEmployee, Employee, listEmployees, listRoles, Role, updateEmployee } from '../api/employees';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { cleanDigits, cleanName, validateEcuadorianId } from '../utils/validation';

const emptyEmployee = {
  identification: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  position: '',
  username: '',
  password: '',
  roleIds: [] as string[],
};

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyEmployee);
  const [roleEmployee, setRoleEmployee] = useState<Employee | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  async function load() {
    setEmployees(await listEmployees(search));
    setRoles(await listRoles().catch(() => []));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setCreating(true);
    setForm(emptyEmployee);
  }

  function openEdit(employee: Employee) {
    setEditing(employee);
    setForm({
      identification: employee.identification,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone ?? '',
      address: employee.address ?? '',
      position: employee.position ?? '',
      username: '',
      password: '',
      roleIds: [],
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!validateEcuadorianId(form.identification)) {
      setError('La identificación (Cédula) no es válida en Ecuador. Verifique los dígitos ingresados.');
      return;
    }
    try {
      if (!editing && form.roleIds.length === 0) {
        setError('Selecciona al menos un rol para el usuario.');
        return;
      }

      if (editing) {
        await updateEmployee(editing.id, {
          identification: form.identification,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          position: form.position,
        });
      } else {
        await createEmployee(form);
      }
      setEditing(null);
      setCreating(false);
      setForm(emptyEmployee);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar el empleado.'); }
  }

  function openRoles(employee: Employee) {
    setRoleEmployee(employee);
    setSelectedRoleIds(employee.roles.map((item) => item.role.id));
  }

  async function saveRoles() {
    if (!roleEmployee) return;
    await assignRoles(roleEmployee.id, selectedRoleIds);
    setRoleEmployee(null);
    await load();
  }

  function toggleCreateRole(roleId: string, checked: boolean) {
    setForm({ ...form, roleIds: checked ? [...form.roleIds, roleId] : form.roleIds.filter((id) => id !== roleId) });
  }

  const showForm = creating || editing !== null;

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow">RF5 - RF10</p>
          <h1>Gestión de empleados</h1>
          <p>Solo el Administrador puede crear usuarios, editar datos, asignar roles y desactivar personal.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Registrar Empleado</button>
      </div>

      <section className="toolbar">
        <input placeholder="Buscar empleado" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-secondary" onClick={load}>Buscar</button>
      </section>

      <section className="table-card">
        <table>
          <thead><tr><th>Empleado</th><th>Identificación</th><th>Usuario</th><th>Correo</th><th>Cargo</th><th>Roles</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.firstName} {employee.lastName}</td>
                <td>{employee.identification}</td>
                <td>{employee.user?.username ?? 'Sin acceso'}</td>
                <td>{employee.email}</td>
                <td>{employee.position}</td>
                <td>{employee.roles.map((item) => item.role.name).join(', ') || 'Sin rol'}</td>
                <td><Badge value={employee.status} /></td>
                <td className="actions">
                  <button onClick={() => openEdit(employee)}>Editar</button>
                  <button onClick={() => openRoles(employee)}>Roles</button>
                  <button onClick={async () => { await deactivateEmployee(employee.id); await load(); }}>Desactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showForm && (
        <Modal title={editing ? 'Editar información del empleado' : 'Registrar nuevo empleado'} onClose={() => { setEditing(null); setCreating(false); setForm(emptyEmployee); }}>
          <form className="form-grid" onSubmit={submit}>
            <label>Cédula<input required value={form.identification} onChange={(e) => setForm({ ...form, identification: cleanDigits(e.target.value) })} /></label>
            <label>Nombres<input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: cleanName(e.target.value) })} /></label>
            <label>Apellidos<input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: cleanName(e.target.value) })} /></label>
            <label>Correo<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Teléfono<input value={form.phone} onChange={(e) => setForm({ ...form, phone: cleanDigits(e.target.value) })} /></label>
            <label>Cargo<input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></label>
            <label className="full-row">Dirección<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>

            {!editing && (
              <>
                <h3>Credenciales de acceso</h3>
                <label>Usuario<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
                <label>Contraseña<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
                <div className="full-row">
                  <strong>Rol inicial</strong>
                  <div className="role-list">
                    {roles.map((role) => (
                      <label key={role.id} className="check">
                        <input type="checkbox" checked={form.roleIds.includes(role.id)} onChange={(e) => toggleCreateRole(role.id, e.target.checked)} />
                        {role.name}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && <div className="alert error">{error}</div>}
            <button className="btn btn-primary">Guardar</button>
          </form>
        </Modal>
      )}

      {roleEmployee && (
        <Modal title="Asignar roles al empleado" onClose={() => setRoleEmployee(null)}>
          <div className="role-list">
            {roles.map((role) => (
              <label key={role.id} className="check">
                <input
                  type="checkbox"
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={(e) => setSelectedRoleIds(e.target.checked ? [...selectedRoleIds, role.id] : selectedRoleIds.filter((id) => id !== role.id))}
                />
                {role.name}
              </label>
            ))}
          </div>
          <button className="btn btn-primary" onClick={saveRoles}>Guardar roles</button>
        </Modal>
      )}
    </main>
  );
}
