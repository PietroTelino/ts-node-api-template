import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { PasswordResetService } from './password-reset.service';
import { LogoutService } from './logout.service';

export class AuthController {
    private service = new AuthService();
    private userService = new UserService();
    private passwordResetService = new PasswordResetService();

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "email e password são obrigatórios." });
            }

            const result = await this.service.login({ email, password });

            return res.json(result);
        } catch (err: any) {
            console.error(err);
            return res.status(401).json({ message: err.message || "Credenciais inválidas" });
        }
    };

    async logout(req: Request, res: Response): Promise<Response> {
        const refreshToken =
            req.body.refreshToken ||
            req.cookies?.refreshToken ||
            req.headers['x-refresh-token'];
        
        const logoutService = new LogoutService();

        await logoutService.execute(refreshToken as string);

        res.clearCookie('refreshToken');

        return res.status(204).send();
    }

    logoutAll = async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Não autenticado' });
            }

            const logoutService = new LogoutService();

            await logoutService.logoutAll(req.user.id);

            return res.status(204).send();
        } catch (err: any) {
            return res.status(400).json({ message: err.message || 'Erro ao realizar logout global' });
        }
    };

    refresh = async (req: Request, res: Response) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ message: 'refreshToken é obrigatório' });
            }

            const result = await this.service.refresh(refreshToken);

            return res.json(result);
        } catch (err: any) {
            console.error(err);
            return res.status(401).json({ message: err.message || 'Refresh token inválido' });
        }
    };

    register = async (req: Request, res: Response) => {
        try {
            const { name, email, password, preferences } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ message: 'name, email e password são obrigatórios.' });
            }

            await this.userService.create({
                name,
                email,
                password,
                role: 'user',
                preferences,
            });

            const authResult = await this.service.login({ email, password });

            return res.status(201).json(authResult);
        } catch (err: any) {
            console.error(err);
            return res.status(400).json({ message: err.message || 'Erro ao registrar usuário' });
        }
    };

    forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: 'email é obrigatório.' });
            }

            await this.passwordResetService.requestReset(email);

            return res.json({
                message: 'Se o e-mail existir em nossa base, você receberá instruções de redefinição de senha.',
            });
        } catch (err: any) {
            console.error(err);
            return res.status(500).json({ message: err.message || 'Erro ao solicitar redefinição de senha' });
        }
    };

    resetPassword = async (req: Request, res: Response) => {
        try {
            const { token, password } = req.body;

            if (!token || !password) {
                return res.status(400).json({ message: 'token e password são obrigatórios.' });
            }

            await this.passwordResetService.resetPassword(token, password);

            return res.json({ message: 'Senha redefinida com sucesso.' });
        } catch (err: any) {
            console.log(err);
            return res.status(400).json({ message: err.message || 'Erro ao redefinir senha' });
        }
    };
}