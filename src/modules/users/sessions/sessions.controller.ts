import { Request, Response } from 'express';
import { SessionService } from './sessions.service';

export class SessionController {
    private service = new SessionService();

    listMySessions = async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Não autenticado' });
            }

            const sessions = await this.service.listMySessions(req.user.id);
            return res.json(sessions);
        } catch (error: any) {
            return res.status(401).json({ message: error.message });
        }
    };

    logoutSession = async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Não autenticado' });
            }

            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(400).json({ message: 'sessionId é obrigatório' });
            }

            await this.service.logoutSession(req.user.id, sessionId);
            return res.status(200).json({ message: 'A sessão foi finalizada com sucesso.' });
        } catch (error: any) {
            return res.status(401).json({ message: error.message });
        }
    };
}
