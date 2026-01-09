import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { usersRouter } from '../modules/users/users.routes';
import { passwordResetRouter } from '../modules/password-reset/password-reset.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/password-reset', passwordResetRouter);