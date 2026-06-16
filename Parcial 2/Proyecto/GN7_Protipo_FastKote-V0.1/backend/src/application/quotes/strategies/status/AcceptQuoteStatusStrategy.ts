import { QuoteRepository } from '../../../../domain/repositories/QuoteRepository.js';
import { QuoteStatusStrategy } from './QuoteStatusStrategy.js';

export class AcceptQuoteStatusStrategy implements QuoteStatusStrategy {
  supports(status: string) {
    return status === 'ACCEPTED';
  }

  async apply(repository: QuoteRepository, quote: any) {
    await repository.createOrBlockReservation(quote.id, quote.eventDate, 'Cotización aceptada: fecha bloqueada automáticamente.');
  }
}
