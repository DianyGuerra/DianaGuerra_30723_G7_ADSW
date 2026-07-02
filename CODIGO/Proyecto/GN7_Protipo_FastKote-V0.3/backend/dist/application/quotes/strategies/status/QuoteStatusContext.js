import { AcceptQuoteStatusStrategy } from './AcceptQuoteStatusStrategy.js';
import { DraftOrSentStatusStrategy } from './DraftOrSentStatusStrategy.js';
import { ReleaseQuoteStatusStrategy } from './ReleaseQuoteStatusStrategy.js';
export class QuoteStatusContext {
    strategies = [
        new AcceptQuoteStatusStrategy(),
        new ReleaseQuoteStatusStrategy(),
        new DraftOrSentStatusStrategy(),
    ];
    async apply(repository, quote) {
        const strategy = this.strategies.find((candidate) => candidate.supports(quote.status));
        if (!strategy)
            throw new Error(`No existe estrategia para estado ${quote.status}`);
        await strategy.apply(repository, quote);
    }
}
