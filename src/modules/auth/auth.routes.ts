import { Router } from 'express';
import { AuthController } from './auth.controller';

export const authRouter = Router();
const controller = new AuthController();

authRouter.post('/login', controller.login);
authRouter.post('/refresh', controller.refresh);
authRouter.post('/register', controller.register);
authRouter.post('/forgot-password', controller.forgotPassword);
authRouter.post('/reset-password', controller.resetPassword);