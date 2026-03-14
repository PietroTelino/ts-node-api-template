import express from 'express';
import cors from 'cors';
import { router } from './routes';
import { env } from './config/env';

export const app = express();

app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));

app.use(express.json());
app.use('/api', router);