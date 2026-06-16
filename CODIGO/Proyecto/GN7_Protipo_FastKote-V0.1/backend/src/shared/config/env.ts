import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? 'fastkote-dev-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '8h',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  TAX_RATE: Number(process.env.TAX_RATE ?? 0.15),
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL ?? '',
  WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN ?? '',
};
