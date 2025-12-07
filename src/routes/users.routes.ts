import { Router } from "express";
import { UserController } from '../modules/users/user.controller';
import { authMiddleware } from "../modules/auth/auth.middleware";

export const usersRouter = Router();
const controller = new UserController();

usersRouter.use(authMiddleware);

usersRouter.get('/', controller.list);
usersRouter.get('/:id', controller.getById);
usersRouter.post('/', controller.create);
usersRouter.put('/:id', controller.update);
usersRouter.delete('/:id', controller.delete);