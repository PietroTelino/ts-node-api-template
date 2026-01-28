import { Request, Response } from 'express';
import { PasswordResetService } from './password-reset.service';
import { AuditService } from '../audit/audit.service';

export class PasswordResetController {
    private service = new PasswordResetService();
    private auditService = new AuditService();

    request = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: 'Email é obrigatório' });
            }

            await this.service.requestReset(email);

            await this.auditService.logPasswordResetRequest(
                email,
                req.ip,
                typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
            );

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

            const result = await this.service.resetPassword(token, password);

            if (result) {
                await this.auditService.logPasswordResetConfirm(
                    result.userId,
                    { email: result.email },
                    req.ip,
                    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
                );
            }

            return res.json({ message: 'Senha redefinida com sucesso' });
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message });
        }
    };
}