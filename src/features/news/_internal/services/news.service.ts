import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import type { NewsArticle, NewsAttachment, Prisma } from "@/generated/prisma";
import type { CreateNewsInput, UpdateNewsInput, ListNewsQuery, NewsStatus } from "../schemas";

export interface NewsAttachmentDto {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string | null;
  createdAt: string;
}

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  titleTh: string;
  titleEn: string;
  slug: string;
  summaryTh: string | null;
  summaryEn: string | null;
  contentTh: string;
  contentEn: string;
  coverImageUrl: string | null;
  category: "ACADEMIC" | "EVENT" | "GENERAL" | "PROCUREMENT";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isPinned: boolean;
  viewCount: number;
  authorId: string | null;
  authorName?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: NewsAttachmentDto[];
}

export interface NewsListResult {
  items: NewsArticleDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

type ArticleWithRelations = NewsArticle & {
  author?: { name: string | null } | null;
  attachments?: NewsAttachment[];
};

function toDto(
  article: ArticleWithRelations,
  authorName?: string | null,
  attachments?: NewsAttachment[],
): NewsArticleDto {
  return {
    id: article.id,
    tenantId: article.tenantId,
    titleTh: article.titleTh,
    titleEn: article.titleEn,
    slug: article.slug,
    summaryTh: article.summaryTh,
    summaryEn: article.summaryEn,
    contentTh: article.contentTh,
    contentEn: article.contentEn,
    coverImageUrl: article.coverImageUrl,
    category: article.category,
    status: article.status,
    isPinned: article.isPinned,
    viewCount: article.viewCount,
    authorId: article.authorId,
    authorName: authorName ?? article.author?.name ?? null,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    attachments: attachments
      ? attachments.map((att: NewsAttachment) => ({
          id: att.id,
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileSize: att.fileSize,
          fileType: att.fileType,
          createdAt: att.createdAt.toISOString(),
        }))
      : article.attachments?.map((att: NewsAttachment) => ({
          id: att.id,
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileSize: att.fileSize,
          fileType: att.fileType,
          createdAt: att.createdAt.toISOString(),
        })),
  };
}

export async function listNews(
  tenantId: string,
  q: ListNewsQuery,
  db: Db = prisma,
): Promise<NewsListResult> {
  const where: Prisma.NewsArticleWhereInput = {
    tenantId,
    ...(q.category ? { category: q.category } : {}),
    ...(q.status ? { status: q.status } : {}),
    ...(typeof q.isPinned === "boolean" ? { isPinned: q.isPinned } : {}),
    ...(q.search
      ? {
          OR: [
            { titleTh: { contains: q.search } },
            { titleEn: { contains: q.search } },
            { slug: { contains: q.search } },
            { summaryTh: { contains: q.search } },
            { summaryEn: { contains: q.search } },
          ],
        }
      : {}),
  };

  const skip = (q.page - 1) * q.perPage;
  const take = q.perPage;

  const [articles, total] = await Promise.all([
    db.newsArticle.findMany({
      where,
      skip,
      take,
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      include: {
        author: { select: { name: true } },
        attachments: true,
      },
    }),
    db.newsArticle.count({ where }),
  ]);

  return {
    items: articles.map((a) => toDto(a)),
    total,
    page: q.page,
    perPage: q.perPage,
    totalPages: Math.max(1, Math.ceil(total / q.perPage)),
  };
}

export async function resolvePortalTenantId(db: Db = prisma): Promise<string> {
  const tenant =
    (await db.tenant.findUnique({ where: { code: "DEMO" }, select: { id: true } })) ??
    (await db.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true } }));
  if (!tenant) throw errors.not_found();
  return tenant.id;
}

export async function getNewsBySlug(
  tenantId: string,
  slug: string,
  incrementView = false,
  db: Db = prisma,
): Promise<NewsArticleDto | null> {
  const article = await db.newsArticle.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: {
      author: { select: { name: true } },
      attachments: true,
    },
  });

  if (!article) return null;

  if (incrementView) {
    await db.newsArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });
    article.viewCount += 1;
  }

  return toDto(article);
}

export async function getNewsById(
  tenantId: string,
  id: string,
  db: Db = prisma,
): Promise<NewsArticleDto | null> {
  const article = await db.newsArticle.findFirst({
    where: { id, tenantId },
    include: {
      author: { select: { name: true } },
      attachments: true,
    },
  });

  return article ? toDto(article) : null;
}

export async function createNews(
  tenantId: string,
  input: CreateNewsInput,
  authorId?: string | null,
  db: Db = prisma,
): Promise<NewsArticleDto> {
  // 1. ตรวจสอบ slug ซ้ำใน tenant เดียวกัน
  const existingSlug = await db.newsArticle.findUnique({
    where: { tenantId_slug: { tenantId, slug: input.slug } },
  });
  if (existingSlug) {
    throw errors.conflict("slug_exists");
  }

  // 2. ตรวจสอบโควตาข่าวปักหมุด (ไม่เกิน 5 ข่าว)
  if (input.isPinned) {
    const pinnedCount = await db.newsArticle.count({
      where: { tenantId, isPinned: true },
    });
    if (pinnedCount >= 5) {
      throw errors.validation("max_pinned_reached");
    }
  }

  const publishedAt = input.status === "PUBLISHED" ? new Date() : null;

  const created = await db.newsArticle.create({
    data: {
      tenantId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      slug: input.slug,
      summaryTh: input.summaryTh ?? null,
      summaryEn: input.summaryEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImageUrl: input.coverImageUrl ?? null,
      category: input.category,
      status: input.status,
      isPinned: input.isPinned,
      authorId: authorId ?? null,
      publishedAt,
    },
    include: {
      author: { select: { name: true } },
      attachments: true,
    },
  });

  return toDto(created);
}

export async function updateNews(
  tenantId: string,
  input: UpdateNewsInput,
  db: Db = prisma,
): Promise<NewsArticleDto> {
  const existing = await db.newsArticle.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("news_not_found");
  }

  // หากมีการเปลี่ยน slug ต้องตรวจสอบว่าซ้ำหรือไม่
  if (input.slug && input.slug !== existing.slug) {
    const duplicate = await db.newsArticle.findUnique({
      where: { tenantId_slug: { tenantId, slug: input.slug } },
    });
    if (duplicate) {
      throw errors.conflict("slug_exists");
    }
  }

  // ตรวจสอบโควตาปักหมุดหากเปลี่ยนเป็น pinned
  if (input.isPinned === true && !existing.isPinned) {
    const pinnedCount = await db.newsArticle.count({
      where: { tenantId, isPinned: true },
    });
    if (pinnedCount >= 5) {
      throw errors.validation("max_pinned_reached");
    }
  }

  let publishedAt = existing.publishedAt;
  if (input.status === "PUBLISHED" && !existing.publishedAt) {
    publishedAt = new Date();
  }

  const updated = await db.newsArticle.update({
    where: { id: input.id },
    data: {
      ...(input.titleTh !== undefined ? { titleTh: input.titleTh } : {}),
      ...(input.titleEn !== undefined ? { titleEn: input.titleEn } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.summaryTh !== undefined ? { summaryTh: input.summaryTh } : {}),
      ...(input.summaryEn !== undefined ? { summaryEn: input.summaryEn } : {}),
      ...(input.contentTh !== undefined ? { contentTh: input.contentTh } : {}),
      ...(input.contentEn !== undefined ? { contentEn: input.contentEn } : {}),
      ...(input.coverImageUrl !== undefined ? { coverImageUrl: input.coverImageUrl } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.status !== undefined ? { status: input.status, publishedAt } : {}),
      ...(input.isPinned !== undefined ? { isPinned: input.isPinned } : {}),
    },
    include: {
      author: { select: { name: true } },
      attachments: true,
    },
  });

  return toDto(updated);
}

export async function deleteNews(
  tenantId: string,
  id: string,
  db: Db = prisma,
): Promise<void> {
  const existing = await db.newsArticle.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("news_not_found");
  }

  await db.newsArticle.delete({
    where: { id },
  });
}

export async function togglePinNews(
  tenantId: string,
  id: string,
  db: Db = prisma,
): Promise<NewsArticleDto> {
  const existing = await db.newsArticle.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("news_not_found");
  }

  const willBePinned = !existing.isPinned;
  if (willBePinned) {
    const pinnedCount = await db.newsArticle.count({
      where: { tenantId, isPinned: true },
    });
    if (pinnedCount >= 5) {
      throw errors.validation("max_pinned_reached");
    }
  }

  const updated = await db.newsArticle.update({
    where: { id },
    data: { isPinned: willBePinned },
    include: {
      author: { select: { name: true } },
      attachments: true,
    },
  });

  return toDto(updated);
}

export async function changeNewsStatus(
  tenantId: string,
  id: string,
  status: NewsStatus,
  db: Db = prisma,
): Promise<NewsArticleDto> {
  const existing = await db.newsArticle.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("news_not_found");
  }

  let publishedAt = existing.publishedAt;
  if (status === "PUBLISHED" && !existing.publishedAt) {
    publishedAt = new Date();
  }

  const updated = await db.newsArticle.update({
    where: { id },
    data: { status, publishedAt },
    include: {
      author: { select: { name: true } },
      attachments: true,
    },
  });

  return toDto(updated);
}
