import { describe, it, expect, vi } from "vitest";
import {
  validateThesisTitleInputSchema,
  summarizeConceptNoteInputSchema,
  generateAdvisoryFeedbackInputSchema,
} from "../schemas";
import {
  validateThesisTitle,
  summarizeConceptNote,
  generateAdvisoryFeedback,
} from "./ai.service";

describe("AI Schemas Validation", () => {
  it("validateThesisTitleInputSchema: ผ่านเมื่อระบุชื่อไทยความยาว >= 3", () => {
    const parsed = validateThesisTitleInputSchema.parse({
      titleTh: "ระบบการรู้จำใบหน้า",
      titleEn: "Face Recognition System",
    });
    expect(parsed.titleTh).toBe("ระบบการรู้จำใบหน้า");
    expect(parsed.titleEn).toBe("Face Recognition System");
  });

  it("validateThesisTitleInputSchema: ล้มเหลวเมื่อชื่อไทยสั้นเกินไป", () => {
    expect(() => validateThesisTitleInputSchema.parse({ titleTh: "ก" })).toThrow();
  });

  it("summarizeConceptNoteInputSchema: ผ่านเมื่อมี title และ description ครบถ้วน", () => {
    const parsed = summarizeConceptNoteInputSchema.parse({
      title: "การประยุกต์ใช้ AI ในการแพทย์",
      description: "ข้อเสนอวิจัยเกี่ยวกับการประยุกต์ใช้โมเดล Deep Learning ในการตรวจจับภาพถ่ายทางการแพทย์",
    });
    expect(parsed.title).toBe("การประยุกต์ใช้ AI ในการแพทย์");
  });

  it("generateAdvisoryFeedbackInputSchema: ผ่านเมื่อระบุ action และ studentName", () => {
    const parsed = generateAdvisoryFeedbackInputSchema.parse({
      petitionType: "THESIS_TOPIC_APPROVAL",
      studentName: "สมชาย ใจดี",
      thesisTitleTh: "การพัฒนาระบบ AI สำหรับการแพทย์",
      action: "APPROVE",
    });
    expect(parsed.action).toBe("APPROVE");
    expect(parsed.reviewerRole).toBe("ADVISOR");
  });
});

describe("AI Domain Services & Fallback Engine", () => {
  it("validateThesisTitle: คืนค่าผลการวิเคราะห์ชื่อวิทยานิพนธ์ คะแนน และคำแนะนำภาษาไทย-อังกฤษ", async () => {
    const result = await validateThesisTitle({
      titleTh: "ระบบตรวจจับใบหน้าสำหรับห้องเรียนอัจฉริยะ",
      titleEn: "face detection system for smart classroom",
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.suggestedTitleTh).toContain("การ");
    expect(result.suggestedTitleEn).toBeDefined();
    expect(result.alignmentAnalysis).toBeDefined();
    expect(result.grammarNotes.length).toBeGreaterThan(0);
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  it("validateThesisTitle: สร้างชื่อภาษาอังกฤษอัตโนมัติเมื่อผู้ใช้ไม่ได้ระบุ", async () => {
    const result = await validateThesisTitle({
      titleTh: "การประยุกต์ใช้ปัญญาประดิษฐ์ในการวินิจฉัยโรค",
    });

    expect(result.suggestedTitleEn).toBeDefined();
    expect(result.suggestedTitleEn.length).toBeGreaterThan(10);
    expect(result.keywords).toContain("Artificial Intelligence");
  });

  it("summarizeConceptNote: สรุปสาระสำคัญ ระเบียบวิธีวิจัย และคำสำคัญ", async () => {
    const result = await summarizeConceptNote({
      title: "การออกแบบสถาปัตยกรรมคลาวด์สำหรับ Big Data",
      description: "โครงการวิจัยนี้ต้องการศึกษาแนวทางการปรับจูนคลัสเตอร์สำหรับการประมวลผลข้อมูลขนาดใหญ่",
    });

    expect(result.summary).toContain("การออกแบบสถาปัตยกรรมคลาวด์");
    expect(result.suggestedMethodology).toBeDefined();
    expect(result.potentialChallenges.length).toBeGreaterThan(0);
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  it("generateAdvisoryFeedback: สร้างข้อคิดเห็นเชิงบวกสำหรับสถานะ APPROVE", async () => {
    const result = await generateAdvisoryFeedback({
      petitionType: "THESIS_TOPIC_APPROVAL",
      studentName: "นายมานะ มีใจ",
      thesisTitleTh: "การวิเคราะห์ข้อมูลขนาดใหญ่ในระบบสุขภาพ",
      action: "APPROVE",
      reviewerRole: "ADVISOR",
    });

    expect(result.comment).toContain("เห็นชอบ");
    expect(result.pointsToImprove.length).toBeGreaterThan(0);
  });

  it("generateAdvisoryFeedback: สร้างคำแนะนำการแก้ไขสำหรับสถานะ RETURN", async () => {
    const result = await generateAdvisoryFeedback({
      petitionType: "THESIS_TOPIC_APPROVAL",
      studentName: "นายสมชาย ใจดี",
      thesisTitleTh: "การพัฒนาแอปพลิเคชัน",
      action: "RETURN",
      reviewerRole: "ADVISOR",
    });

    expect(result.comment).toContain("ปรับปรุง");
  });

  it("generateAdvisoryFeedback: สร้างเหตุผลอย่างเป็นทางการสำหรับสถานะ REJECT", async () => {
    const result = await generateAdvisoryFeedback({
      petitionType: "DEFENSE_EXAM_REQUEST",
      studentName: "นายสมเกียรติ พากเพียร",
      thesisTitleTh: "ระบบเครือข่าย",
      action: "REJECT",
      reviewerRole: "DEAN_OFFICE",
    });

    expect(result.comment).toContain("ปฏิเสธ");
  });
});
