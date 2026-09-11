import { resolvePortalTenantId, listPublicRooms } from "@/features/facility/server";
import { FacilityPortalView } from "./_components/facility-portal-view";

export default async function PublicFacilityPage() {
  const tenantId = await resolvePortalTenantId();
  const rooms = await listPublicRooms(tenantId);

  return <FacilityPortalView initialRooms={rooms} />;
}
