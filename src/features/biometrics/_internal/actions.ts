"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, getSessionContext } from "@/features/identity/server";
import { BIOMETRICS_P } from "../permissions";
import {
  recordAttendanceInputSchema,
  listAttendanceQuerySchema,
  type RecordAttendanceInput,
  type ListAttendanceQuery,
  type AttendanceStatusType,
} from "./schemas";
import {
  recordAttendance,
  listAttendances,
  getDailyAttendanceStats,
  updateAttendanceStatus,
  resolvePortalTenantId,
} from "./services/biometrics.service";

export async function recordCandidateAttendanceAction(
  input: RecordAttendanceInput
): Promise<ActionResult<any>> {
  const locale = await getLocale();
  return runAction(async () => {
    const data = recordAttendanceInputSchema.parse(input, { error: zodErrorMap(locale) });
    const session = await getSessionContext();
    const tenantId = session?.tenantId ?? (await resolvePortalTenantId());
    const verifiedBy = session?.userName ?? "Self Service Portal";

    const result = await recordAttendance(tenantId, data, verifiedBy);
    revalidatePath("/biometrics");
    revalidatePath("/portal/attendance");
    return result;
  });
}

export async function listAttendancesAction(
  query: ListAttendanceQuery = { page: 1, pageSize: 20 }
): Promise<ActionResult<any>> {
  const locale = await getLocale();
  return runAction(async () => {
    const session = await requirePermission(BIOMETRICS_P.read);
    const data = listAttendanceQuerySchema.parse(query, { error: zodErrorMap(locale) });
    return listAttendances(session.tenantId, data);
  });
}

export async function getDailyAttendanceStatsAction(): Promise<ActionResult<any>> {
  return runAction(async () => {
    const session = await requirePermission(BIOMETRICS_P.read);
    return getDailyAttendanceStats(session.tenantId);
  });
}

export async function updateAttendanceStatusAction(input: {
  id: string;
  status: AttendanceStatusType;
  notes?: string;
}): Promise<ActionResult<any>> {
  return runAction(async () => {
    const session = await requirePermission(BIOMETRICS_P.verify);
    const result = await updateAttendanceStatus(
      session.tenantId,
      input.id,
      input.status,
      input.notes,
      session.userName
    );
    revalidatePath("/biometrics");
    return result;
  });
}
