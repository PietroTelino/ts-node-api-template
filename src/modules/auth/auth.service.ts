import bcrypt from 'bcrypt';
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { UserRepository } from '../users/user.repository';
import type { User } from '../../generated/prisma/client';

interface LoginInput {
    email: string;
    password: string;
}

interface AuthResponse  {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    private userRepo = new UserRepository();

    private accessSecret = process.env.JWT_SECRET;
    private refreshSecret = process.env.JWT_REFRESH_SECRET;
    private accessExpiresInSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 900);
    private refreshExpiresInSeconds = Number(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS ?? 60 * 60 * 24 * 7);

    constructor() {
        if (!this.accessSecret) {
            throw new Error('JWT_SECRET não está definido');
        }
        if (!this.refreshSecret) {
            throw new Error('JWT_REFRESH_SECRET não está definido');
        }
    }

    private generateAccessToken(user: User): string {
        const options: SignOptions = {
            expiresIn: this.accessExpiresInSeconds,
        };

        return jwt.sign(
            {
                sub: user.id,
                role: user.role,
            },
            this.accessSecret as string,
            options
        );
    }

    private generateRefreshToken(user: User): string {
        const options: SignOptions = {
            expiresIn: this.refreshExpiresInSeconds,
        };

        return jwt.sign(
            {
                sub: user.id,
            },
            this.refreshSecret as string,
            options
        );
    }

    async login({ email, password }: LoginInput): Promise<AuthResponse> {
        const user = await this.userRepo.findByEmail(email);

        if (!user) {
            throw new Error('Credenciais inválidas');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw new Error('Credenciais inválidas');
        }

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }

    async refresh(refreshToken: string): Promise<AuthResponse> {
        if (!refreshToken) {
            throw new Error('Refresh token não fornecido');
        }

        let payload: JwtPayload;

        try {
            const decoded = jwt.verify(
                refreshToken,
                this.refreshSecret as string
            );

            if (typeof decoded === 'string') {
                throw new Error('Formato de token inválido');
            }

            payload = decoded as JwtPayload;
        } catch (error) {
            throw new Error('Refresh token inválido ou expirado');
        }

        if (!payload.sub) {
            throw new Error('Refresh token malformado');
        }

        const userId = Number(payload.sub);

        if (Number.isNaN(userId)) {
            throw new Error('ID de usuário inválido no token');
        }

        const user = await this.userRepo.findById(userId);

        if(!user) {
            throw new Error('Usuário não encontrado');
        }

        const accessToken = this.generateAccessToken(user);
        const newRefreshToken = this.generateRefreshToken(user);

        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
}