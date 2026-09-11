import type { PermissionDef } from "@/shared/lib/permission-def";

export const WORKFLOW_P = {
  workflowRead: "workflow:read",
  workflowManage: "workflow:manage",
} as const;

export const WORKFLOW_PERMISSIONS: readonly PermissionDef[] = [
  { code: WORKFLOW_P.workflowRead, module: "workflow", action: "read", description: "ดูรายการคำร้องและประวัติการพิจารณาในระบบหลังบ้าน" },
  { code: WORKFLOW_P.workflowManage, module: "workflow", action: "manage", description: "พิจารณาอนุมัติ ส่งกลับแก้ไข หรือปฏิเสธคำร้องวิชาการ" },
];
