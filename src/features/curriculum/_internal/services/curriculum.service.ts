import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import {
  Prisma,
  type Program,
  type ProgramCourse,
  type Department,
} from "@/generated/prisma";
import type {
  CreateProgramInput,
  UpdateProgramInput,
  ListProgramsQuery,
  CreateProgramCourseInput,
  UpdateProgramCourseInput,
  DegreeLevel,
  ProgramType,
  ProgramStatus,
  CourseCategory,
  LearningOutcome,
} from "../schemas";

export interface ProgramCourseDto {
  id: string;
  programId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  credits: number;
  creditHours: string | null;
  category: CourseCategory;
  semester: number | null;
  year: number | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  prerequisite: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramDto {
  id: string;
  tenantId: string;
  departmentId: string | null;
  departmentCode?: string | null;
  departmentNameTh?: string | null;
  departmentNameEn?: string | null;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  degreeShortTh: string;
  degreeShortEn: string;
  level: DegreeLevel;
  type: ProgramType;
  status: ProgramStatus;
  slug: string;
  totalCredits: number;
  studyDuration: string;
  tuitionFee: string | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  philosophyTh: string | null;
  philosophyEn: string | null;
  careerPaths: string[] | null;
  learningOutcomes: LearningOutcome[] | null;
  handbookUrl: string | null;
  imageUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  courseCount?: number;
  courses?: ProgramCourseDto[];
}

export interface ProgramListResult {
  items: ProgramDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

type ProgramWithRelations = Program & {
  department?: Department | null;
  courses?: ProgramCourse[];
  _count?: { courses: number };
};

function parseJsonArray(val: unknown): string[] | null {
  if (!val) return null;
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return [val];
    }
  }
  return null;
}

function parseLearningOutcomes(val: unknown): LearningOutcome[] | null {
  if (!val) return null;
  if (Array.isArray(val)) {
    return val as LearningOutcome[];
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as LearningOutcome[];
    } catch {
      return null;
    }
  }
  return null;
}

function mapCourseToDto(course: ProgramCourse): ProgramCourseDto {
  return {
    id: course.id,
    programId: course.programId,
    code: course.code,
    nameTh: course.nameTh,
    nameEn: course.nameEn,
    credits: course.credits,
    creditHours: course.creditHours,
    category: course.category as CourseCategory,
    semester: course.semester,
    year: course.year,
    descriptionTh: course.descriptionTh,
    descriptionEn: course.descriptionEn,
    prerequisite: course.prerequisite,
    displayOrder: course.displayOrder,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

function mapProgramToDto(program: ProgramWithRelations): ProgramDto {
  return {
    id: program.id,
    tenantId: program.tenantId,
    departmentId: program.departmentId,
    departmentCode: program.department?.code ?? null,
    departmentNameTh: program.department?.nameTh ?? null,
    departmentNameEn: program.department?.nameEn ?? null,
    code: program.code,
    nameTh: program.nameTh,
    nameEn: program.nameEn,
    degreeTh: program.degreeTh,
    degreeEn: program.degreeEn,
    degreeShortTh: program.degreeShortTh,
    degreeShortEn: program.degreeShortEn,
    level: program.level as DegreeLevel,
    type: program.type as ProgramType,
    status: program.status as ProgramStatus,
    slug: program.slug,
    totalCredits: program.totalCredits,
    studyDuration: program.studyDuration,
    tuitionFee: program.tuitionFee,
    descriptionTh: program.descriptionTh,
    descriptionEn: program.descriptionEn,
    philosophyTh: program.philosophyTh,
    philosophyEn: program.philosophyEn,
    careerPaths: parseJsonArray(program.careerPaths),
    learningOutcomes: parseLearningOutcomes(program.learningOutcomes),
    handbookUrl: program.handbookUrl,
    imageUrl: program.imageUrl,
    displayOrder: program.displayOrder,
    createdAt: program.createdAt.toISOString(),
    updatedAt: program.updatedAt.toISOString(),
    courseCount: program._count?.courses ?? (program.courses ? program.courses.length : 0),
    courses: program.courses ? program.courses.map(mapCourseToDto) : undefined,
  };
}

export async function listPrograms(
  tenantId: string,
  query: Partial<ListProgramsQuery> = {},
  db: Db = prisma
): Promise<ProgramListResult> {
  const where: Prisma.ProgramWhereInput = {
    tenantId,
    ...(query.level ? { level: query.level } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.departmentId ? { departmentId: query.departmentId } : {}),
    ...(query.search
      ? {
          OR: [
            { code: { contains: query.search } },
            { nameTh: { contains: query.search } },
            { nameEn: { contains: query.search } },
            { degreeTh: { contains: query.search } },
            { degreeEn: { contains: query.search } },
            { degreeShortTh: { contains: query.search } },
            { degreeShortEn: { contains: query.search } },
            { slug: { contains: query.search } },
          ],
        }
      : {}),
  };

  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(100, Math.max(1, query.perPage ?? 50));
  const skip = (page - 1) * perPage;
  const take = perPage;

  const [total, items] = await Promise.all([
    db.program.count({ where }),
    db.program.findMany({
      where,
      include: {
        department: true,
        _count: { select: { courses: true } },
      },
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
      skip,
      take,
    }),
  ]);

  return {
    items: items.map(mapProgramToDto),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProgramById(
  tenantId: string,
  id: string,
  db: Db = prisma
): Promise<ProgramDto | null> {
  const program = await db.program.findFirst({
    where: { id, tenantId },
    include: {
      department: true,
      courses: {
        orderBy: [{ category: "asc" }, { year: "asc" }, { semester: "asc" }, { displayOrder: "asc" }],
      },
    },
  });

  return program ? mapProgramToDto(program) : null;
}

export async function getProgramBySlug(
  tenantId: string,
  slug: string,
  db: Db = prisma
): Promise<ProgramDto | null> {
  const program = await db.program.findFirst({
    where: { slug, tenantId },
    include: {
      department: true,
      courses: {
        orderBy: [{ category: "asc" }, { year: "asc" }, { semester: "asc" }, { displayOrder: "asc" }],
      },
    },
  });

  return program ? mapProgramToDto(program) : null;
}

export async function createProgram(
  tenantId: string,
  input: CreateProgramInput,
  db: Db = prisma
): Promise<ProgramDto> {
  const existingCode = await db.program.findFirst({
    where: { tenantId, code: input.code },
  });
  if (existingCode) {
    throw errors.conflict("รหัสหลักสูตรนี้มีอยู่ในระบบแล้ว");
  }

  const existingSlug = await db.program.findFirst({
    where: { tenantId, slug: input.slug },
  });
  if (existingSlug) {
    throw errors.conflict("URL Slug นี้มีอยู่ในระบบแล้ว");
  }

  const created = await db.program.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      degreeShortTh: input.degreeShortTh,
      degreeShortEn: input.degreeShortEn,
      level: input.level ?? "BACHELOR",
      type: input.type ?? "THAI",
      status: input.status ?? "ACTIVE",
      slug: input.slug,
      totalCredits: input.totalCredits,
      studyDuration: input.studyDuration,
      tuitionFee: input.tuitionFee,
      descriptionTh: input.descriptionTh,
      descriptionEn: input.descriptionEn,
      philosophyTh: input.philosophyTh,
      philosophyEn: input.philosophyEn,
      careerPaths: input.careerPaths ? (input.careerPaths as Prisma.InputJsonValue) : Prisma.JsonNull,
      learningOutcomes: input.learningOutcomes
        ? (input.learningOutcomes as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      handbookUrl: input.handbookUrl,
      imageUrl: input.imageUrl,
      departmentId: input.departmentId,
      displayOrder: input.displayOrder ?? 0,
    },
    include: {
      department: true,
      _count: { select: { courses: true } },
    },
  });

  return mapProgramToDto(created);
}

export async function updateProgram(
  tenantId: string,
  input: UpdateProgramInput,
  db: Db = prisma
): Promise<ProgramDto> {
  const existing = await db.program.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("ไม่พบข้อมูลหลักสูตร");
  }

  if (input.code && input.code !== existing.code) {
    const duplicate = await db.program.findFirst({
      where: { tenantId, code: input.code, id: { not: input.id } },
    });
    if (duplicate) {
      throw errors.conflict("รหัสหลักสูตรนี้มีอยู่ในระบบแล้ว");
    }
  }

  if (input.slug && input.slug !== existing.slug) {
    const duplicateSlug = await db.program.findFirst({
      where: { tenantId, slug: input.slug, id: { not: input.id } },
    });
    if (duplicateSlug) {
      throw errors.conflict("URL Slug นี้มีอยู่ในระบบแล้ว");
    }
  }

  const updated = await db.program.update({
    where: { id: input.id },
    data: {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.nameTh !== undefined ? { nameTh: input.nameTh } : {}),
      ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
      ...(input.degreeTh !== undefined ? { degreeTh: input.degreeTh } : {}),
      ...(input.degreeEn !== undefined ? { degreeEn: input.degreeEn } : {}),
      ...(input.degreeShortTh !== undefined ? { degreeShortTh: input.degreeShortTh } : {}),
      ...(input.degreeShortEn !== undefined ? { degreeShortEn: input.degreeShortEn } : {}),
      ...(input.level !== undefined ? { level: input.level } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.totalCredits !== undefined ? { totalCredits: input.totalCredits } : {}),
      ...(input.studyDuration !== undefined ? { studyDuration: input.studyDuration } : {}),
      ...(input.tuitionFee !== undefined ? { tuitionFee: input.tuitionFee } : {}),
      ...(input.descriptionTh !== undefined ? { descriptionTh: input.descriptionTh } : {}),
      ...(input.descriptionEn !== undefined ? { descriptionEn: input.descriptionEn } : {}),
      ...(input.philosophyTh !== undefined ? { philosophyTh: input.philosophyTh } : {}),
      ...(input.philosophyEn !== undefined ? { philosophyEn: input.philosophyEn } : {}),
      ...(input.careerPaths !== undefined
        ? { careerPaths: input.careerPaths ? (input.careerPaths as Prisma.InputJsonValue) : Prisma.JsonNull }
        : {}),
      ...(input.learningOutcomes !== undefined
        ? {
            learningOutcomes: input.learningOutcomes
              ? (input.learningOutcomes as unknown as Prisma.InputJsonValue)
              : Prisma.JsonNull,
          }
        : {}),
      ...(input.handbookUrl !== undefined ? { handbookUrl: input.handbookUrl } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.departmentId !== undefined ? { departmentId: input.departmentId } : {}),
      ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
    },
    include: {
      department: true,
      _count: { select: { courses: true } },
    },
  });

  return mapProgramToDto(updated);
}

export async function deleteProgram(
  tenantId: string,
  id: string,
  db: Db = prisma
): Promise<void> {
  const existing = await db.program.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("ไม่พบข้อมูลหลักสูตร");
  }

  await db.program.delete({ where: { id } });
}

// ---------------- PROGRAM COURSES ----------------

export async function listProgramCourses(
  tenantId: string,
  programId: string,
  db: Db = prisma
): Promise<ProgramCourseDto[]> {
  const program = await db.program.findFirst({
    where: { id: programId, tenantId },
  });
  if (!program) {
    throw errors.not_found("ไม่พบข้อมูลหลักสูตร");
  }

  const courses = await db.programCourse.findMany({
    where: { programId },
    orderBy: [
      { category: "asc" },
      { year: "asc" },
      { semester: "asc" },
      { displayOrder: "asc" },
      { code: "asc" },
    ],
  });

  return courses.map(mapCourseToDto);
}

export async function createProgramCourse(
  tenantId: string,
  input: CreateProgramCourseInput,
  db: Db = prisma
): Promise<ProgramCourseDto> {
  const program = await db.program.findFirst({
    where: { id: input.programId, tenantId },
  });
  if (!program) {
    throw errors.not_found("ไม่พบข้อมูลหลักสูตร");
  }

  const created = await db.programCourse.create({
    data: {
      programId: input.programId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      credits: input.credits ?? 3,
      creditHours: input.creditHours,
      category: input.category ?? "CORE_COURSE",
      semester: input.semester,
      year: input.year,
      descriptionTh: input.descriptionTh,
      descriptionEn: input.descriptionEn,
      prerequisite: input.prerequisite,
      displayOrder: input.displayOrder ?? 0,
    },
  });

  return mapCourseToDto(created);
}

export async function updateProgramCourse(
  tenantId: string,
  input: UpdateProgramCourseInput,
  db: Db = prisma
): Promise<ProgramCourseDto> {
  const existing = await db.programCourse.findFirst({
    where: { id: input.id, program: { tenantId } },
  });
  if (!existing) {
    throw errors.not_found("ไม่พบข้อมูลรายวิชา");
  }

  const updated = await db.programCourse.update({
    where: { id: input.id },
    data: {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.nameTh !== undefined ? { nameTh: input.nameTh } : {}),
      ...(input.nameEn !== undefined ? { nameEn: input.nameEn } : {}),
      ...(input.credits !== undefined ? { credits: input.credits } : {}),
      ...(input.creditHours !== undefined ? { creditHours: input.creditHours } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.semester !== undefined ? { semester: input.semester } : {}),
      ...(input.year !== undefined ? { year: input.year } : {}),
      ...(input.descriptionTh !== undefined ? { descriptionTh: input.descriptionTh } : {}),
      ...(input.descriptionEn !== undefined ? { descriptionEn: input.descriptionEn } : {}),
      ...(input.prerequisite !== undefined ? { prerequisite: input.prerequisite } : {}),
      ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
    },
  });

  return mapCourseToDto(updated);
}

export async function deleteProgramCourse(
  tenantId: string,
  id: string,
  db: Db = prisma
): Promise<void> {
  const existing = await db.programCourse.findFirst({
    where: { id, program: { tenantId } },
  });
  if (!existing) {
    throw errors.not_found("ไม่พบข้อมูลรายวิชา");
  }

  await db.programCourse.delete({ where: { id } });
}

export async function resolvePortalTenantId(db: Db = prisma): Promise<string> {
  const tenant =
    (await db.tenant.findUnique({ where: { code: "DEMO" }, select: { id: true } })) ??
    (await db.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true } }));
  if (!tenant) throw errors.not_found();
  return tenant.id;
}

// ---------------- PUBLIC PORTAL QUERIES ----------------

export async function listPublicPrograms(
  tenantId: string,
  level?: DegreeLevel,
  db: Db = prisma
): Promise<ProgramDto[]> {
  const programs = await db.program.findMany({
    where: {
      tenantId,
      status: { in: ["ACTIVE", "REVISED"] },
      ...(level ? { level } : {}),
    },
    include: {
      department: true,
      _count: { select: { courses: true } },
    },
    orderBy: [{ level: "asc" }, { displayOrder: "asc" }, { code: "asc" }],
  });

  return programs.map(mapProgramToDto);
}

export async function getPublicProgramDetail(
  tenantId: string,
  slug: string,
  db: Db = prisma
): Promise<ProgramDto | null> {
  const program = await db.program.findFirst({
    where: {
      tenantId,
      slug,
      status: { in: ["ACTIVE", "REVISED"] },
    },
    include: {
      department: true,
      courses: {
        orderBy: [
          { category: "asc" },
          { year: "asc" },
          { semester: "asc" },
          { displayOrder: "asc" },
          { code: "asc" },
        ],
      },
    },
  });

  return program ? mapProgramToDto(program) : null;
}
