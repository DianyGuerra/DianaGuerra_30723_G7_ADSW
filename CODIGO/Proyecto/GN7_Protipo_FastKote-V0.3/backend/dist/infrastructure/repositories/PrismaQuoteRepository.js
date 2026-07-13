import { prisma } from '../../shared/prisma/prisma.js';
export class PrismaQuoteRepository {
    async autoCompletePastReservations() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await prisma.eventReservation.updateMany({
            where: {
                status: 'BLOCKED',
                eventDate: {
                    lt: today,
                },
            },
            data: {
                status: 'COMPLETED',
                reason: 'Finalizado automáticamente al pasar el día del evento.',
            },
        });
    }
    async list(filters) {
        await this.autoCompletePastReservations();
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
                packageId: data.packageId,
                childrenCount: data.childrenCount,
                items: { create: data.items },
            },
            include: { client: true, items: true },
        });
    }
    async updateDraft(id, data) {
        const quote = await prisma.quote.findUnique({ where: { id }, include: { reservation: true } });
        if (!quote)
            return null;
        await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
        const updated = await prisma.quote.update({
            where: { id },
            data: {
                eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
                eventType: data.eventType,
                subtotal: data.subtotal,
                tax: data.tax,
                discount: data.discount,
                total: data.total,
                notes: data.notes,
                packageId: data.packageId,
                childrenCount: data.childrenCount,
                version: { increment: 1 },
                items: { create: data.items },
            },
            include: { client: true, items: true, reservation: true },
        });
        if (updated.reservation && data.eventDate) {
            await prisma.eventReservation.update({
                where: { quoteId: id },
                data: { eventDate: new Date(data.eventDate) }
            });
        }
        return updated;
    }
    updateStatus(id, status) {
        return prisma.quote.update({
            where: { id },
            data: { status: status },
            include: { client: true, items: true, reservation: true },
        });
    }
    async handleStockChange(quoteId, action) {
        const quote = await prisma.quote.findUnique({
            where: { id: quoteId }
        });
        if (!quote || !quote.packageId)
            return;
        const pkg = await prisma.catalogPackage.findUnique({
            where: { id: quote.packageId },
            include: {
                items: true,
            }
        });
        if (!pkg)
            return;
        const factor = action === 'DEDUCT' ? 1 : -1;
        const movementType = action === 'DEDUCT' ? 'OUT' : 'IN';
        const notesSuffix = action === 'DEDUCT' ? 'por cotización aceptada' : 'por liberación de cotización';
        for (const item of pkg.items) {
            const baseQty = Number(item.quantity ?? 1) * Number(quote.childrenCount ?? 1);
            if (item.inventoryItemId) {
                const invItem = await prisma.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
                if (invItem) {
                    const nextStock = invItem.stock - (baseQty * factor);
                    await prisma.inventoryMovement.create({
                        data: {
                            inventoryItemId: invItem.id,
                            type: movementType,
                            quantity: baseQty,
                            previousCost: invItem.currentCost,
                            newCost: invItem.currentCost,
                            notes: `Stock ${action === 'DEDUCT' ? 'descontado' : 'devuelto'} ${notesSuffix} ${quote.code}`,
                        }
                    });
                    await prisma.inventoryItem.update({
                        where: { id: invItem.id },
                        data: { stock: nextStock }
                    });
                }
            }
            else if (item.serviceId) {
                const service = await prisma.serviceCatalog.findUnique({
                    where: { id: item.serviceId },
                    include: { components: true }
                });
                if (service) {
                    for (const comp of service.components) {
                        if (comp.inventoryItemId) {
                            const compQty = Number(comp.quantity ?? 1) * baseQty;
                            const invItem = await prisma.inventoryItem.findUnique({ where: { id: comp.inventoryItemId } });
                            if (invItem) {
                                const nextStock = invItem.stock - (compQty * factor);
                                await prisma.inventoryMovement.create({
                                    data: {
                                        inventoryItemId: invItem.id,
                                        type: movementType,
                                        quantity: compQty,
                                        previousCost: invItem.currentCost,
                                        newCost: invItem.currentCost,
                                        notes: `Stock ${action === 'DEDUCT' ? 'descontado' : 'devuelto'} por servicio ${service.name} ${notesSuffix} ${quote.code}`,
                                    }
                                });
                                await prisma.inventoryItem.update({
                                    where: { id: invItem.id },
                                    data: { stock: nextStock }
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    async createOrBlockReservation(quoteId, eventDate, reason) {
        const existing = await prisma.eventReservation.findUnique({ where: { quoteId } });
        const isAlreadyBlocked = existing && existing.status === 'BLOCKED';
        await prisma.eventReservation.upsert({
            where: { quoteId },
            update: { status: 'BLOCKED', eventDate, reason },
            create: { quoteId, eventDate, status: 'BLOCKED', reason },
        });
        if (!isAlreadyBlocked) {
            await this.handleStockChange(quoteId, 'DEDUCT');
        }
    }
    async releaseReservation(quoteId, reason) {
        const existing = await prisma.eventReservation.findUnique({ where: { quoteId } });
        const wasBlocked = existing && existing.status === 'BLOCKED';
        await prisma.eventReservation.upsert({
            where: { quoteId },
            update: { status: 'RELEASED', reason },
            create: { quoteId, eventDate: new Date(), status: 'RELEASED', reason },
        });
        if (wasBlocked) {
            await this.handleStockChange(quoteId, 'REFUND');
        }
    }
    async updateReservationStatus(id, status) {
        const existing = await prisma.eventReservation.findUnique({ where: { id } });
        if (!existing)
            return null;
        const wasBlocked = existing.status === 'BLOCKED';
        const isNowBlocked = status === 'BLOCKED';
        const updated = await prisma.eventReservation.update({
            where: { id },
            data: { status: status },
        });
        if (wasBlocked && !isNowBlocked) {
            await this.handleStockChange(existing.quoteId, 'REFUND');
        }
        else if (!wasBlocked && isNowBlocked) {
            await this.handleStockChange(existing.quoteId, 'DEDUCT');
        }
        return updated;
    }
    async listCalendar() {
        await this.autoCompletePastReservations();
        return prisma.eventReservation.findMany({
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
