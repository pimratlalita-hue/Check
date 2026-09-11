import { describe, it, expect, vi } from "vitest";
import type { Db } from "@/shared/lib/infra/prisma";
import {
  submitPetitionSchema,
  processPetitionActionSchema,
  listPetitionsQuerySchema,
  trackPetitionQuerySchema,
} from "../schemas";
import {
  generateTrackingNo,
  submitPublicPetition,
  trackPublicPetition,
  getPublicPetitionDetail,
  listPetitions,
  getWorkflowStats,
  processPetitionAction,
} from "./workflow.service";

describe("Workflow Schemas Validation", () => {
  it("validate submitPetitionSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const input = {
      type: "THESIS_TOPIC_APPROVAL" as const,
      title: "ขออนุมัติหัวข้อวิทยานิพนธ์ด้าน AI สำหรับการแพทย์",
      description: "ขอยื่นเสนอหัวข้อวิทยานิพนธ์และโครงร่างวิจัยฉบับสมบูรณ์",
      studentId: "65010001",
      studentName: "สมชาย ใจดี",
      studentEmail: "somchai@univ.ac.th",
      studentPhone: "0812345678",
      thesisTitleTh: "การพัฒนาระบบ AI สำหรับการแพทย์",
      thesisTitleEn: "Development of AI System for Healthcare",
      attachmentUrl: "https://storage.univ.ac.th/thesis/proposal.pdf",
    };

    const parsed = submitPetitionSchema.parse(input);
    expect(parsed.type).toBe("THESIS_TOPIC_APPROVAL");
    expect(parsed.studentId).toBe("65010001");
    expect(parsed.thesisTitleTh).toBe("การพัฒนาระบบ AI สำหรับการแพทย์");
  });

  it("validate submitPetitionSchema ล้มเหลวเมื่ออีเมลไม่ถูกต้องหรือชื่อสั้นเกินไป", () => {
    const input = {
      type: "GENERAL_PETITION" as const,
      title: "ขอยื่น", // too short (min 3)
      description: "รายละเอียด",
      studentId: "12", // too short (min 3)
      studentName: "A", // too short (min 2)
      studentEmail: "invalid-email", // not an email
    };

    expect(() => submitPetitionSchema.parse(input)).toThrow();
  });

  it("validate processPetitionActionSchema ผ่านเมื่อระบุ action และ actor ถูกต้อง", () => {
    const input = {
      petitionId: "pet-123",
      action: "APPROVE" as const,
      actorName: "ศ.ดร.ประสิทธิ์ ปัญญาดี",
      actorRole: "ADVISOR",
      comment: "เห็นชอบตามข้อเสนอ",
    };

    const parsed = processPetitionActionSchema.parse(input);
    expect(parsed.action).toBe("APPROVE");
    expect(parsed.actorRole).toBe("ADVISOR");
  });

  it("validate listPetitionsQuerySchema กำหนดค่าเริ่มต้น page=1 และ perPage=50", () => {
    const parsed = listPetitionsQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.perPage).toBe(50);
    expect(parsed.tab).toBe("all");
  });

  it("validate trackPetitionQuerySchema ล้มเหลวเมื่อ query ว่างเปล่า", () => {
    expect(() => trackPetitionQuerySchema.parse({ query: "   " })).toThrow();
  });
});

describe("Workflow Service Logic & State Machine", () => {
  const tenantId = "test-tenant-uuid";
  const currentYear = new Date().getFullYear();

  it("generateTrackingNo: สร้างหมายเลขแรก REQ-YYYY-0001 เมื่อยังไม่มีคำร้องในปีนั้น", async () => {
    const mockDb = {
      petition: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as unknown as Db;

    const trackingNo = await generateTrackingNo(tenantId, mockDb);
    expect(trackingNo).toBe(`REQ-${currentYear}-0001`);
  });

  it("generateTrackingNo: สร้างหมายเลขถัดไปเมื่อมีคำร้องเดิมอยู่แล้ว", async () => {
    const mockDb = {
      petition: {
        findFirst: vi.fn().mockResolvedValue({
          trackingNo: `REQ-${currentYear}-0042`,
        }),
      },
    } as unknown as Db;

    const trackingNo = await generateTrackingNo(tenantId, mockDb);
    expect(trackingNo).toBe(`REQ-${currentYear}-0043`);
  });

  it("submitPublicPetition: บันทึกคำร้องสถานะ SUBMITTED และสร้างประวัติเริ่มต้น", async () => {
    const now = new Date();
    const mockDb = {
      petition: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => {
          return Promise.resolve({
            id: "pet-1",
            ...data,
            program: null,
            advisor: null,
            activities: [
              {
                id: "act-1",
                petitionId: "pet-1",
                actorName: data.studentName,
                actorRole: "STUDENT",
                action: "SUBMIT",
                previousStatus: null,
                newStatus: "SUBMITTED",
                comment: "ยื่นคำร้องผ่านระบบออนไลน์เรียบร้อยแล้ว",
                createdAt: now,
              },
            ],
            createdAt: now,
            updatedAt: now,
          });
        }),
      },
    } as unknown as Db;

    const result = await submitPublicPetition(
      tenantId,
      {
        type: "THESIS_TOPIC_APPROVAL",
        title: "ขออนุมัติหัวข้อวิทยานิพนธ์",
        description: "รายละเอียดเค้าโครงวิจัย",
        studentId: "65010001",
        studentName: "สมชาย ใจดี",
        studentEmail: "somchai@univ.ac.th",
      },
      mockDb
    );

    expect(result.id).toBe("pet-1");
    expect(result.status).toBe("SUBMITTED");
    expect(result.currentStep).toBe(1);
    expect(result.trackingNo).toBe(`REQ-${currentYear}-0001`);
    expect(result.activities).toHaveLength(1);
    expect(result.activities?.[0].action).toBe("SUBMIT");
  });

  it("trackPublicPetition: ค้นหาคำร้องด้วยรหัสคำร้องหรือรหัสนิสิต", async () => {
    const now = new Date();
    const mockDb = {
      petition: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "pet-1",
            tenantId,
            trackingNo: "REQ-2026-0001",
            type: "DEFENSE_EXAM_REQUEST",
            status: "SUBMITTED",
            title: "ขอสอบปากเปล่า",
            description: "เล่มสมบูรณ์พร้อม",
            studentId: "65010001",
            studentName: "สมชาย ใจดี",
            studentEmail: "somchai@univ.ac.th",
            studentPhone: null,
            programId: null,
            advisorId: null,
            thesisTitleTh: null,
            thesisTitleEn: null,
            attachmentUrl: null,
            currentStep: 1,
            createdAt: now,
            updatedAt: now,
            activities: [],
          },
        ]),
      },
    } as unknown as Db;

    const results = await trackPublicPetition(tenantId, "65010001", mockDb);
    expect(results).toHaveLength(1);
    expect(results[0].trackingNo).toBe("REQ-2026-0001");

    const emptyResults = await trackPublicPetition(tenantId, "   ", mockDb);
    expect(emptyResults).toHaveLength(0);
  });

  it("getPublicPetitionDetail: คืนค่า null เมื่อไม่พบคำร้อง", async () => {
    const mockDb = {
      petition: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as unknown as Db;

    const result = await getPublicPetitionDetail(tenantId, "REQ-9999", mockDb);
    expect(result).toBeNull();
  });

  it("getWorkflowStats: สรุปตัวเลขสถิติภาพรวม 4 มิติ", async () => {
    const mockDb = {
      petition: {
        count: vi
          .fn()
          .mockResolvedValueOnce(20) // total
          .mockResolvedValueOnce(12) // pending
          .mockResolvedValueOnce(5)  // completed
          .mockResolvedValueOnce(3), // issues
      },
    } as unknown as Db;

    const stats = await getWorkflowStats(tenantId, mockDb);
    expect(stats.total).toBe(20);
    expect(stats.pending).toBe(12);
    expect(stats.completed).toBe(5);
    expect(stats.issues).toBe(3);
  });

  it("listPetitions: รองรับการค้นหา กรอง และแบ่งหน้า", async () => {
    const now = new Date();
    const mockDb = {
      petition: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "pet-list-1",
            tenantId,
            trackingNo: "REQ-2026-0001",
            type: "THESIS_TOPIC_APPROVAL",
            status: "SUBMITTED",
            title: "หัวข้อทดสอบ",
            description: "รายละเอียด",
            studentId: "65010001",
            studentName: "สมชาย ใจดี",
            studentEmail: "somchai@univ.ac.th",
            studentPhone: null,
            programId: null,
            advisorId: null,
            thesisTitleTh: null,
            thesisTitleEn: null,
            attachmentUrl: null,
            currentStep: 1,
            createdAt: now,
            updatedAt: now,
            program: null,
            advisor: null,
            activities: [],
          },
        ]),
      },
    } as unknown as Db;

    const result = await listPetitions(tenantId, { tab: "pending", page: 1, perPage: 25 }, mockDb);
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("pet-list-1");
  });

  it("processPetitionAction: APPROVE จาก SUBMITTED ก้าวหน้าไปยัง ADVISOR_APPROVED (Step 2)", async () => {
    const now = new Date();
    const existing = {
      id: "pet-1",
      tenantId,
      status: "SUBMITTED",
      currentStep: 1,
    };

    const mockDb = {
      petition: {
        findFirst: vi.fn().mockResolvedValue(existing),
        update: vi.fn().mockImplementation(({ data }) => ({
          ...existing,
          ...data,
          program: null,
          advisor: null,
          activities: [
            {
              id: "act-2",
              petitionId: "pet-1",
              actorName: "อ.ที่ปรึกษา",
              actorRole: "ADVISOR",
              action: "APPROVE",
              previousStatus: "SUBMITTED",
              newStatus: "ADVISOR_APPROVED",
              comment: "อนุมัติ",
              createdAt: now,
            },
          ],
          createdAt: now,
          updatedAt: now,
        })),
      },
    } as unknown as Db;

    const updated = await processPetitionAction(
      tenantId,
      {
        petitionId: "pet-1",
        action: "APPROVE",
        actorName: "อ.ที่ปรึกษา",
        actorRole: "ADVISOR",
        comment: "อนุมัติ",
      },
      mockDb
    );

    expect(updated.status).toBe("ADVISOR_APPROVED");
    expect(updated.currentStep).toBe(2);
  });

  it("processPetitionAction: APPROVE จาก ADVISOR_APPROVED ก้าวหน้าไปยัง CHAIR_APPROVED (Step 3)", async () => {
    const now = new Date();
    const existing = {
      id: "pet-2",
      tenantId,
      status: "ADVISOR_APPROVED",
      currentStep: 2,
    };

    const mockDb = {
      petition: {
        findFirst: vi.fn().mockResolvedValue(existing),
        update: vi.fn().mockImplementation(({ data }) => ({
          ...existing,
          ...data,
          program: null,
          advisor: null,
          activities: [],
          createdAt: now,
          updatedAt: now,
        })),
      },
    } as unknown as Db;

    const updated = await processPetitionAction(
      tenantId,
      {
        petitionId: "pet-2",
        action: "APPROVE",
        actorName: "ประธานหลักสูตร",
        actorRole: "PROGRAM_CHAIR",
      },
      mockDb
    );

    expect(updated.status).toBe("CHAIR_APPROVED");
    expect(updated.currentStep).toBe(3);
  });

  it("processPetitionAction: APPROVE จาก CHAIR_APPROVED ก้าวหน้าไปยัง COMPLETED (Step 4)", async () => {
    const now = new Date();
    const existing = {
      id: "pet-3",
      tenantId,
      status: "CHAIR_APPROVED",
      currentStep: 3,
    };

    const mockDb = {
      petition: {
        findFirst: vi.fn().mockResolvedValue(existing),
        update: vi.fn().mockImplementation(({ data }) => ({
          ...existing,
          ...data,
          program: null,
          advisor: null,
          activities: [],
          createdAt: now,
          updatedAt: now,
        })),
      },
    } as unknown as Db;

    const updated = await processPetitionAction(
      tenantId,
      {
        petitionId: "pet-3",
        action: "APPROVE",
        actorName: "คณบดี",
        actorRole: "DEAN_OFFICE",
      },
      mockDb
    );

    expect(updated.status).toBe("COMPLETED");
    expect(updated.currentStep).toBe(4);
  });

  it("processPetitionAction: RETURN เปลี่ยนสถานะเป็น RETURNED และรีเซ็ต Step เป็น 1", async () => {
    const now = new Date();
    const existing = {
      id: "pet-4",
      tenantId,
      status: "ADVISOR_APPROVED",
      currentStep: 2,
    };

    const mockDb = {
      petition: {
        findFirst: vi.fn().mockResolvedValue(existing),
        update: vi.fn().mockImplementation(({ data }) => ({
          ...existing,
          ...data,
          program: null,
          advisor: null,
          activities: [],
          createdAt: now,
          updatedAt: now,
        })),
      },
    } as unknown as Db;

    const updated = await processPetitionAction(
      tenantId,
      {
        petitionId: "pet-4",
        action: "RETURN",
        actorName: "ประธานหลักสูตร",
        actorRole: "PROGRAM_CHAIR",
        comment: "ขอให้แนบเอกสารรับรองเพิ่มเติม",
      },
      mockDb
    );

    expect(updated.status).toBe("RETURNED");
    expect(updated.currentStep).toBe(1);
  });

  it("processPetitionAction: REJECT เปลี่ยนสถานะเป็น REJECTED", async () => {
    const now = new Date();
    const existing = {
      id: "pet-5",
      tenantId,
      status: "SUBMITTED",
      currentStep: 1,
    };

    const mockDb = {
      petition: {
        findFirst: vi.fn().mockResolvedValue(existing),
        update: vi.fn().mockImplementation(({ data }) => ({
          ...existing,
          ...data,
          program: null,
          advisor: null,
          activities: [],
          createdAt: now,
          updatedAt: now,
        })),
      },
    } as unknown as Db;

    const updated = await processPetitionAction(
      tenantId,
      {
        petitionId: "pet-5",
        action: "REJECT",
        actorName: "อ.ที่ปรึกษา",
        actorRole: "ADVISOR",
        comment: "หัวข้อวิจัยซ้ำซ้อนกับงานที่เผยแพร่แล้ว",
      },
      mockDb
    );

    expect(updated.status).toBe("REJECTED");
  });

  it("processPetitionAction: ปฏิเสธการพิจารณาหากคำร้อง COMPLETED หรือ REJECTED ไปแล้ว", async () => {
    const completedPetition = {
      id: "pet-done",
      tenantId,
      status: "COMPLETED",
      currentStep: 4,
    };

    const mockDb = {
      petition: {
        findFirst: vi.fn().mockResolvedValue(completedPetition),
      },
    } as unknown as Db;

    await expect(
      processPetitionAction(
        tenantId,
        {
          petitionId: "pet-done",
          action: "APPROVE",
          actorName: "ทดสอบ",
          actorRole: "ADMIN",
        },
        mockDb
      )
    ).rejects.toThrow("ไม่สามารถพิจารณาคำร้องที่เสร็จสมบูรณ์แล้วได้");
  });
});
