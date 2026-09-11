import React from "react";
import { requirePermission } from "@/features/identity/server";
import { BIOMETRICS_P } from "@/features/biometrics";
import {
  getDailyAttendanceStats,
  listAttendances,
} from "@/features/biometrics/server";
import { BiometricsClient } from "./_components/biometrics-client";

export default async function BiometricsPage() {
  const session = await requirePermission(BIOMETRICS_P.read);

  const [stats, initialAttendances] = await Promise.all([
    getDailyAttendanceStats(session.tenantId),
    listAttendances(session.tenantId, { page: 1, pageSize: 20 }),
  ]);

  return (
    <BiometricsClient
      initialStats={stats}
      initialAttendances={initialAttendances}
      canVerify={session.permissions.includes(BIOMETRICS_P.verify) || session.isSuperAdmin}
    />
  );
}
