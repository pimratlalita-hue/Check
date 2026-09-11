import { z } from "zod";

export const petitionTypeEnum = z.enum([
  "THESIS_TOPIC_APPROVAL",
  "DEFENSE_EXAM_REQUEST",
  "LEAVE_OF_ABSENCE",
  "EXTENSION_OF_STUDY",
  "GENERAL_PETITION",
]);

export const petitionStatusEnum = z.enum([
  "SUBMITTED",
  "ADVISOR_APPROVED",
  "CHAIR_APPROVED",
  "COMPLETED",
  "RETURNED",
  "REJECTED",
  "CANCELLED",
]);

export const approvalActionEnum = z.enum([
  "SUBMIT",
  "APPROVE",
  "RETURN",
  "REJECT",
  "CANCEL",
]);

export type PetitionType = z.infer<typeof petitionTypeEnum>;
export type PetitionStatus = z.infer<typeof petitionStatusEnum>;
export type ApprovalAction = z.infer<typeof approvalActionEnum>;

export const submitPetitionSchema = z.object({
  type: petitionTypeEnum,
  title: z.string().trim().min(3, "title_too_short").max(255, "title_too_long"),
  description: z.string().trim().min(5, "description_too_short"),
  studentId: z.string().trim().min(3, "student_id_required").max(50),
  studentName: z.string().trim().min(2, "student_name_required").max(255),
  studentEmail: z.string().trim().email("invalid_email"),
  studentPhone: z.string().trim().max(50).optional().nullable(),
  programId: z.string().trim().optional().nullable(),
  advisorId: z.string().trim().optional().nullable(),
  thesisTitleTh: z.string().trim().max(500).optional().nullable(),
  thesisTitleEn: z.string().trim().max(500).optional().nullable(),
  attachmentUrl: z.string().trim().max(500).optional().nullable(),
});

export type SubmitPetitionInput = z.infer<typeof submitPetitionSchema>;

export const processPetitionActionSchema = z.object({
  petitionId: z.string().min(1, "petition_id_required"),
  action: z.enum(["APPROVE", "RETURN", "REJECT"]),
  actorName: z.string().trim().min(1, "actor_name_required").max(255),
  actorRole: z.string().trim().min(1, "actor_role_required").max(100),
  comment: z.string().trim().optional().nullable(),
});

export type ProcessPetitionActionInput = z.infer<typeof processPetitionActionSchema>;

export const listPetitionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(50),
  status: petitionStatusEnum.optional(),
  type: petitionTypeEnum.optional(),
  search: z.string().trim().optional(),
  advisorId: z.string().trim().optional(),
  tab: z.enum(["all", "pending", "completed", "issues"]).default("all").optional(),
});

export type ListPetitionsQueryInput = z.infer<typeof listPetitionsQuerySchema>;

export const trackPetitionQuerySchema = z.object({
  query: z.string().trim().min(1, "query_required"),
});

export type TrackPetitionQueryInput = z.infer<typeof trackPetitionQuerySchema>;
