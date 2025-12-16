import { prisma } from '../../prisma';
import type { User } from '../../generated/prisma/client';

export class UserRepository {
    async findAll(): Promise<User[]> {
        return prisma.user.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async create(data: { name: string; email: string; password: string; role?: string; preferences?: any }): Promise<User> {
        return prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role ?? 'user',
                preferences: data.preferences ?? null,
            },
        });
    }

    async update(id: string, data: { name?: string; email?: string }): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id },
        });
    }

    async updatePassword(id: string, hashedPassword: string): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: {
                password: hashedPassword,
            },
        });
    }
}
