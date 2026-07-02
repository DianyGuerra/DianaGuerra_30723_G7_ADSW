import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/prisma/prisma.js';
import { ClientFilters, ClientRepository } from '../../domain/repositories/ClientRepository.js';

export class PrismaClientRepository implements ClientRepository {
  list(filters: ClientFilters) {
    const where: Prisma.ClientWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { identification: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { quotes: { select: { id: true, code: true, status: true, eventDate: true, total: true } } },
    });
  }

  findById(id: string) {
    return prisma.client.findUnique({ where: { id }, include: { quotes: true } });
  }

  create(data: Record<string, unknown>) {
    return prisma.client.create({ data: data as Prisma.ClientCreateInput });
  }

  update(id: string, data: Record<string, unknown>) {
    return prisma.client.update({ where: { id }, data: data as Prisma.ClientUpdateInput });
  }
}
