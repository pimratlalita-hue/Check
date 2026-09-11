"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import {
  createProgramSchema,
  updateProgramSchema,
  listProgramsQuerySchema,
  createProgramCourseSchema,
  updateProgramCourseSchema,
} from "./schemas";
import {
  listPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  listProgramCourses,
  createProgramCourse,
  updateProgramCourse,
  deleteProgramCourse,
  type ProgramDto,
  type ProgramListResult,
  type ProgramCourseDto,
} from "./services/curriculum.service";

export async function listProgramsAction(input?: unknown): Promise<ActionResult<ProgramListResult>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    const parsed = listProgramsQuerySchema.parse(input ?? {}, { error: zodErrorMap(await getLocale()) });
    return listPrograms(ctx.tenantId, parsed);
  });
}

export async function getProgramByIdAction(id: string): Promise<ActionResult<ProgramDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return getProgramById(ctx.tenantId, id);
  });
}

export async function createProgramAction(input: unknown): Promise<ActionResult<ProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createProgramSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createProgram(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function updateProgramAction(input: unknown): Promise<ActionResult<ProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateProgramSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateProgram(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function deleteProgramAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteProgram(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
  });
}

export async function listProgramCoursesAction(programId: string): Promise<ActionResult<ProgramCourseDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return listProgramCourses(ctx.tenantId, programId);
  });
}

export async function createProgramCourseAction(input: unknown): Promise<ActionResult<ProgramCourseDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createProgramCourseSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createProgramCourse(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function updateProgramCourseAction(input: unknown): Promise<ActionResult<ProgramCourseDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateProgramCourseSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateProgramCourse(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
    return result;
  });
}

export async function deleteProgramCourseAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteProgramCourse(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/portal/curriculum");
  });
}
