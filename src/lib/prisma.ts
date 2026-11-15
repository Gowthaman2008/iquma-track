import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Ensure DATABASE_URL is always defined even if .env is missing on Vercel
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

// In Vercel serverless functions, copy dev.db to /tmp if needed
if (process.env.VERCEL) {
  try {
    const localDbPath = path.join(process.cwd(), "prisma", "dev.db");
    const tmpDbPath = "/tmp/dev.db";
    if (fs.existsSync(localDbPath) && !fs.existsSync(tmpDbPath)) {
      fs.copyFileSync(localDbPath, tmpDbPath);
      process.env.DATABASE_URL = "file:/tmp/dev.db";
    }
  } catch (e) {
    // Non-blocking: demoStore provides seamless fallback
  }
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
