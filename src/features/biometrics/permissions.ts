import type { PermissionDef } from "@/shared/lib/permission-def";

export const BIOMETRICS_P = {
  read: "biometrics:read",
  verify: "biometrics:verify",
} as const;

export const BIOMETRICS_PERMISSIONS: readonly PermissionDef[] = [
  { code: BIOMETRICS_P.read, module: "biometrics", action: "read", description: "ดูข้อมูลการยืนยันตัวตนและประวัติเข้าสอบ" },
  { code: BIOMETRICS_P.verify, module: "biometrics", action: "verify", description: "สแกนและบันทึกยืนยันตัวตนเข้าห้องสอบ" },
];
