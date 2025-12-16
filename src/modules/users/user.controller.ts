import { Request, Response } from 'express';
import { UserService } from './user.service';

export class UserController {
    private service = new UserService();

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
        } catch (err: any) {
            console.error(err);
            return res.status(400).json({ message: err.message || 'Erro ao criar usuário' });
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
        } catch (err: any) {
            console.error(err);
            return res.status(400).json({ message: err.message || 'Erro ao atualizar usuário' });
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
        } catch (err: any) {
            console.error(err);
            return res.status(400).json({ message: err.message || 'Erro ao deletar usuário' });
        }
    };
}
