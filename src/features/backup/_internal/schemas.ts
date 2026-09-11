import { z } from "zod";

export const backupMetadataSchema = z.object({
  version: z.string().default("1.0.0"),
  exportedAt: z.string(),
  system: z.string().default("Graduate Thesis Management and Tracking System (GTMTS)"),
  tenant: z.object({
    id: z.string().optional(),
    code: z.string(),
    nameTh: z.string(),
    nameEn: z.string(),
  }),
  stats: z.record(z.string(), z.number()).optional(),
});

export const backupNewsItemSchema = z.object({
  slug: z.string(),
  titleTh: z.string(),
  titleEn: z.string(),
  summaryTh: z.string().nullable().optional(),
  summaryEn: z.string().nullable().optional(),
  contentTh: z.string(),
  contentEn: z.string(),
  category: z.enum(["ACADEMIC", "EVENT", "GENERAL", "PROCUREMENT"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isPinned: z.boolean().default(false),
  viewCount: z.number().default(0),
  coverImageUrl: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
});

export const backupDepartmentSchema = z.object({
  code: z.string(),
  nameTh: z.string(),
  nameEn: z.string(),
  descriptionTh: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const backupStaffSchema = z.object({
  prefixTh: z.string().nullable().optional(),
  prefixEn: z.string().nullable().optional(),
  firstNameTh: z.string(),
  lastNameTh: z.string(),
  firstNameEn: z.string(),
  lastNameEn: z.string(),
  email: z.string(),
  phone: z.string().nullable().optional(),
  academicRank: z.enum(["NONE", "LECTURER", "ASSISTANT_PROFESSOR", "ASSOCIATE_PROFESSOR", "PROFESSOR"]),
  positionTh: z.string(),
  positionEn: z.string(),
  departmentCode: z.string().nullable().optional(),
  expertise: z.any().optional(),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const backupCourseSchema = z.object({
  code: z.string(),
  nameTh: z.string(),
  nameEn: z.string(),
  credits: z.number().default(3),
  category: z.enum(["GENERAL_EDUCATION", "CORE_COURSE", "MAJOR_ELECTIVE", "FREE_ELECTIVE", "THESIS"]).default("CORE_COURSE"),
  descriptionTh: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
});

export const backupProgramSchema = z.object({
  code: z.string(),
  slug: z.string(),
  nameTh: z.string(),
  nameEn: z.string(),
  degreeTh: z.string(),
  degreeEn: z.string(),
  degreeShortTh: z.string(),
  degreeShortEn: z.string(),
  level: z.enum(["BACHELOR", "MASTER", "DOCTORAL", "CERTIFICATE"]),
  totalCredits: z.number(),
  studyDuration: z.string().default("2 ปี (2 Years)"),
  descriptionTh: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  courses: z.array(backupCourseSchema).default([]),
});

export const backupPetitionActivitySchema = z.object({
  action: z.enum(["SUBMIT", "APPROVE", "RETURN", "REJECT", "CANCEL"]),
  previousStatus: z.enum(["SUBMITTED", "ADVISOR_APPROVED", "CHAIR_APPROVED", "COMPLETED", "RETURNED", "REJECTED", "CANCELLED"]).nullable().optional(),
  newStatus: z.enum(["SUBMITTED", "ADVISOR_APPROVED", "CHAIR_APPROVED", "COMPLETED", "RETURNED", "REJECTED", "CANCELLED"]),
  comment: z.string().nullable().optional(),
  actorName: z.string(),
  actorRole: z.string(),
  createdAt: z.string().optional(),
});

export const backupPetitionSchema = z.object({
  trackingNo: z.string(),
  type: z.enum(["THESIS_TOPIC_APPROVAL", "DEFENSE_EXAM_REQUEST", "LEAVE_OF_ABSENCE", "EXTENSION_OF_STUDY", "GENERAL_PETITION"]),
  status: z.enum(["SUBMITTED", "ADVISOR_APPROVED", "CHAIR_APPROVED", "COMPLETED", "RETURNED", "REJECTED", "CANCELLED"]),
  title: z.string(),
  description: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  studentEmail: z.string(),
  studentPhone: z.string().nullable().optional(),
  thesisTitleTh: z.string().nullable().optional(),
  thesisTitleEn: z.string().nullable().optional(),
  programCode: z.string().nullable().optional(),
  advisorEmail: z.string().nullable().optional(),
  currentStep: z.number().default(1),
  activities: z.array(backupPetitionActivitySchema).default([]),
});

export const backupRoomSchema = z.object({
  code: z.string(),
  nameTh: z.string(),
  nameEn: z.string(),
  building: z.string(),
  floor: z.number().default(1),
  capacity: z.number().default(10),
  type: z.enum(["EXAM_ROOM", "MEETING_ROOM", "LAB", "AUDITORIUM", "SMART_CLASSROOM"]).default("EXAM_ROOM"),
  facilities: z.any().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const backupBookingSchema = z.object({
  title: z.string(),
  roomCode: z.string(),
  purpose: z.string().nullable().optional(),
  type: z.enum(["EXAM_DEFENSE", "ACADEMIC_MEETING", "SEMINAR", "TEACHING", "GENERAL"]).default("EXAM_DEFENSE"),
  platform: z.enum(["ON_SITE", "ZOOM", "MS_TEAMS", "GOOGLE_MEET", "HYBRID"]).default("ON_SITE"),
  meetingUrl: z.string().nullable().optional(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(["CONFIRMED", "PENDING", "CANCELLED", "REJECTED"]).default("CONFIRMED"),
  bookedByName: z.string(),
  bookedByEmail: z.string(),
  bookedByPhone: z.string().nullable().optional(),
  attendeeCount: z.number().nullable().optional(),
});

export const backupAttendanceSchema = z.object({
  studentCode: z.string(),
  studentName: z.string(),
  examType: z.enum(["PROPOSAL_DEFENSE", "FINAL_DEFENSE", "COMPREHENSIVE", "QUALIFYING"]).default("PROPOSAL_DEFENSE"),
  faceHash: z.string(),
  confidenceScore: z.number().default(95.0),
  status: z.enum(["VERIFIED", "FLAGGED", "MANUAL_OVERRIDE"]).default("VERIFIED"),
  pdpaConsent: z.boolean().default(true),
  notes: z.string().nullable().optional(),
  verifiedAt: z.string().optional(),
});

export const gtmtsBackupPayloadSchema = z.object({
  meta: backupMetadataSchema,
  newsArticles: z.array(backupNewsItemSchema).default([]),
  departments: z.array(backupDepartmentSchema).default([]),
  staffProfiles: z.array(backupStaffSchema).default([]),
  programs: z.array(backupProgramSchema).default([]),
  petitions: z.array(backupPetitionSchema).default([]),
  facilityRooms: z.array(backupRoomSchema).default([]),
  roomBookings: z.array(backupBookingSchema).default([]),
  examAttendances: z.array(backupAttendanceSchema).default([]),
});

export type GtmtsBackupPayload = z.infer<typeof gtmtsBackupPayloadSchema>;

export const importBackupInputSchema = z.object({
  jsonString: z.string().min(2, "JSON data is required"),
  mode: z.enum(["merge", "replace"]).default("replace"),
});

export type ImportBackupInput = z.infer<typeof importBackupInputSchema>;

export const systemWipeInputSchema = z.object({
  mode: z.enum(["seed", "clean"]).default("seed"),
  confirmationText: z.string().min(1, "Confirmation text is required"),
}).refine(
  (data) => data.confirmationText.trim() === "CONFIRM_WIPE" || data.confirmationText.trim() === "RESET",
  {
    message: "Invalid confirmation text. Must enter CONFIRM_WIPE or RESET",
    path: ["confirmationText"],
  }
);

export type SystemWipeInput = z.infer<typeof systemWipeInputSchema>;
