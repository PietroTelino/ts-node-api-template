import dotenv from 'dotenv';

dotenv.config();

export const env = {
    port: Number(process.env.PORT ?? 3333),
    databaseUrl: process.env.DATABASE_URL as string,
};

if (!env.databaseUrl) {
    throw new Error('DATABASE_URL não definida no .env');
}
