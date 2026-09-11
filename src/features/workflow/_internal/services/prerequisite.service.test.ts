import { describe, it, expect } from "vitest";
import {
  evaluateThesisPrerequisites,
  checkThesisPrerequisitesInputSchema,
} from "./prerequisite.service";

describe("Thesis Defense Pre-requisite Service Tests", () => {
  describe("Schema Validation", () => {
    it("parse สำเร็จเมื่อระบุข้อมูลที่ถูกต้อง", () => {
      const input = {
        degreeLevel: "MASTER" as const,
        englishTestType: "CU_TEP" as const,
        englishScore: 80,
        publicationType: "TCI_TIER_1" as const,
        publicationTitle: "การวิเคราะห์ข้อมูลขนาดใหญ่ในระบบสุขภาพ",
        publicationVenue: "วารสารวิทยาศาสตร์และเทคโนโลยี",
      };

      const parsed = checkThesisPrerequisitesInputSchema.parse(input);
      expect(parsed.englishScore).toBe(80);
      expect(parsed.degreeLevel).toBe("MASTER");
    });
  });

  describe("English Proficiency Evaluation", () => {
    it("ผ่านเกณฑ์ CU-TEP เมื่อคะแนน >= 75", () => {
      const res = evaluateThesisPrerequisites({
        degreeLevel: "MASTER",
        englishTestType: "CU_TEP",
        englishScore: 78,
        publicationType: "TCI_TIER_1",
      });

      expect(res.englishPassed).toBe(true);
      expect(res.passed).toBe(true);
      expect(res.englishDetails).toContain("ผ่านเกณฑ์");
    });

    it("ไม่ผ่านเกณฑ์ CU-TEP เมื่อคะแนน < 75", () => {
      const res = evaluateThesisPrerequisites({
        degreeLevel: "MASTER",
        englishTestType: "CU_TEP",
        englishScore: 70,
        publicationType: "TCI_TIER_1",
      });

      expect(res.englishPassed).toBe(false);
      expect(res.passed).toBe(false);
      expect(res.englishDetails).toContain("คะแนนยังไม่ผ่านเกณฑ์");
    });

    it("ผ่านเกณฑ์ IELTS เมื่อคะแนน >= 6.0", () => {
      const res = evaluateThesisPrerequisites({
        degreeLevel: "MASTER",
        englishTestType: "IELTS",
        englishScore: 6.5,
        publicationType: "INTERNATIONAL_CONFERENCE",
      });

      expect(res.englishPassed).toBe(true);
      expect(res.passed).toBe(true);
    });

    it("ผ่านเกณฑ์เสมอเมื่อได้รับการยกเว้น (EXEMPT)", () => {
      const res = evaluateThesisPrerequisites({
        degreeLevel: "MASTER",
        englishTestType: "EXEMPT",
        englishScore: 0,
        publicationType: "TCI_TIER_1",
      });

      expect(res.englishPassed).toBe(true);
      expect(res.passed).toBe(true);
    });
  });

  describe("Academic Publication Evaluation", () => {
    it("ระดับปริญญาโท: ผ่านเมื่อมีผลงาน TCI กลุ่ม 1, Proceedings หรือ Scopus", () => {
      const res1 = evaluateThesisPrerequisites({
        degreeLevel: "MASTER",
        englishTestType: "CU_TEP",
        englishScore: 80,
        publicationType: "TCI_TIER_1",
      });
      expect(res1.publicationPassed).toBe(true);
      expect(res1.passed).toBe(true);

      const res2 = evaluateThesisPrerequisites({
        degreeLevel: "MASTER",
        englishTestType: "CU_TEP",
        englishScore: 80,
        publicationType: "NONE",
      });
      expect(res2.publicationPassed).toBe(false);
      expect(res2.passed).toBe(false);
    });

    it("ระดับปริญญาเอก (DOCTORAL): ต้องตีพิมพ์ใน Scopus/ISI เท่านั้น", () => {
      // TCI Tier 1 is NOT enough for Doctoral defense
      const resDocTci = evaluateThesisPrerequisites({
        degreeLevel: "DOCTORAL",
        englishTestType: "TOEFL_IBT",
        englishScore: 85,
        publicationType: "TCI_TIER_1",
      });
      expect(resDocTci.publicationPassed).toBe(false);
      expect(resDocTci.passed).toBe(false);

      // Scopus / ISI Journal PASSES for Doctoral defense
      const resDocScopus = evaluateThesisPrerequisites({
        degreeLevel: "DOCTORAL",
        englishTestType: "TOEFL_IBT",
        englishScore: 85,
        publicationType: "SCOPUS_ISI_JOURNAL",
      });
      expect(resDocScopus.publicationPassed).toBe(true);
      expect(resDocScopus.passed).toBe(true);
    });
  });
});
