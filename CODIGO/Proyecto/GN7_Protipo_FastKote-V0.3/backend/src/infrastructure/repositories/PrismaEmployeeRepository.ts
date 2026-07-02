import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/prisma/prisma.js';
import { EmployeeFilters, EmployeeRepository } from '../../domain/repositories/EmployeeRepository.js';

export class PrismaEmployeeRepository implements EmployeeRepository {
  list(filters: EmployeeFilters) {
    const where: Prisma.EmployeeWhereInput = {};

    if (filters.status) where.status = filters.status;
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

  findById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: { roles: { include: { role: true } }, user: { select: { username: true, isActive: true } } },
    });
  }

  async create(data: Record<string, unknown>) {
    const { roleIds, username, passwordHash, ...employeeData } = data as {
      roleIds?: string[];
      username?: string;
      passwordHash?: string;
      [key: string]: unknown;
    };

    const employee = await prisma.$transaction(async (tx) => {
      const created = await tx.employee.create({ data: employeeData as Prisma.EmployeeCreateInput });

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

  update(id: string, data: Record<string, unknown>) {
    return prisma.employee.update({ where: { id }, data: data as Prisma.EmployeeUpdateInput });
  }

  async deactivate(id: string) {
    await prisma.$transaction([
      prisma.employee.update({ where: { id }, data: { status: 'INACTIVE' } }),
      prisma.user.updateMany({ where: { employeeId: id }, data: { isActive: false } }),
    ]);
    return this.findById(id);
  }

  async assignRoles(employeeId: string, roleIds: string[]) {
    await prisma.employeeRole.deleteMany({ where: { employeeId } });
    if (roleIds.length) await prisma.employeeRole.createMany({ data: roleIds.map((roleId) => ({ employeeId, roleId })) });
    return this.findById(employeeId);
  }

  listRoles() {
    return prisma.role.findMany({ orderBy: { name: 'asc' } });
  }
}
