export class EmailService {
    async sendPasswordResetEmail(to: string, resetLink: string) {
        // Por enquanto só loga. Depois você troca por nodemailer.
        console.log('=== Envio de e-mail de reset de senha ===');
        console.log(`Para: ${to}`);
        console.log(`Link de reset: ${resetLink}`);
        console.log('========================================');
    }
}