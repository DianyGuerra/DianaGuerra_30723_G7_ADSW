import { prisma } from '../../shared/prisma/prisma.js';
export class PrismaEmployeeRepository {
    list(filters) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { identification: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return prisma.employee.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { roles: { include: { role: true } }, user: { select: { username: true, isActive: true } } },
        });
    }
    findById(id) {
        return prisma.employee.findUnique({
            where: { id },
            include: { roles: { include: { role: true } }, user: { select: { username: true, isActive: true } } },
        });
    }
    async create(data) {
        const { roleIds, username, passwordHash, ...employeeData } = data;
        const employee = await prisma.$transaction(async (tx) => {
            const created = await tx.employee.create({ data: employeeData });
            if (roleIds?.length) {
                await tx.employeeRole.createMany({
                    data: roleIds.map((roleId) => ({ employeeId: created.id, roleId })),
                    skipDuplicates: true,
                });
            }
            if (username && passwordHash) {
                await tx.user.create({
                    data: {
                        username,
                        passwordHash,
                        employeeId: created.id,
                    },
                });
            }
            return created;
        });
        return this.findById(employee.id);
    }
    update(id, data) {
        return prisma.employee.update({ where: { id }, data: data });
    }
    async deactivate(id) {
        await prisma.$transaction([
            prisma.employee.update({ where: { id }, data: { status: 'INACTIVE' } }),
            prisma.user.updateMany({ where: { employeeId: id }, data: { isActive: false } }),
        ]);
        return this.findById(id);
    }
    async assignRoles(employeeId, roleIds) {
        await prisma.employeeRole.deleteMany({ where: { employeeId } });
        if (roleIds.length)
            await prisma.employeeRole.createMany({ data: roleIds.map((roleId) => ({ employeeId, roleId })) });
        return this.findById(employeeId);
    }
    listRoles() {
        return prisma.role.findMany({ orderBy: { name: 'asc' } });
    }
}
