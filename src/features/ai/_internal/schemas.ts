import { z } from "zod";

export const validateThesisTitleInputSchema = z.object({
  titleTh: z.string().trim().min(3, "title_th_too_short"),
  titleEn: z.string().trim().optional().nullable(),
});

export type ValidateThesisTitleInput = z.infer<typeof validateThesisTitleInputSchema>;

export const thesisTitleValidationResultSchema = z.object({
  score: z.number().min(0).max(100),
  suggestedTitleTh: z.string(),
  suggestedTitleEn: z.string(),
  alignmentAnalysis: z.string(),
  grammarNotes: z.array(z.string()),
  keywords: z.array(z.string()),
});

export type ThesisTitleValidationResult = z.infer<typeof thesisTitleValidationResultSchema>;

export const summarizeConceptNoteInputSchema = z.object({
  title: z.string().trim().min(3, "title_too_short"),
  description: z.string().trim().min(10, "description_too_short"),
});

export type SummarizeConceptNoteInput = z.infer<typeof summarizeConceptNoteInputSchema>;

export const conceptNoteSummaryResultSchema = z.object({
  summary: z.string(),
  suggestedMethodology: z.string(),
  potentialChallenges: z.array(z.string()),
  keywords: z.array(z.string()),
});

export type ConceptNoteSummaryResult = z.infer<typeof conceptNoteSummaryResultSchema>;

export const generateAdvisoryFeedbackInputSchema = z.object({
  petitionType: z.string(),
  studentName: z.string(),
  thesisTitleTh: z.string(),
  thesisTitleEn: z.string().optional().nullable(),
  action: z.enum(["APPROVE", "RETURN", "REJECT"]),
  reviewerRole: z.string().default("ADVISOR"),
});

export type GenerateAdvisoryFeedbackInput = z.infer<typeof generateAdvisoryFeedbackInputSchema>;

export const advisoryFeedbackResultSchema = z.object({
  comment: z.string(),
  pointsToImprove: z.array(z.string()),
});

export type AdvisoryFeedbackResult = z.infer<typeof advisoryFeedbackResultSchema>;

export const generateEnglishNewsInputSchema = z.object({
  titleTh: z.string().trim().min(1, "title_th_required"),
  summaryTh: z.string().trim().optional().nullable(),
  contentTh: z.string().trim().min(1, "content_th_required"),
  category: z.string().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
});

export type GenerateEnglishNewsInput = z.infer<typeof generateEnglishNewsInputSchema>;

export const generatedEnglishNewsResultSchema = z.object({
  titleEn: z.string(),
  summaryEn: z.string(),
  contentEn: z.string(),
  slug: z.string(),
});

export type GeneratedEnglishNewsResult = z.infer<typeof generatedEnglishNewsResultSchema>;
