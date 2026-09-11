import { resolvePortalTenantId, getPublicWorkflowFormData } from "@/features/workflow/server";
import { PetitionsPortalView } from "./_components/petitions-portal-view";

export default async function PublicPetitionsPage() {
  const tenantId = await resolvePortalTenantId();
  const formData = await getPublicWorkflowFormData(tenantId);

  return (
    <PetitionsPortalView
      programs={formData.programs}
      advisors={formData.advisors}
    />
  );
}
