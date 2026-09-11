import { z } from "zod";

export const staffTypeEnum = z.enum(["ACADEMIC", "SUPPORT", "EXECUTIVE"]);
export const academicRankEnum = z.enum([
  "PROFESSOR",
  "ASSOCIATE_PROFESSOR",
  "ASSISTANT_PROFESSOR",
  "LECTURER",
  "NONE",
]);

export const createDepartmentSchema = z.object({
  code: z.string().min(1, "code_required").max(50),
  nameTh: z.string().min(1, "name_required").max(255),
  nameEn: z.string().min(1, "name_required").max(255),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  id: z.string().uuid(),
});

export const createStaffSchema = z.object({
  departmentId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
  staffType: staffTypeEnum.default("ACADEMIC"),
  academicRank: academicRankEnum.default("NONE"),
  prefixTh: z.string().max(50).optional().nullable(),
  prefixEn: z.string().max(50).optional().nullable(),
  firstNameTh: z.string().min(1, "first_name_required").max(100),
  lastNameTh: z.string().min(1, "last_name_required").max(100),
  firstNameEn: z.string().min(1, "first_name_required").max(100),
  lastNameEn: z.string().min(1, "last_name_required").max(100),
  positionTh: z.string().min(1, "position_required").max(255),
  positionEn: z.string().min(1, "position_required").max(255),
  isExecutive: z.boolean().default(false),
  executiveRole: z.string().max(255).optional().nullable(),
  executiveOrder: z.coerce.number().int().optional().nullable(),
  email: z.string().email("email_invalid").max(255),
  phone: z.string().max(50).optional().nullable(),
  officeRoom: z.string().max(100).optional().nullable(),
  officeHours: z.string().max(255).optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable(),
  education: z.array(z.string()).optional().nullable(),
  expertise: z.array(z.string()).optional().nullable(),
  researchInterests: z.string().optional().nullable(),
  googleScholarUrl: z.string().max(500).optional().nullable(),
  scopusUrl: z.string().max(500).optional().nullable(),
  orcidId: z.string().max(50).optional().nullable(),
  websiteUrl: z.string().max(500).optional().nullable(),
  bioTh: z.string().optional().nullable(),
  bioEn: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateStaffSchema = createStaffSchema.partial().extend({
  id: z.string().uuid(),
});

export const listStaffQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(50),
  departmentId: z.string().optional(),
  staffType: staffTypeEnum.optional(),
  academicRank: academicRankEnum.optional(),
  isExecutive: z.boolean().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type ListStaffQuery = z.infer<typeof listStaffQuerySchema>;
export type StaffType = z.infer<typeof staffTypeEnum>;
export type AcademicRank = z.infer<typeof academicRankEnum>;
