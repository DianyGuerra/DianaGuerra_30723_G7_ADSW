export class ListPackagesHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    handle() {
        return this.repository.listPackages();
    }
}
