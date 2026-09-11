import type { PermissionDef } from "@/shared/lib/permission-def";

export const BACKUP_P = {
  backupManage: "backup:manage",
  backupExport: "backup:export",
  backupImport: "backup:import",
  backupWipe: "backup:wipe",
} as const;

export const BACKUP_PERMISSIONS: readonly PermissionDef[] = [
  { code: BACKUP_P.backupManage, module: "backup", action: "manage", description: "เข้าถึงและจัดการระบบสำรองข้อมูลทั้งหมด" },
  { code: BACKUP_P.backupExport, module: "backup", action: "export", description: "ส่งออกและดาวน์โหลดไฟล์สำรองข้อมูล JSON" },
  { code: BACKUP_P.backupImport, module: "backup", action: "import", description: "นำเข้าและกู้คืนข้อมูลระบบจากไฟล์ JSON" },
  { code: BACKUP_P.backupWipe, module: "backup", action: "wipe", description: "ล้างข้อมูลทั้งระบบหรือรีเซ็ตข้อมูลมาตรฐาน (Factory Reset)" },
];
