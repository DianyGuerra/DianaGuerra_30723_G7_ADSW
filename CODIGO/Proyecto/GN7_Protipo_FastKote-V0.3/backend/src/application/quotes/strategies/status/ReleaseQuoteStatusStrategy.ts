import { QuoteRepository } from '../../../../domain/repositories/QuoteRepository.js';
import { QuoteStatusStrategy } from './QuoteStatusStrategy.js';

export class ReleaseQuoteStatusStrategy implements QuoteStatusStrategy {
  supports(status: string) {
    return status === 'REJECTED' || status === 'EXPIRED';
  }

  async apply(repository: QuoteRepository, quote: any) {
    await repository.releaseReservation(quote.id, `Cotización ${quote.status.toLowerCase()}: fecha liberada automáticamente.`);
  }
}
