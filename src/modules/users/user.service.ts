import { UserRepository } from './user.repository';
import type { User } from '../../generated/prisma/client';
import bcrypt from 'bcrypt';

export class UserService {
    private repo = new UserRepository();

    list(): Promise<User[]> {
        return this.repo.findAll();
    }

    getById(id: string): Promise<User | null> {
        return this.repo.findById(id);
    }

    async create(input: { name: string; email: string; password: string; role?: string; preferences?: any }): Promise<User> {
        const hashedPassword = await bcrypt.hash(input.password, 10);

        if (!input.name || !input.email) {
            throw new Error('Name e email são obrigatórios');
        }

        return this.repo.create({
            ...input,
            password: hashedPassword,
        });
    }

    update(id: string, input: { name?: string; email?: string }): Promise<User> {
        return this.repo.update(id, input);
    }

    delete(id: string): Promise<void> {
        return this.repo.delete(id);
    }
}
