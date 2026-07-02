export class ListRolesHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    handle() {
        return this.repository.listRoles();
    }
}
