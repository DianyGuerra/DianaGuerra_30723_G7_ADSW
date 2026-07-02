import { prisma } from '../../shared/prisma/prisma.js';
export class PrismaClientRepository {
    list(filters) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
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
    findById(id) {
        return prisma.client.findUnique({ where: { id }, include: { quotes: true } });
    }
    create(data) {
        return prisma.client.create({ data: data });
    }
    update(id, data) {
        return prisma.client.update({ where: { id }, data: data });
    }
}
