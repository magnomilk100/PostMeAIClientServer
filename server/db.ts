// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import dotenv from "dotenv";

// only load .env in development so you don’t accidentally override the Heroku DATABASE_URL
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // THIS ENABLES SSL FOR HEROKU POSTGRES
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });
