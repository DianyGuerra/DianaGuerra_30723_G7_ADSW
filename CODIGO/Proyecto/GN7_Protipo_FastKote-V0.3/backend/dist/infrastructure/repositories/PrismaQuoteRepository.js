import { prisma } from '../../shared/prisma/prisma.js';
export class PrismaQuoteRepository {
    list(filters) {
        const where = {};
        if (filters.clientId)
            where.clientId = filters.clientId;
        if (filters.status)
            where.status = filters.status;
        if (filters.dateFrom || filters.dateTo) {
            where.eventDate = {
                gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
                lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
            };
        }
        return prisma.quote.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { client: true, items: true, reservation: true },
        });
    }
    findById(id) {
        return prisma.quote.findUnique({
            where: { id },
            include: { client: true, items: true, reservation: true, createdBy: true },
        });
    }
    create(data) {
        return prisma.quote.create({
            data: {
                code: data.code,
                clientId: data.clientId,
                eventDate: new Date(data.eventDate),
                eventType: data.eventType,
                status: 'DRAFT',
                subtotal: data.subtotal,
                tax: data.tax,
                discount: data.discount,
                total: data.total,
                validUntil: data.validUntil,
                notes: data.notes,
                createdById: data.createdById,
                items: { create: data.items },
            },
            include: { client: true, items: true },
        });
    }
    async updateDraft(id, data) {
        const quote = await prisma.quote.findUnique({ where: { id } });
        if (!quote)
            return null;
        await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
        return prisma.quote.update({
            where: { id },
            data: {
                eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
                eventType: data.eventType,
                subtotal: data.subtotal,
                tax: data.tax,
                discount: data.discount,
                total: data.total,
                notes: data.notes,
                version: { increment: 1 },
                items: { create: data.items },
            },
            include: { client: true, items: true },
        });
    }
    updateStatus(id, status) {
        return prisma.quote.update({
            where: { id },
            data: { status: status },
            include: { client: true, items: true, reservation: true },
        });
    }
    async createOrBlockReservation(quoteId, eventDate, reason) {
        await prisma.eventReservation.upsert({
            where: { quoteId },
            update: { status: 'BLOCKED', eventDate, reason },
            create: { quoteId, eventDate, status: 'BLOCKED', reason },
        });
    }
    async releaseReservation(quoteId, reason) {
        await prisma.eventReservation.upsert({
            where: { quoteId },
            update: { status: 'RELEASED', reason },
            create: { quoteId, eventDate: new Date(), status: 'RELEASED', reason },
        });
    }
    listCalendar() {
        return prisma.eventReservation.findMany({
            where: { status: 'BLOCKED' },
            orderBy: { eventDate: 'asc' },
            include: { quote: { include: { client: true } } },
        });
    }
    listPackages() {
        return prisma.catalogPackage.findMany({
            where: { active: true },
            orderBy: { name: 'asc' },
            include: { items: true },
        });
    }
    getPackageById(id) {
        return prisma.catalogPackage.findUnique({ where: { id }, include: { items: true } });
    }
}
