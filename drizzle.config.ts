import * as dotenv from "dotenv";
import {defineConfig} from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const envFiles = [
    ".env.local",
    process.env.NODE_ENV === "production" ? ".env.production" : "",
    ".env",
  ].filter(Boolean);

  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      dotenv.config({path: fullPath});
      break; // stop after first one found
    }
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL ?? "";
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
