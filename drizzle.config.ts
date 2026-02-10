import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Explicitly load .env.local to avoid missing DATABASE_URL in CLI context
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/cryptoscalp",
  },
  verbose: true,
});
