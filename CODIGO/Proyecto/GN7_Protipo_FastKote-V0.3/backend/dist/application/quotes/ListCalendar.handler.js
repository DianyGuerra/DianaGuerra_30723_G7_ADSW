export class ListCalendarHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    handle() {
        return this.repository.listCalendar();
    }
}
