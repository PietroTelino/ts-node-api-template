import { RefreshToken } from '../../../generated/prisma/client';
import { prisma } from '../../../prisma';

export class RefreshTokenRepository {
    async create(data: {
        userId: string;
        token: string;
        expiresAt: Date;
    }): Promise<RefreshToken> {
        return prisma.refreshToken.create({ data });
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        return prisma.refreshToken.findUnique({
            where: { token },
        });
    }

    async revoke(token: string): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: {
                token,
                revoked: false,
            },
            data: {
                revoked: true,
            },
        });
    }

    async revokeAllByUser(userId: string): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: {
                userId,
                revoked: false,
            },
            data: {
                revoked: true,
            },
        });
    }
}
