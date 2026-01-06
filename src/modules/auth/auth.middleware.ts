import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../../config/env';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
                token?: string;
            };
        }
    }
}

interface AccessTokenPayload extends JwtPayload {
    sub: string;
    role?: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Formato de token inválido' });
    }

    if (!env.jwtSecret) {
        console.error('[AuthMiddleware] JWT_SECRET não configurado');
        return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }

    try {
        const decoded = jwt.verify(token, env.jwtSecret);

        if (typeof decoded === 'string') {
            return res.status(401).json({ message: 'Token inválido' });
        }

        const payload = decoded as AccessTokenPayload;

        if (!payload.sub) {
            return res.status(401).json({ message: 'Token malformado' });
        }

        req.user = {
            id: payload.sub,
            role: payload.role ?? 'user',
            token,
        };

        return next();
    } catch (error) {
        console.error('[AuthMiddleware]', error);
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
}

export function authorizeRoles(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ message: 'Acesso negado: permissão insuficiente' });
        }

        return next();
    };
}
