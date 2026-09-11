"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { BACKUP_P } from "../permissions";
import {
  exportTenantBackup,
  getSystemDataStats,
  validateBackupPayload,
  importTenantBackup,
  performSystemWipe,
  type SystemDataStats,
} from "./services/backup.service";
import {
  importBackupInputSchema,
  systemWipeInputSchema,
  type GtmtsBackupPayload,
} from "./schemas";

export async function getBackupStatsAction(): Promise<ActionResult<SystemDataStats>> {
  return runAction(async () => {
    const ctx = await requirePermission(BACKUP_P.backupManage);
    return getSystemDataStats(ctx.tenantId);
  });
}

export async function exportBackupAction(): Promise<ActionResult<GtmtsBackupPayload>> {
  return runAction(async () => {
    const ctx = await requirePermission(BACKUP_P.backupExport);
    return exportTenantBackup(ctx.tenantId, ctx.userId);
  });
}

export async function validateBackupAction(
  jsonString: string
): Promise<ActionResult<GtmtsBackupPayload>> {
  return runAction(async () => {
    await requirePermission(BACKUP_P.backupImport);
    return validateBackupPayload(jsonString);
  });
}

export async function importBackupAction(
  input: unknown
): Promise<ActionResult<{ success: boolean; message: string; stats: Record<string, number> }>> {
  return runAction(async () => {
    const ctx = await requirePermission(BACKUP_P.backupImport);
    const locale = await getLocale();
    const parsed = importBackupInputSchema.parse(input, {
      error: zodErrorMap(locale),
    });

    const payload = validateBackupPayload(parsed.jsonString);
    const result = await importTenantBackup(
      ctx.tenantId,
      ctx.userId,
      payload,
      parsed.mode
    );

    revalidatePath("/backup");
    revalidatePath("/dashboard");
    revalidatePath("/news");
    revalidatePath("/staff");
    revalidatePath("/curriculum");
    revalidatePath("/workflow");
    revalidatePath("/facility");
    revalidatePath("/biometrics");

    return result;
  });
}

export async function systemWipeAction(
  input: unknown
): Promise<ActionResult<{ success: boolean; message: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(BACKUP_P.backupWipe);
    const locale = await getLocale();
    const parsed = systemWipeInputSchema.parse(input, {
      error: zodErrorMap(locale),
    });

    const result = await performSystemWipe(ctx.tenantId, ctx.userId, parsed.mode);

    revalidatePath("/backup");
    revalidatePath("/dashboard");
    revalidatePath("/news");
    revalidatePath("/staff");
    revalidatePath("/curriculum");
    revalidatePath("/workflow");
    revalidatePath("/facility");
    revalidatePath("/biometrics");

    return result;
  });
}
