export interface QuoteFilters {
  clientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface QuoteRepository {
  list(filters: QuoteFilters): Promise<unknown[]>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<unknown>;
  updateDraft(id: string, data: any): Promise<unknown>;
  updateStatus(id: string, status: string): Promise<unknown>;
  createOrBlockReservation(quoteId: string, eventDate: Date, reason: string): Promise<void>;
  releaseReservation(quoteId: string, reason: string): Promise<void>;
  listCalendar(): Promise<unknown[]>;
  listPackages(): Promise<unknown[]>;
  getPackageById(id: string): Promise<any | null>;
}
