import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LogoutService } from './logout.service';

export class AuthController {
    private service = new AuthService();

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email e senha são obrigatórios' });
            }

            const result = await this.service.login({
                email,
                password,
                ...(req.ip && { ip: req.ip }),
                ...(typeof req.headers['user-agent'] === 'string' && {
                    userAgent: req.headers['user-agent'],
                }),
            });

            return res.json(result);
        } catch (error: any) {
            return res.status(401).json({ message: error.message });
        }
    };

    refresh = async (req: Request, res: Response) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ message: 'Refresh token é obrigatório' });
            }

            const result = await this.service.refresh(refreshToken);
            return res.json(result);
        } catch (error: any) {
            return res.status(401).json({ message: error.message });
        }
    };

    logout = async (req: Request, res: Response) => {
        const refreshToken =
            req.body.refreshToken ||
            req.cookies?.refreshToken ||
            req.headers['x-refresh-token'];

        const service = new LogoutService();
        await service.execute(refreshToken);

        res.clearCookie('refreshToken');
        return res.status(204).send();
    };

    logoutAll = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Não autenticado' });
        }

        const service = new LogoutService();
        await service.logoutAll(req.user.id);

        return res.status(204).send();
    };
}