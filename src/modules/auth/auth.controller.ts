import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';

export class AuthController {
    private service = new AuthService();
    private userService = new UserService();

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
            });

            const authResult = await this.service.login({ email, password });

            return res.status(201).json(authResult);
        } catch (err: any) {
            console.error(err);
            return res.status(400).json({ message: err.message || 'Erro ao registrar usuário' });
        }
    };
}