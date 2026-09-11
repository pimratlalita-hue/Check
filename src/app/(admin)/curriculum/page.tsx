import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P, listPrograms } from "@/features/curriculum/server";
import { listDepartments } from "@/features/staff/server";
import { CurriculumClient } from "./_components/curriculum-client";

export default async function CurriculumAdminPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [initialData, departments] = await Promise.all([
    listPrograms(ctx.tenantId, { page: 1, perPage: 25 }),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <CurriculumClient
      initialData={initialData}
      departments={departments}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
    />
  );
}
