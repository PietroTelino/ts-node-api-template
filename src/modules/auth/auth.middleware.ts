import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                role: string;
            }
        }
    }
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

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error('JWT_SECRET não está definido');
        return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }

    try {
        const decoded = jwt.verify(token, secret);

        if (typeof decoded === 'string') {
            return res.status(401).json({ message: 'Token inválido' });
        }

        const payload = decoded as JwtPayload;

        if (!payload.sub) {
            return res.status(401).json({ message: 'Token malformado' });
        }

        const userId = typeof payload.sub === 'string'
            ? Number(payload.sub)
            : payload.sub;

        if (Number.isNaN(userId)) {
            return res.status(401).json({ message: 'ID de usuário inválido no token' });
        }

        const role = (payload as any).role ?? 'user';

        req.user = {
            id: userId,
            role,
        };

        return next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
}