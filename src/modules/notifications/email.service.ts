import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../../config/env';

export class EmailService {
    private transporter: Transporter | null = null;

    constructor() {
        if (!env.emailEnabled) {
            console.warn('[EmailService] Envio de e-mail desabilitado');
            return;
        }

        if (!env.emailHost || !env.emailUser || !env.emailPassword) {
            throw new Error('Configuração de e-mail incompleta no .env');
        }

        this.transporter = nodemailer.createTransport({
            host: env.emailHost,
            port: env.emailPort,
            secure: env.emailSecure,
            auth: {
                user: env.emailUser,
                pass: env.emailPassword,
            },
        });
    }

    async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
        if (!this.transporter) {
            console.log('[EmailService] (DEV MODE)');
            console.log(`To: ${to}`);
            console.log(`Reset link: ${resetLink}`);
            return;
        }

        await this.transporter.sendMail({
            from: env.emailFrom,
            to,
            subject: 'Redefinição de senha',
            html:  `
                <p>Você solicitou a redefinição de sua senha.</p>
                <p>Clique no link abaixo para criar uma nova senha:</p>
                <p>
                    <a href="${resetLink}">
                        Redefinir senha
                    </a>
                </p>
                <p>Se você não solicitou isso, ignore este e-mail.</p>
            `,
        });
    }
}