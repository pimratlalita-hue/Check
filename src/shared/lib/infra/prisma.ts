import { PrismaClient, type Prisma } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  return new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** ใช้เป็นชนิดของพารามิเตอร์ db ใน service เพื่อรับทั้ง client และ transaction */
export type Db = PrismaClient | Prisma.TransactionClient;
