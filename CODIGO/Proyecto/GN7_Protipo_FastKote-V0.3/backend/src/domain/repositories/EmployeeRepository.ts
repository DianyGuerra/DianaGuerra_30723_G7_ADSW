export interface EmployeeFilters {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface EmployeeRepository {
  list(filters: EmployeeFilters): Promise<unknown[]>;
  findById(id: string): Promise<unknown | null>;
  create(data: Record<string, unknown>): Promise<unknown>;
  update(id: string, data: Record<string, unknown>): Promise<unknown>;
  deactivate(id: string): Promise<unknown>;
  assignRoles(employeeId: string, roleIds: string[]): Promise<unknown>;
  listRoles(): Promise<unknown[]>;
}
