import type { PermissionDef } from "@/shared/lib/permission-def";

export const STAFF_P = {
  staffRead: "staff:read",
  staffManage: "staff:manage",
} as const;

export const STAFF_PERMISSIONS: readonly PermissionDef[] = [
  { code: STAFF_P.staffRead, module: "staff", action: "read", description: "ดูข้อมูลบุคลากรและทำเนียบคณาจารย์ในระบบหลังบ้าน" },
  { code: STAFF_P.staffManage, module: "staff", action: "manage", description: "สร้าง แก้ไข จัดลำดับ และจัดการข้อมูลบุคลากร" },
];
