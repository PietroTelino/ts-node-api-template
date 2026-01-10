import { UserRepository, SafeUser } from './user.repository';
import type { User } from '../../generated/prisma/client';
import bcrypt from 'bcrypt';
import { validatePasswordOrThrow } from './policies/password.policy';
import { validateEmailOrThrow } from './policies/email.policy';
import { RefreshTokenRepository } from '../auth/tokens/refresh-token.repository'

type Theme = 'light' | 'dark';

export class UserService {
    private repo = new UserRepository();

    async register(data: any) {
        validateEmailOrThrow(data.email);
        validatePasswordOrThrow(data.password);

        const exists = await this.repo.findByEmail(data.email);

        if (exists) {
            throw new Error('Email already in use');
        }

        const user = await this.repo.create(data);

        return {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        };
    }

    list(): Promise<SafeUser[]> {
        return this.repo.findAll();
    }

    getById(id: string): Promise<User | null> {
        return this.repo.findById(id);
    }

    async create(input: { name: string; email: string; password: string; role?: string; preferences?: any }): Promise<User> {
        if (!input.name || !input.email) {
            throw new Error('Name e email são obrigatórios');
        }

        validateEmailOrThrow(input.email);
        validatePasswordOrThrow(input.password);

        const hashedPassword = await bcrypt.hash(input.password, 10);

        return this.repo.create({
            ...input,
            password: hashedPassword,
        });
    }

    update(id: string, input: { name?: string; email?: string }): Promise<User> {
        if (input.email) {
            validateEmailOrThrow(input.email);
            input.email = input.email.trim().toLowerCase();
        }

        return this.repo.update(id, input);
    }

    async changeMyPassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.repo.findById(userId);

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const passwordMatches = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatches) {
            throw new Error('Senha atual incorreta');
        }

        validatePasswordOrThrow(newPassword);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.repo.updatePassword(userId, hashedPassword);

        const refreshTokenRepo = new RefreshTokenRepository();
        await refreshTokenRepo.revokeAllByUser(userId);
    }

    delete(id: string): Promise<void> {
        return this.repo.delete(id);
    }

    async updateMyTheme(id: string, theme: Theme): Promise<{ preferences: { theme: Theme } }> {
        if (theme !== 'light' && theme !== 'dark') {
            throw new Error('O tema deve ser light ou dark.');
        }

        const user = await this.repo.findById(id);

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const currentPrefs = (user.preferences ?? {}) as Record<string, any>;

        const newPreferences = {
            ...currentPrefs,
            theme,
        };

        await this.repo.updatePreferences(id, newPreferences);

        return { preferences: { theme } };
    }
}