export class DraftOrSentStatusStrategy {
    supports(status) {
        return status === 'DRAFT' || status === 'SENT';
    }
    async apply(_repository, _quote) {
        // Borrador o enviada no bloquean definitivamente la agenda.
    }
}
