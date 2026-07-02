export class AcceptQuoteStatusStrategy {
    supports(status) {
        return status === 'ACCEPTED';
    }
    async apply(repository, quote) {
        await repository.createOrBlockReservation(quote.id, quote.eventDate, 'Cotización aceptada: fecha bloqueada automáticamente.');
    }
}
