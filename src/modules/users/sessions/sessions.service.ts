import { RefreshTokenRepository } from '../../auth/tokens/refresh-token.repository';
import { t } from '../../../utils/t';

export class SessionService {
    constructor(private refreshTokenRepo = new RefreshTokenRepository()) {}

    async listMySessions(userId: string) {
        return this.refreshTokenRepo.findActiveByUser(userId);
    }

    async logoutSession(userId: string, sessionId: string) {
        const sessions = await this.refreshTokenRepo.findActiveByUser(userId);

        const session = sessions.find(s => s.id === sessionId);

        if (!session) {
            throw new Error(t('user.sessionNotFound'));
        }

        await this.refreshTokenRepo.revokeById(sessionId);
    }
}