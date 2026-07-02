export interface ClientFilters {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ClientRepository {
  list(filters: ClientFilters): Promise<unknown[]>;
  findById(id: string): Promise<unknown | null>;
  create(data: Record<string, unknown>): Promise<unknown>;
  update(id: string, data: Record<string, unknown>): Promise<unknown>;
}
