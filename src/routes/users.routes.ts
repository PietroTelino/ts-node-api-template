import { Router } from "express";
import { UserController } from '../modules/users/user.controller';
import { authMiddleware, authorizeRoles } from "../modules/auth/auth.middleware";

export const usersRouter = Router();
const controller = new UserController();

usersRouter.use(authMiddleware);

usersRouter.patch('/me/preferences', controller.updateMyPreferences);
usersRouter.get('/', authorizeRoles('administrator', 'god'), controller.list);
usersRouter.get('/:id', authorizeRoles('administrator', 'god'), controller.getById);
usersRouter.post('/', authorizeRoles('administrator', 'god'), controller.create);
usersRouter.put('/:id', authorizeRoles('administrator', 'god'), controller.update);
usersRouter.delete('/:id', authorizeRoles('administrator', 'god'), controller.delete);