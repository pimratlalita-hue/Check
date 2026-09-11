"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { WORKFLOW_P } from "../permissions";
import {
  submitPetitionSchema,
  processPetitionActionSchema,
  listPetitionsQuerySchema,
  trackPetitionQuerySchema,
} from "./schemas";
import {
  listPetitions,
  getPetitionById,
  getWorkflowStats,
  processPetitionAction,
  submitPublicPetition,
  trackPublicPetition,
  getPublicPetitionDetail,
  resolvePortalTenantId,
  getPublicWorkflowFormData,
  type PetitionDto,
  type PetitionListResult,
  type WorkflowStats,
  type WorkflowFormData,
} from "./services/workflow.service";
import {
  evaluateThesisPrerequisites,
  checkThesisPrerequisitesInputSchema,
  type ThesisPrerequisitesResult,
} from "./services/prerequisite.service";

export async function listPetitionsAction(input?: unknown): Promise<ActionResult<PetitionListResult>> {
  return runAction(async () => {
    const ctx = await requirePermission(WORKFLOW_P.workflowRead);
    const parsed = listPetitionsQuerySchema.parse(input ?? {}, { error: zodErrorMap(await getLocale()) });
    return listPetitions(ctx.tenantId, parsed);
  });
}

export async function getPetitionByIdAction(id: string): Promise<ActionResult<PetitionDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(WORKFLOW_P.workflowRead);
    return getPetitionById(ctx.tenantId, id);
  });
}

export async function getWorkflowStatsAction(): Promise<ActionResult<WorkflowStats>> {
  return runAction(async () => {
    const ctx = await requirePermission(WORKFLOW_P.workflowRead);
    return getWorkflowStats(ctx.tenantId);
  });
}

export async function processPetitionActionMutation(input: unknown): Promise<ActionResult<PetitionDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(WORKFLOW_P.workflowManage);
    const parsed = processPetitionActionSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await processPetitionAction(ctx.tenantId, parsed);
    revalidatePath("/workflow");
    revalidatePath("/portal/petitions");
    return result;
  });
}

export async function submitPublicPetitionAction(input: unknown): Promise<ActionResult<PetitionDto>> {
  return runAction(async () => {
    const tenantId = await resolvePortalTenantId();
    const parsed = submitPetitionSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await submitPublicPetition(tenantId, parsed);
    revalidatePath("/workflow");
    revalidatePath("/portal/petitions");
    return result;
  });
}

export async function trackPublicPetitionAction(input: unknown): Promise<ActionResult<PetitionDto[]>> {
  return runAction(async () => {
    const tenantId = await resolvePortalTenantId();
    const parsed = trackPetitionQuerySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    return trackPublicPetition(tenantId, parsed.query);
  });
}

export async function getPublicPetitionDetailAction(trackingNo: string): Promise<ActionResult<PetitionDto | null>> {
  return runAction(async () => {
    const tenantId = await resolvePortalTenantId();
    return getPublicPetitionDetail(tenantId, trackingNo);
  });
}

export async function getPublicWorkflowFormDataAction(): Promise<ActionResult<WorkflowFormData>> {
  return runAction(async () => {
    const tenantId = await resolvePortalTenantId();
    return getPublicWorkflowFormData(tenantId);
  });
}

export async function checkThesisPrerequisitesAction(
  input: unknown
): Promise<ActionResult<ThesisPrerequisitesResult>> {
  return runAction(async () => {
    const parsed = checkThesisPrerequisitesInputSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    return evaluateThesisPrerequisites(parsed);
  });
}

