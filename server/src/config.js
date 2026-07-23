import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod',
  pandascoreApiKey: process.env.PANDASCORE_API_KEY || '',
  pandascoreBaseUrl: 'https://api.pandascore.co',
};
