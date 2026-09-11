import type { PermissionDef } from "@/shared/lib/permission-def";

export const NEWS_P = {
  newsRead: "news:read",
  newsManage: "news:manage",
  newsPublish: "news:publish",
} as const;

export const NEWS_PERMISSIONS: readonly PermissionDef[] = [
  { code: NEWS_P.newsRead, module: "news", action: "read", description: "ดูรายการข่าวสารในระบบหลังบ้าน" },
  { code: NEWS_P.newsManage, module: "news", action: "manage", description: "สร้างและแก้ไขเนื้อหาข่าวสาร" },
  { code: NEWS_P.newsPublish, module: "news", action: "publish", description: "อนุมัติ เผยแพร่ ปักหมุด และลบข่าวสาร" },
];
