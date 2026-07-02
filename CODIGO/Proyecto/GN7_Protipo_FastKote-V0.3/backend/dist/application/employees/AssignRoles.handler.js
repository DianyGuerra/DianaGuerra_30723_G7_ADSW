import { z } from 'zod';
const schema = z.object({
    employeeId: z.string().uuid(),
    roleIds: z.array(z.string().uuid()).default([]),
});
export class AssignRolesHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    handle(input) {
        const data = schema.parse(input);
        return this.repository.assignRoles(data.employeeId, data.roleIds);
    }
}
