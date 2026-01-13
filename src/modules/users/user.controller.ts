import { Request, Response } from 'express';
import { UserService } from './user.service';
import bcrypt from 'bcrypt';
import { validatePasswordOrThrow } from './policies/password.policy';

export class UserController {
    private service = new UserService();

    register = async (req: Request, res: Response) => {
        try {
            const { name, email, password, preferences } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    message: 'name, email e password são obrigatórios.',
                });
            }

            const user = await this.service.register({ name, email, password, preferences });

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

            const user = await this.service.update(id, { name, email });

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

            await this.service.selfDelete(req.user.id, password);

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

            await this.service.delete(id);

            return res.status(204).send();
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

            await this.service.inactivateUser(id);

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

            await this.service.reactivateUser(id);

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

            await this.service.adminResetPassword(id);

            return res.status(200).json({
                message: 'Senha resetada com sucesso. Um e-mail foi enviado ao usuário com a nova senha.',
            });
        } catch (error: any) {
            console.error(error);
            return res.status(400).json({ message: error.message || 'Erro ao resetar senha' });
        }
    };
}