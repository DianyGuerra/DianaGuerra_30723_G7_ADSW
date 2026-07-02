import { prisma } from '../../shared/prisma/prisma.js';
export class PrismaAuthRepository {
    findByUsername(username) {
        return prisma.user.findUnique({
            where: { username },
            include: {
                employee: {
                    include: {
                        roles: { include: { role: true } },
                    },
                },
            },
        });
    }
    async registerFailedAttempt(userId, failedAttempts, lockedUntil) {
        await prisma.user.update({
            where: { id: userId },
            data: { failedAttempts, lockedUntil: lockedUntil ?? null },
        });
    }
    async clearFailedAttempts(userId) {
        await prisma.user.update({
            where: { id: userId },
            data: { failedAttempts: 0, lockedUntil: null },
        });
    }
}
