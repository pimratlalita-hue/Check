import { z } from "zod";

export const attendanceStatusEnum = z.enum(["VERIFIED", "FLAGGED", "MANUAL_OVERRIDE"]);
export type AttendanceStatusType = z.infer<typeof attendanceStatusEnum>;

export const examTypeEnum = z.enum(["PROPOSAL_DEFENSE", "FINAL_DEFENSE", "COMPREHENSIVE", "QUALIFYING"]);
export type ExamTypeType = z.infer<typeof examTypeEnum>;

export const recordAttendanceInputSchema = z.object({
  studentCode: z.string().trim().min(3, "Student ID must be at least 3 characters"),
  studentName: z.string().trim().min(2, "Student Name must be at least 2 characters"),
  bookingId: z.string().trim().uuid().optional().nullable(),
  examType: examTypeEnum.default("PROPOSAL_DEFENSE"),
  faceHash: z.string().trim().min(16, "Invalid biometric signature hash"),
  confidenceScore: z.number().min(0).max(100).default(95.0),
  pdpaConsent: z.boolean().refine((val) => val === true, "PDPA Consent is strictly required"),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type RecordAttendanceInput = z.infer<typeof recordAttendanceInputSchema>;

export const listAttendanceQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: attendanceStatusEnum.optional(),
  examType: examTypeEnum.optional(),
  bookingId: z.string().trim().uuid().optional(),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;
