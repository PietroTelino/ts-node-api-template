import { Request, Response } from 'express';
import { UserService } from './user.service';
import { AuditService } from '../audit/audit.service';

export class UserController {
    private service = new UserService();
    private auditService = new AuditService();

    register = async (req: Request, res: Response) => {
        try {
            const { name, email, password, preferences } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ message: 'name, email e password são obrigatórios.' });
            }

            const user = await this.service.register({ name, email, password, preferences });

            await this.auditService.logUserRegister(
                user.id,
                { email: user.email },
                req.ip,
                typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
            );

            return res.status(201).json(user);
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao registrar usuário' });
        }
    };

    list = async (req: Request, res: Response) => {
        try {
            const users = await this.service.list();
            return res.json(users);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao listar usuários' });
        }
    };

    listDeleted = async (req: Request, res: Response) => {
        try {
            const users = await this.service.listDeleted();
            return res.json(users);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao listar usuários deletados' });
        }
    };

    getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'ID do usuário é obrigatório' });
            }

            const user = await this.service.getById(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            return res.json(user);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao buscar usuário' });
        }
    };

    create = async (req: Request, res: Response) => {
        try {
            const { name, email, password, role, preferences } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ message: 'name, email e password são obrigatórios.' });
            }

            const user = await this.service.create({ name, email, password, role, preferences });

            if (req.user) {
                await this.auditService.logUserCreate(
                    user.id,
                    req.user.id,
                    { email: user.email, role: user.role },
                    req.ip,
                    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
                );
            }

            return res.status(201).json(user);
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao criar usuário' });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'ID do usuário é obrigatório' });
            }

            const { name, email } = req.body;
            const fields = [];
            if (name) fields.push('name');
            if (email) fields.push('email');

            const user = await this.service.update(id, { name, email });

            if (req.user) {
                await this.auditService.logUserUpdate(
                    id,
                    req.user.id,
                    { fields },
                    req.ip,
                    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
                );
            }

            return res.json(user);
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao atualizar usuário' });
        }
    };

    changeMyPassword = async (req: Request, res: Response) => {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!req.user || !currentPassword || !newPassword) {
                return res.status(401).json({ message: 'Usuário não autenticado.' });
            }

            await this.service.changeMyPassword(req.user.id, currentPassword, newPassword);

            await this.auditService.logPasswordChange(
                req.user.id,
                req.ip,
                typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
            );

            return res.status(200).json({ message: 'Senha alterada com sucesso.' });
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao alterar senha' });
        }
    };

    selfDelete = async (req: Request, res: Response) => {
        try {
            const { password } = req.body;

            if (!req.user || !password) {
                return res.status(401).json({ message: 'Usuário não autenticado.' });
            }

            const user = await this.service.getById(req.user.id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            await this.service.selfDelete(req.user.id, password);

            await this.auditService.logUserSelfDelete(
                req.user.id,
                { email: user.email },
                req.ip,
                typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
            );

            return res.status(200).json({ message: 'Conta removida com sucesso.' });
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao deletar usuário' });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'ID do usuário é obrigatório' });
            }

            const user = await this.service.getById(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            await this.service.delete(id);

            if (req.user) {
                await this.auditService.logUserDelete(
                    id,
                    req.user.id,
                    { email: user.email },
                    req.ip,
                    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
                );
            }

            return res.status(200).json({ message: 'Conta removida com sucesso.' });
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao deletar usuário' });
        }
    };

    updateMyPreferences = async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Usuário não autenticado.' });
            }

            const { theme } = req.body;

            if (!theme) {
                return res.status(400).json({ message: 'O tema é obrigatório, podendo ser light ou dark.' });
            }

            const result = await this.service.updateMyTheme(req.user.id, theme);

            await this.auditService.logPreferencesUpdate(
                req.user.id,
                { preferences: { theme } },
                req.ip,
                typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
            );

            return res.json(result);
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao atualizar preferências.' });
        }
    };

    inactivateUser = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'ID do usuário é obrigatório' });
            }

            const user = await this.service.getById(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            await this.service.inactivateUser(id);

            if (req.user) {
                await this.auditService.logUserInactivate(
                    id,
                    req.user.id,
                    { email: user.email },
                    req.ip,
                    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
                );
            }

            return res.status(200).json({ message: 'Usuário desativado com sucesso.' });
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao desativar usuário' });
        }
    };

    reactivateUser = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'ID do usuário é obrigatório' });
            }

            const user = await this.service.getById(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            await this.service.reactivateUser(id);

            if (req.user) {
                await this.auditService.logUserReactivate(
                    id,
                    req.user.id,
                    { email: user.email },
                    req.ip,
                    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
                );
            }

            return res.status(200).json({ message: 'Usuário reativado com sucesso.' });
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao reativar usuário' });
        }
    };

    adminResetPassword = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'ID do usuário é obrigatório' });
            }

            const user = await this.service.getById(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            await this.service.adminResetPassword(id);

            if (req.user) {
                await this.auditService.logPasswordAdminReset(
                    id,
                    req.user.id,
                    { email: user.email },
                    req.ip,
                    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined
                );
            }

            return res.status(200).json({
                message: 'Senha resetada com sucesso. Um e-mail foi enviado ao usuário com a nova senha.',
            });
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao resetar senha' });
        }
    };

    restoreUser = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'ID do usuário é obrigatório' });
            }

            await this.service.restore(id);

            if (req.user) {
                const user = await this.service.getById(id);

                if (user) {
                    await this.auditService.log({
                        userId: id,
                        performedById: req.user.id,
                        action: 'USER_RESTORE',
                        entity: 'USER',
                        entityId: id,
                        details: { email: user.email },
                        ...(req.ip && { ipAddress: req.ip }),
                        ...(typeof req.headers['user-agent'] === 'string' && { userAgent: req.headers['user-agent'] }),
                    });
                }
            }

            return res.status(200).json({ message: 'Usuário restaurado com sucesso.' });
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao restaurar usuário' });
        }
    };

    hardDelete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'ID do usuário é obrigatório' });
            }

            const user = await this.service.getById(id);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            await this.service.hardDelete(id);

            if (req.user) {
                await this.auditService.log({
                    userId: id,
                    performedById: req.user.id,
                    action: 'USER_HARD_DELETE',
                    entity: 'USER',
                    entityId: id,
                    details: { email: user.email },
                    ...(req.ip && { ipAddress: req.ip }),
                    ...(typeof req.headers['user-agent'] === 'string' && { userAgent: req.headers['user-agent'] }),
                });
            }

            return res.status(204).send();
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao deletar usuário permanentemente' });
        }
    };
}