import { apiFetch } from './http';

export interface Role { id: string; name: string; description?: string; }
export interface Employee {
  id: string;
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  position?: string;
  status: 'ACTIVE' | 'INACTIVE';
  roles: { role: Role }[];
  user?: { username: string; isActive: boolean } | null;
}

export interface EmployeeCreatePayload {
  identification: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  position?: string;
  username?: string;
  password?: string;
  roleIds?: string[];
}

export function listEmployees(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch<Employee[]>(`/employees${query}`);
}

export function createEmployee(payload: EmployeeCreatePayload) {
  return apiFetch<Employee>('/employees', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateEmployee(id: string, payload: Partial<Omit<Employee, 'id' | 'roles' | 'user'>>) {
  return apiFetch<Employee>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deactivateEmployee(id: string) {
  return apiFetch<Employee>(`/employees/${id}/deactivate`, { method: 'PATCH' });
}

export function listRoles() {
  return apiFetch<Role[]>('/roles');
}

export function assignRoles(employeeId: string, roleIds: string[]) {
  return apiFetch<Employee>(`/employees/${employeeId}/roles`, { method: 'PUT', body: JSON.stringify({ roleIds }) });
}
