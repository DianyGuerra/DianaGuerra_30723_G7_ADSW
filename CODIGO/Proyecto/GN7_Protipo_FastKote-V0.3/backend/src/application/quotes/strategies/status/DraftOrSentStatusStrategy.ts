import { QuoteRepository } from '../../../../domain/repositories/QuoteRepository.js';
import { QuoteStatusStrategy } from './QuoteStatusStrategy.js';

export class DraftOrSentStatusStrategy implements QuoteStatusStrategy {
  supports(status: string) {
    return status === 'DRAFT' || status === 'SENT';
  }

  async apply(_repository: QuoteRepository, _quote: any) {
    // Borrador o enviada no bloquean definitivamente la agenda.
  }
}
