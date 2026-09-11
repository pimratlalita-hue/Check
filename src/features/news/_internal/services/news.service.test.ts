import { describe, it, expect, vi } from "vitest";
import type { Db } from "@/shared/lib/infra/prisma";
import { createNewsSchema, updateNewsSchema, listNewsQuerySchema } from "../schemas";
import { createNews, listNews } from "./news.service";

describe("News Schemas Validation", () => {
  it("validate createNewsSchema สำเร็จเมื่อข้อมูลครบถ้วน", () => {
    const input = {
      titleTh: "เปิดรับสมัครนักศึกษาใหม่",
      titleEn: "Freshman Admission Open",
      slug: "admission-open-2026",
      contentTh: "รายละเอียดการรับสมัครนักศึกษาใหม่ประจำปีการศึกษา 2026...",
      contentEn: "Details regarding the new freshman admissions for academic year 2026...",
      category: "ACADEMIC" as const,
      status: "PUBLISHED" as const,
      isPinned: true,
    };
    const parsed = createNewsSchema.parse(input);
    expect(parsed.titleTh).toBe("เปิดรับสมัครนักศึกษาใหม่");
    expect(parsed.slug).toBe("admission-open-2026");
  });

  it("validate createNewsSchema ล้มเมื่อ slug ผิดรูปแบบ (มีตัวพิมพ์ใหญ่หรือช่องว่าง)", () => {
    const input = {
      titleTh: "ข่าวทดสอบ",
      titleEn: "Test News",
      slug: "Invalid Slug With Spaces",
      contentTh: "เนื้อหาข่าว...",
      contentEn: "News content...",
    };
    expect(() => createNewsSchema.parse(input)).toThrow();
  });

  it("validate listNewsQuerySchema มีค่า default page=1 และ perPage=10", () => {
    const parsed = listNewsQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.perPage).toBe(10);
  });

  it("validate updateNewsSchema ต้องมี UUID", () => {
    const input = {
      id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      titleTh: "หัวข้อแก้ไข",
    };
    const parsed = updateNewsSchema.parse(input);
    expect(parsed.id).toBe("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");
    expect(parsed.titleTh).toBe("หัวข้อแก้ไข");
  });
});

describe("News Service Logic", () => {
  const tenantId = "test-tenant-id";

  it("createNews: ปฏิเสธเมื่อ slug ซ้ำใน tenant เดียวกัน", async () => {
    const mockDb = {
      newsArticle: {
        findUnique: vi.fn().mockResolvedValue({ id: "existing-id", slug: "duplicate-slug" }),
      },
    } as unknown as Db;

    const input = {
      titleTh: "ข่าวซ้ำ",
      titleEn: "Duplicate",
      slug: "duplicate-slug",
      contentTh: "เนื้อหา...",
      contentEn: "Content...",
      category: "GENERAL" as const,
      status: "DRAFT" as const,
      isPinned: false,
    };

    await expect(createNews(tenantId, input, null, mockDb)).rejects.toThrow("slug_exists");
  });

  it("createNews: ปฏิเสธเมื่อข่าวปักหมุดเกิน 5 ข่าว", async () => {
    const mockDb = {
      newsArticle: {
        findUnique: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(5), // โควตาเต็ม 5 ข่าวแล้ว
      },
    } as unknown as Db;

    const input = {
      titleTh: "ข่าวเด่นเกินโควตา",
      titleEn: "Over Quota Pinned",
      slug: "over-quota",
      contentTh: "เนื้อหา...",
      contentEn: "Content...",
      category: "GENERAL" as const,
      status: "DRAFT" as const,
      isPinned: true,
    };

    await expect(createNews(tenantId, input, null, mockDb)).rejects.toThrow("max_pinned_reached");
  });

  it("listNews: ดึงข้อมูลข่าวและคำนวณ totalPages ถูกต้อง", async () => {
    const mockDb = {
      newsArticle: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "news-1",
            tenantId,
            titleTh: "ข่าว 1",
            titleEn: "News 1",
            slug: "news-1",
            summaryTh: null,
            summaryEn: null,
            contentTh: "เนื้อหา",
            contentEn: "Content",
            coverImageUrl: null,
            category: "ACADEMIC",
            status: "PUBLISHED",
            isPinned: true,
            viewCount: 15,
            authorId: null,
            publishedAt: new Date("2026-09-01"),
            createdAt: new Date("2026-09-01"),
            updatedAt: new Date("2026-09-01"),
            author: null,
            attachments: [],
          },
        ]),
        count: vi.fn().mockResolvedValue(25),
      },
    } as unknown as Db;

    const result = await listNews(tenantId, { page: 1, perPage: 10 }, mockDb);
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.items[0].slug).toBe("news-1");
  });
});
