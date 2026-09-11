# Data Model & Validations
## Feature: ระบบจัดการข่าวสารประชาสัมพันธ์ (News & PR Management)

---

## 1. Prisma Schema Definition (MySQL Compatible)

นำไปเพิ่มใน `prisma/schema.prisma`:

```prisma
enum NewsCategory {
  ACADEMIC
  EVENT
  GENERAL
  PROCUREMENT
}

enum NewsStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model NewsArticle {
  id            String       @id @default(uuid()) @db.VarChar(36)
  tenantId      String       @map("tenant_id") @db.VarChar(36)
  titleTh       String       @map("title_th") @db.VarChar(255)
  titleEn       String       @map("title_en") @db.VarChar(255)
  slug          String       @db.VarChar(255)
  summaryTh     String?      @map("summary_th") @db.VarChar(500)
  summaryEn     String?      @map("summary_en") @db.VarChar(500)
  contentTh     String       @map("content_th") @db.Text
  contentEn     String       @map("content_en") @db.Text
  coverImageUrl String?      @map("cover_image_url") @db.VarChar(500)
  category      NewsCategory @default(GENERAL)
  status        NewsStatus   @default(DRAFT)
  isPinned      Boolean      @default(false) @map("is_pinned")
  viewCount     Int          @default(0) @map("view_count")
  authorId      String?      @map("author_id") @db.VarChar(36)
  publishedAt   DateTime?    @map("published_at")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  tenant      Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  attachments NewsAttachment[]

  @@unique([tenantId, slug])
  @@index([tenantId, status, category])
  @@index([tenantId, isPinned])
  @@map("news_articles")
}

model NewsAttachment {
  id        String   @id @default(uuid()) @db.VarChar(36)
  newsId    String   @map("news_id") @db.VarChar(36)
  fileName  String   @map("file_name") @db.VarChar(255)
  fileUrl   String   @map("file_url") @db.VarChar(500)
  fileSize  Int      @default(0) @map("file_size")
  fileType  String?  @map("file_type") @db.VarChar(50)
  createdAt DateTime @default(now()) @map("created_at")

  news NewsArticle @relation(fields: [newsId], references: [id], onDelete: Cascade)

  @@index([newsId])
  @@map("news_attachments")
}
```

และเพิ่มความสัมพันธ์ในโมเดล `Tenant`:
```prisma
model Tenant {
  // ...
  newsArticles NewsArticle[]
}
```

---

## 2. Zod Validation Schemas (`_internal/schemas.ts`)

```ts
import { z } from "zod";

export const newsCategoryEnum = z.enum(["ACADEMIC", "EVENT", "GENERAL", "PROCUREMENT"]);
export const newsStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createNewsSchema = z.object({
  titleTh: z.string().min(3).max(255),
  titleEn: z.string().min(3).max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  summaryTh: z.string().max(500).optional(),
  summaryEn: z.string().max(500).optional(),
  contentTh: z.string().min(10),
  contentEn: z.string().min(10),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
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
```

---

## 3. รายการคีย์คำแปลสองภาษา (`messages.ts`)

```ts
export const messages = {
  "news.title": { th: "ข่าวสารประชาสัมพันธ์", en: "News & Announcements" },
  "news.subtitle": { th: "จัดการและเผยแพร่ข่าวสารของคณะ", en: "Manage and publish faculty news" },
  "news.create": { th: "สร้างข่าวใหม่", en: "Create News" },
  "news.edit": { th: "แก้ไขข่าว", en: "Edit News" },
  "news.delete": { th: "ลบข่าว", en: "Delete News" },
  "news.titleTh": { th: "หัวข้อข่าว (ไทย)", en: "Title (Thai)" },
  "news.titleEn": { th: "หัวข้อข่าว (อังกฤษ)", en: "Title (English)" },
  "news.category": { th: "หมวดหมู่", en: "Category" },
  "news.status": { th: "สถานะ", en: "Status" },
  "news.isPinned": { th: "ปักหมุดข่าวเด่น", en: "Pin to Top" },
  "news.publishedAt": { th: "วันที่เผยแพร่", en: "Published Date" },
  "news.viewCount": { th: "ยอดเข้าชม", en: "Views" },
  "news.empty": { th: "ไม่พบข่าวสาร", en: "No news found" },
  "news.category.academic": { th: "วิชาการ", en: "Academic" },
  "news.category.event": { th: "กิจกรรม", en: "Event" },
  "news.category.general": { th: "ทั่วไป", en: "General" },
  "news.category.procurement": { th: "จัดซื้อจัดจ้าง", en: "Procurement" },
} as const;
```
