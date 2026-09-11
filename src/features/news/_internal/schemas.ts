import { z } from "zod";

export const newsCategoryEnum = z.enum(["ACADEMIC", "EVENT", "GENERAL", "PROCUREMENT"]);
export const newsStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createNewsSchema = z.object({
  titleTh: z.string().min(1, "title_required").max(255),
  titleEn: z.string().min(1, "title_required").max(255),
  slug: z.string().min(1, "slug_required").max(255).regex(/^[a-z0-9-]+$/, "slug_format"),
  summaryTh: z.string().max(500).optional().nullable(),
  summaryEn: z.string().max(500).optional().nullable(),
  contentTh: z.string().min(1, "content_required"),
  contentEn: z.string().min(1, "content_required"),
  coverImageUrl: z.string().max(500).optional().nullable(),
  category: newsCategoryEnum.default("GENERAL"),
  status: newsStatusEnum.default("DRAFT"),
  isPinned: z.boolean().default(false),
});

export const updateNewsSchema = createNewsSchema.partial().extend({
  id: z.string().uuid(),
});

export const listNewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
  category: newsCategoryEnum.optional(),
  status: newsStatusEnum.optional(),
  search: z.string().optional(),
  isPinned: z.boolean().optional(),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type ListNewsQuery = z.infer<typeof listNewsQuerySchema>;
export type NewsCategory = z.infer<typeof newsCategoryEnum>;
export type NewsStatus = z.infer<typeof newsStatusEnum>;
