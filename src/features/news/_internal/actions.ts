"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, getTenantSettings } from "@/features/identity/server";
import { generateEnglishNewsContent } from "@/features/ai/server";
import type { GeneratedEnglishNewsResult } from "@/features/ai";
import { z } from "zod";
import { NEWS_P } from "../permissions";
import {
  createNewsSchema,
  updateNewsSchema,
  listNewsQuerySchema,
  newsStatusEnum,
  type NewsStatus,
} from "./schemas";
import {
  createNews,
  updateNews,
  deleteNews,
  listNews,
  getNewsById,
  togglePinNews,
  changeNewsStatus,
  type NewsArticleDto,
  type NewsListResult,
} from "./services/news.service";

export async function listNewsAction(input?: unknown): Promise<ActionResult<NewsListResult>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    const parsed = listNewsQuerySchema.parse(input ?? {}, { error: zodErrorMap(await getLocale()) });
    return listNews(ctx.tenantId, parsed);
  });
}

export async function getNewsByIdAction(id: string): Promise<ActionResult<NewsArticleDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return getNewsById(ctx.tenantId, id);
  });
}

export async function createNewsAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = createNewsSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createNews(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/news");
    revalidatePath("/(admin)/news");
    return result;
  });
}

export async function updateNewsAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = updateNewsSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateNews(ctx.tenantId, parsed);
    revalidatePath("/news");
    revalidatePath("/(admin)/news");
    return result;
  });
}

export async function deleteNewsAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPublish);
    await deleteNews(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/(admin)/news");
  });
}

export async function togglePinNewsAction(id: string): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPublish);
    const result = await togglePinNews(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/(admin)/news");
    return result;
  });
}

export async function changeNewsStatusAction(id: string, status: NewsStatus): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPublish);
    const validStatus = newsStatusEnum.parse(status);
    const result = await changeNewsStatus(ctx.tenantId, id, validStatus);
    revalidatePath("/news");
    revalidatePath("/(admin)/news");
    return result;
  });
}

const generateEnglishNewsActionSchema = z.object({
  titleTh: z.string().trim().min(1, "title_th_required"),
  summaryTh: z.string().trim().optional(),
  contentTh: z.string().trim().min(1, "content_th_required"),
  category: z.string().optional(),
});

export async function generateEnglishNewsAction(
  input: unknown
): Promise<ActionResult<GeneratedEnglishNewsResult>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = generateEnglishNewsActionSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });

    // Resolve tenant settings to retrieve configured Gemini API key & model
    const settings = await getTenantSettings(ctx.tenantId);
    const apiKey = settings.ai?.geminiApiKey?.trim() || undefined;
    const model = settings.ai?.model || "gemini-2.5-flash";

    return generateEnglishNewsContent({
      titleTh: parsed.titleTh,
      summaryTh: parsed.summaryTh,
      contentTh: parsed.contentTh,
      category: parsed.category,
      apiKey,
      model,
    });
  });
}
