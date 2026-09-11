import type { PermissionDef } from "@/shared/lib/permission-def";

export const FACILITY_P = {
  facilityRead: "facility:read",
  facilityManage: "facility:manage",
} as const;

export const FACILITY_PERMISSIONS: readonly PermissionDef[] = [
  { code: FACILITY_P.facilityRead, module: "facility", action: "read", description: "ดูข้อมูลห้องและตารางการใช้ห้องในระบบหลังบ้าน" },
  { code: FACILITY_P.facilityManage, module: "facility", action: "manage", description: "จัดการข้อมูลห้อง อนุมัติหรือยกเลิกการจองห้อง" },
];
