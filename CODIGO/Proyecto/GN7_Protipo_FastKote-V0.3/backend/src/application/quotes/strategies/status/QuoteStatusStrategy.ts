import { QuoteRepository } from '../../../../domain/repositories/QuoteRepository.js';

export interface QuoteStatusStrategy {
  supports(status: string): boolean;
  apply(repository: QuoteRepository, quote: any): Promise<void>;
}
