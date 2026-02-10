import { z } from "zod";

const isDev = process.env.NODE_ENV !== "production";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: isDev ? z.string().optional() : z.string().url(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  BYBIT_WS_URL: z.string().default("wss://stream.bybit.com/v5/public/linear"),
  BYBIT_REST_URL: z.string().default("https://api.bybit.com"),
  WEBPUSH_VAPID_PUBLIC_KEY: z.string().optional(),
  WEBPUSH_VAPID_PRIVATE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export const hasDatabase = Boolean(env.DATABASE_URL);
export const isProd = env.NODE_ENV === "production";
