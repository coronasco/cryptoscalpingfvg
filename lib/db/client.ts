import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env, hasDatabase } from "../env";
import * as schema from "./schema";

let pool: Pool | null = null;
let dbInstance: any = null;

if (hasDatabase) {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 5,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });
  dbInstance = drizzle(pool, { schema });
}

export const db = dbInstance;
export const dbPool = pool;
