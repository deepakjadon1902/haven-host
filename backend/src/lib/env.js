import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(6).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  APP_BASE_URL: z.string().optional(),
  API_BASE_URL: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  BACKEND_URL: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
});

export function getEnv() {
  return envSchema.parse(process.env);
}
