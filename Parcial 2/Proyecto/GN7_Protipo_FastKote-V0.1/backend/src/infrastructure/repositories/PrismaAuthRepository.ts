import { prisma } from '../../shared/prisma/prisma.js';
import { AuthRepository } from '../../domain/repositories/AuthRepository.js';

export class PrismaAuthRepository implements AuthRepository {
  findByUsername(username: string) {
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

  async registerFailedAttempt(userId: string, failedAttempts: number, lockedUntil?: Date | null) {
    await prisma.user.update({
      where: { id: userId },
      data: { failedAttempts, lockedUntil: lockedUntil ?? null },
    });
  }

  async clearFailedAttempts(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  }
}
