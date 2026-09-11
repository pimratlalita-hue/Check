import { z } from "zod";

export const degreeLevelEnum = z.enum(["BACHELOR", "MASTER", "DOCTORAL", "CERTIFICATE"]);
export const programTypeEnum = z.enum(["THAI", "INTERNATIONAL", "BILINGUAL"]);
export const programStatusEnum = z.enum(["DRAFT", "ACTIVE", "REVISED", "ARCHIVED"]);
export const courseCategoryEnum = z.enum([
  "GENERAL_EDUCATION",
  "CORE_COURSE",
  "MAJOR_ELECTIVE",
  "FREE_ELECTIVE",
  "THESIS",
]);

export const learningOutcomeSchema = z.object({
  code: z.string(),
  descTh: z.string(),
  descEn: z.string().optional().nullable(),
});

export const createProgramSchema = z.object({
  code: z.string().min(1, "code_required").max(50),
  nameTh: z.string().min(1, "name_required").max(255),
  nameEn: z.string().min(1, "name_required").max(255),
  degreeTh: z.string().min(1, "degree_required").max(255),
  degreeEn: z.string().min(1, "degree_required").max(255),
  degreeShortTh: z.string().min(1, "degree_short_required").max(100),
  degreeShortEn: z.string().min(1, "degree_short_required").max(100),
  level: degreeLevelEnum.default("BACHELOR"),
  type: programTypeEnum.default("THAI"),
  status: programStatusEnum.default("ACTIVE"),
  slug: z.string().min(1, "slug_required").max(100).regex(/^[a-z0-9-]+$/, "slug_invalid"),
  totalCredits: z.coerce.number().int().min(1, "credits_required"),
  studyDuration: z.string().min(1, "duration_required").max(100),
  tuitionFee: z.string().max(255).optional().nullable(),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  philosophyTh: z.string().optional().nullable(),
  philosophyEn: z.string().optional().nullable(),
  careerPaths: z.array(z.string()).optional().nullable(),
  learningOutcomes: z.array(learningOutcomeSchema).optional().nullable(),
  handbookUrl: z.string().max(500).optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  displayOrder: z.coerce.number().int().optional(),
});

export const updateProgramSchema = createProgramSchema.partial().extend({
  id: z.string().uuid(),
});

export const listProgramsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(50),
  level: degreeLevelEnum.optional(),
  type: programTypeEnum.optional(),
  status: programStatusEnum.optional(),
  departmentId: z.string().optional(),
  search: z.string().optional(),
});

export const createProgramCourseSchema = z.object({
  programId: z.string().uuid(),
  code: z.string().min(1, "code_required").max(20),
  nameTh: z.string().min(1, "name_required").max(255),
  nameEn: z.string().min(1, "name_required").max(255),
  credits: z.coerce.number().int().min(0).default(3),
  creditHours: z.string().max(50).optional().nullable(),
  category: courseCategoryEnum.default("CORE_COURSE"),
  semester: z.coerce.number().int().min(1).max(3).optional().nullable(),
  year: z.coerce.number().int().min(1).max(6).optional().nullable(),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  prerequisite: z.string().max(255).optional().nullable(),
  displayOrder: z.coerce.number().int().optional(),
});

export const updateProgramCourseSchema = createProgramCourseSchema.partial().extend({
  id: z.string().uuid(),
});

export type DegreeLevel = z.infer<typeof degreeLevelEnum>;
export type ProgramType = z.infer<typeof programTypeEnum>;
export type ProgramStatus = z.infer<typeof programStatusEnum>;
export type CourseCategory = z.infer<typeof courseCategoryEnum>;
export type LearningOutcome = z.infer<typeof learningOutcomeSchema>;

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type ListProgramsQuery = z.infer<typeof listProgramsQuerySchema>;

export type CreateProgramCourseInput = z.infer<typeof createProgramCourseSchema>;
export type UpdateProgramCourseInput = z.infer<typeof updateProgramCourseSchema>;
