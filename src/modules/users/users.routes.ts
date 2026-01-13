import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware, authorizeRoles } from '../auth/auth.middleware';

export const usersRouter = Router();
const controller = new UserController();

usersRouter.post('/', controller.register);

usersRouter.use(authMiddleware);

usersRouter.get('/', authorizeRoles('administrator', 'god'), controller.list);
usersRouter.get('/:id', authorizeRoles('administrator', 'god'), controller.getById);
usersRouter.post('/create', authorizeRoles('administrator', 'god'), controller.create);
usersRouter.patch('/me/preferences', authorizeRoles('user', 'administrator', 'god'), controller.updateMyPreferences);
usersRouter.patch('/me/password', authorizeRoles('user', 'administrator', 'god'), controller.changeMyPassword);
usersRouter.delete('/me/delete', authorizeRoles('user', 'administrator', 'god'), controller.selfDelete);
usersRouter.put('/:id', authorizeRoles('administrator', 'god'), controller.update);
usersRouter.delete('/:id', authorizeRoles('administrator', 'god'), controller.delete);
usersRouter.patch('/:id/inactivate', authorizeRoles('administrator', 'god'), controller.inactivateUser);
usersRouter.patch('/:id/reactivate', authorizeRoles('administrator', 'god'), controller.reactivateUser);
usersRouter.post('/:id/reset-password', authorizeRoles('administrator', 'god'), controller.adminResetPassword);