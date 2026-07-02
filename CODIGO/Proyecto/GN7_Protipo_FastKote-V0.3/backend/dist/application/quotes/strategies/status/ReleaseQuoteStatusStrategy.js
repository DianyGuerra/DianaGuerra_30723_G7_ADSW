export class ReleaseQuoteStatusStrategy {
    supports(status) {
        return status === 'REJECTED' || status === 'EXPIRED';
    }
    async apply(repository, quote) {
        await repository.releaseReservation(quote.id, `Cotización ${quote.status.toLowerCase()}: fecha liberada automáticamente.`);
    }
}
