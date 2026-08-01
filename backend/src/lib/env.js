import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(6).optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  APP_BASE_URL: z.string().optional(),
});

export function getEnv() {
  return envSchema.parse(process.env);
}
