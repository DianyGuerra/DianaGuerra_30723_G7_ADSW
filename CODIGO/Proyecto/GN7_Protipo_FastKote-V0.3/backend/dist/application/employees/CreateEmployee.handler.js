import { z } from 'zod';
const schema = z.object({
    identification: z.string().min(10),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    position: z.string().optional(),
    username: z.string().min(3).optional(),
    password: z.string().min(6).optional(),
    roleIds: z.array(z.string().uuid()).optional().default([]),
}).refine((data) => Boolean(data.username) === Boolean(data.password), {
    message: 'Para crear acceso se requiere usuario y contraseña.',
    path: ['username'],
}).refine((data) => !data.username || data.roleIds.length > 0, {
    message: 'Debe asignar al menos un rol al usuario.',
    path: ['roleIds'],
});
export class CreateEmployeeHandler {
    repository;
    passwordHasher;
    constructor(repository, passwordHasher) {
        this.repository = repository;
        this.passwordHasher = passwordHasher;
    }
    async handle(input) {
        const data = schema.parse(input);
        const passwordHash = data.password ? await this.passwordHasher.hash(data.password) : undefined;
        const { password, ...safeData } = data;
        return this.repository.create({ ...safeData, passwordHash });
    }
}
