import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
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

        const userId = String(payload.sub);
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

export function authorizeRoles(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Acesso negado: permissão insuficiente' });
        }

        return next();
    };
}
