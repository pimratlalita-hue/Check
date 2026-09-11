import { requirePermission, hasPermission } from "@/features/identity/server";
import { STAFF_P, listStaffProfiles, listDepartments } from "@/features/staff/server";
import { StaffClient } from "./_components/staff-client";

export default async function StaffAdminPage() {
  const ctx = await requirePermission(STAFF_P.staffRead);
  const [initialData, initialDepartments] = await Promise.all([
    listStaffProfiles(ctx.tenantId, { page: 1, perPage: 25 }),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <StaffClient
      initialData={initialData}
      initialDepartments={initialDepartments}
      canManage={hasPermission(ctx, STAFF_P.staffManage)}
    />
  );
}
