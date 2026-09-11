import type { PermissionDef } from "@/shared/lib/permission-def";

export const AI_P = {
  aiUse: "ai:use",
} as const;

export const AI_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: AI_P.aiUse,
    module: "ai",
    action: "use",
    description: "ใช้งานระบบผู้ช่วยอัจฉริยะ Gemini AI สำหรับงานวิชาการและวิทยานิพนธ์",
  },
];
