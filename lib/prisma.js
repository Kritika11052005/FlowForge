// Import the PrismaClient from the generated Prisma setup
import { PrismaClient } from "@/lib/generated/prisma";

// Create a single instance of PrismaClient.
// Reuse the existing instance if it already exists on globalThis (helps during development).
export const db = globalThis.prisma || new PrismaClient();

// If not in production (i.e., in development), store the Prisma instance globally.
// This avoids creating multiple instances on hot reloads, which can cause database connection issues.
if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = db;
}

// Explanation:
// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues like "too many connections".
