import { QuoteRepository } from '../../../../domain/repositories/QuoteRepository.js';
import { AcceptQuoteStatusStrategy } from './AcceptQuoteStatusStrategy.js';
import { DraftOrSentStatusStrategy } from './DraftOrSentStatusStrategy.js';
import { ReleaseQuoteStatusStrategy } from './ReleaseQuoteStatusStrategy.js';
import { QuoteStatusStrategy } from './QuoteStatusStrategy.js';

export class QuoteStatusContext {
  private readonly strategies: QuoteStatusStrategy[] = [
    new AcceptQuoteStatusStrategy(),
    new ReleaseQuoteStatusStrategy(),
    new DraftOrSentStatusStrategy(),
  ];

  async apply(repository: QuoteRepository, quote: any) {
    const strategy = this.strategies.find((candidate) => candidate.supports(quote.status));
    if (!strategy) throw new Error(`No existe estrategia para estado ${quote.status}`);
    await strategy.apply(repository, quote);
  }
}
