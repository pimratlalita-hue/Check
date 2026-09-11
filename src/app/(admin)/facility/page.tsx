import { requirePermission, hasPermission } from "@/features/identity/server";
import { FACILITY_P, listRooms, listBookings, getFacilityStats } from "@/features/facility/server";
import { FacilityClient } from "./_components/facility-client";

export default async function FacilityAdminPage() {
  const ctx = await requirePermission(FACILITY_P.facilityRead);
  const [initialRooms, initialBookings, stats] = await Promise.all([
    listRooms(ctx.tenantId, { page: 1, perPage: 100 }),
    listBookings(ctx.tenantId, { page: 1, perPage: 100, tab: "all" }),
    getFacilityStats(ctx.tenantId),
  ]);

  return (
    <FacilityClient
      initialRooms={initialRooms}
      initialBookings={initialBookings}
      initialStats={stats}
      canManage={hasPermission(ctx, FACILITY_P.facilityManage)}
      currentUserName={ctx.userName}
    />
  );
}
