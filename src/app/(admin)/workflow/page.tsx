import { requirePermission, hasPermission } from "@/features/identity/server";
import { WORKFLOW_P, listPetitions, getWorkflowStats } from "@/features/workflow/server";
import { WorkflowClient } from "./_components/workflow-client";

export default async function WorkflowAdminPage() {
  const ctx = await requirePermission(WORKFLOW_P.workflowRead);
  const [initialData, stats] = await Promise.all([
    listPetitions(ctx.tenantId, { page: 1, perPage: 25, tab: "all" }),
    getWorkflowStats(ctx.tenantId),
  ]);

  return (
    <WorkflowClient
      initialData={initialData}
      initialStats={stats}
      canManage={hasPermission(ctx, WORKFLOW_P.workflowManage)}
      currentUserName={ctx.userName}
    />
  );
}
