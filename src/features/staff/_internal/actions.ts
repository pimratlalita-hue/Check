"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, requireSession, hasPermission } from "@/features/identity/server";
import { errors } from "@/shared/lib/errors";
import { STAFF_P } from "../permissions";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createStaffSchema,
  updateStaffSchema,
  listStaffQuerySchema,
} from "./schemas";
import {
  listStaffProfiles,
  getStaffProfileById,
  createStaffProfile,
  updateStaffProfile,
  deleteStaffProfile,
  toggleStaffActive,
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type StaffProfileDto,
  type StaffListResult,
  type DepartmentDto,
} from "./services/staff.service";

export async function listStaffAction(input?: unknown): Promise<ActionResult<StaffListResult>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffRead);
    const parsed = listStaffQuerySchema.parse(input ?? {}, { error: zodErrorMap(await getLocale()) });
    return listStaffProfiles(ctx.tenantId, parsed);
  });
}

export async function getStaffByIdAction(id: string): Promise<ActionResult<StaffProfileDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffRead);
    return getStaffProfileById(ctx.tenantId, id);
  });
}

export async function createStaffAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = createStaffSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createStaffProfile(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
    return result;
  });
}

export async function updateStaffAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = updateStaffSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateStaffProfile(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
    return result;
  });
}

export async function deleteStaffAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    await deleteStaffProfile(ctx.tenantId, id);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
  });
}

export async function toggleStaffActiveAction(id: string): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const result = await toggleStaffActive(ctx.tenantId, id);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
    return result;
  });
}

export async function listDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requireSession();
    if (!hasPermission(ctx, STAFF_P.staffRead) && !hasPermission(ctx, "curriculum:read")) {
      throw errors.forbidden("forbidden:staff:read or curriculum:read");
    }
    return listDepartments(ctx.tenantId);
  });
}

export async function createDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requireSession();
    if (!hasPermission(ctx, STAFF_P.staffManage) && !hasPermission(ctx, "curriculum:manage")) {
      throw errors.forbidden("forbidden:staff:manage or curriculum:manage");
    }
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDepartment(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function updateDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requireSession();
    if (!hasPermission(ctx, STAFF_P.staffManage) && !hasPermission(ctx, "curriculum:manage")) {
      throw errors.forbidden("forbidden:staff:manage or curriculum:manage");
    }
    const parsed = updateDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateDepartment(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requireSession();
    if (!hasPermission(ctx, STAFF_P.staffManage) && !hasPermission(ctx, "curriculum:manage")) {
      throw errors.forbidden("forbidden:staff:manage or curriculum:manage");
    }
    await deleteDepartment(ctx.tenantId, id);
    revalidatePath("/staff");
    revalidatePath("/portal/staff");
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
  });
}
