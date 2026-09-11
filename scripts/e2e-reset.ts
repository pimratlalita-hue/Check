import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { requireDatabaseUrl } from "../prisma/lib/require-database-url";

requireDatabaseUrl();
const prisma = new PrismaClient();

// tsx ทรานส์ฟอร์มสคริปต์นี้เป็น CJS (ไม่มี "type": "module" ใน package.json) — top-level await ใช้ไม่ได้
// จึงห่อด้วย main() เหมือน prisma/seed.ts และ prisma/bootstrap.ts แทนที่จะ await ตรงระดับบนสุด
async function main() {
  await prisma.loginThrottle.deleteMany();
  await prisma.authToken.deleteMany();
  console.log("[e2e-reset] ล้าง throttle/token แล้ว — รัน npm run db:seed ต่อ");
}

main().finally(() => prisma.$disconnect());
