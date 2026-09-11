import { describe, it, expect } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { seedCore, seedUser } from "../../../../../prisma/lib/seed-core";
import {
  createNews,
  getNewsBySlug,
  updateNews,
  deleteNews,
  togglePinNews,
  changeNewsStatus,
  listNews,
} from "./news.service";

describe("news.service (integration)", () => {
  it("สามารถสร้างข่าว, อ่านข่าวพร้อมนับยอดวิว, ปักหมุด, แก้ไข, เปลี่ยนสถานะ และลบข่าวบน DB จริงได้", async () => {
    const core = await seedCore(prisma, { tenantCode: "NEWS_INT", nameTh: "คณะทดสอบ", nameEn: "Test Faculty" });
    const adminId = await seedUser(prisma, core.tenantId, {
      email: "admin@news.local",
      name: "Admin",
      passwordHash: "hash",
      roleIds: [core.roleIds.SUPER_ADMIN],
    });

    // 1. Create News
    const created = await createNews(
      core.tenantId,
      {
        titleTh: "ข่าวทดสอบบูรณาการ",
        titleEn: "Integration Test News",
        slug: "integration-test-news",
        summaryTh: "สรุปข่าวทดสอบ",
        summaryEn: "Test news summary",
        contentTh: "เนื้อหาข่าวฉบับเต็มสำหรับการทดสอบ Integration",
        contentEn: "Full content for integration testing",
        category: "ACADEMIC",
        status: "DRAFT",
        isPinned: false,
      },
      adminId,
    );

    expect(created.id).toBeDefined();
    expect(created.titleTh).toBe("ข่าวทดสอบบูรณาการ");
    expect(created.status).toBe("DRAFT");
    expect(created.viewCount).toBe(0);

    // 2. Change Status to PUBLISHED
    const published = await changeNewsStatus(core.tenantId, created.id, "PUBLISHED");
    expect(published.status).toBe("PUBLISHED");
    expect(published.publishedAt).toBeDefined();

    // 3. Get News By Slug with view count increment
    const fetched = await getNewsBySlug(core.tenantId, "integration-test-news", true);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(created.id);
    expect(fetched?.viewCount).toBe(1);

    // 4. Toggle Pin
    const pinned = await togglePinNews(core.tenantId, created.id);
    expect(pinned.isPinned).toBe(true);

    // 5. Update News
    const updated = await updateNews(core.tenantId, {
      id: created.id,
      titleTh: "ข่าวทดสอบที่แก้ไขแล้ว",
      titleEn: "Updated Test News",
      slug: "integration-test-news-updated",
      summaryTh: "สรุปข่าวปรับปรุงใหม่",
      contentTh: "เนื้อหาปรับปรุงใหม่",
      contentEn: "Updated content",
    });
    expect(updated.titleTh).toBe("ข่าวทดสอบที่แก้ไขแล้ว");
    expect(updated.slug).toBe("integration-test-news-updated");

    // 6. List News
    const list = await listNews(core.tenantId, {
      page: 1,
      perPage: 10,
      search: "ข่าวทดสอบที่แก้ไขแล้ว",
    });
    expect(list.items).toHaveLength(1);
    expect(list.items[0].slug).toBe("integration-test-news-updated");

    // 7. Delete News
    await deleteNews(core.tenantId, created.id);
    const afterDelete = await getNewsBySlug(core.tenantId, "integration-test-news-updated", false);
    expect(afterDelete).toBeNull();
  });
});
