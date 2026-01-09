import { Request, Response } from 'express';
import { PasswordResetService } from './password-reset.service';

export class PasswordResetController {
    private service = new PasswordResetService();

    request = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: 'Email é obrigatório' });
            }

            await this.service.requestReset(email);

            return res.json({
                message: 'Se o e-mail existir, você receberá instruções para redefinir a senha.',
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao solicitar redefinição de senha' });
        }
    };

    confirm = async (req: Request, res: Response) => {
        try {
            const { token, password } = req.body;

            if (!token || !password) {
                return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
            }

            await this.service.resetPassword(token, password);

            return res.json({ message: 'Senha redefinida com sucesso' });
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message });
        }
    };
}