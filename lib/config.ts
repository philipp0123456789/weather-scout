import { z } from "zod";

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  APP_BASE_URL: z.string().url().optional(),
  CRON_SECRET: z.string().min(16).optional(),
  DEFAULT_PERSON_NAME: z.string().default("Lara"),
  DEFAULT_CITY: z.string().default("Stuttgart"),
  DEFAULT_LATITUDE: z.coerce.number().default(48.7758),
  DEFAULT_LONGITUDE: z.coerce.number().default(9.1829),
  DEFAULT_TIMEZONE: z.string().default("Europe/Berlin"),
  DEFAULT_MORNING_TIME: z.string().default("07:30")
});

export const env = envSchema.parse(process.env);
