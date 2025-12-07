import { Router } from 'express';
import { usersRouter } from './users.routes';
import { authRouter } from '../modules/auth/auth.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);