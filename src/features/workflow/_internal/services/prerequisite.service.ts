import { z } from "zod";

export const degreeLevelEnum = z.enum(["MASTER", "DOCTORAL"]);
export type DegreeLevel = z.infer<typeof degreeLevelEnum>;

export const englishTestTypeEnum = z.enum([
  "CU_TEP",
  "TOEFL_IBT",
  "TOEFL_ITP",
  "IELTS",
  "TU_GET",
  "EXEMPT",
]);
export type EnglishTestType = z.infer<typeof englishTestTypeEnum>;

export const publicationTypeEnum = z.enum([
  "SCOPUS_ISI_JOURNAL",
  "TCI_TIER_1",
  "INTERNATIONAL_CONFERENCE",
  "NONE",
]);
export type PublicationType = z.infer<typeof publicationTypeEnum>;

export const checkThesisPrerequisitesInputSchema = z.object({
  degreeLevel: degreeLevelEnum.default("MASTER"),
  englishTestType: englishTestTypeEnum,
  englishScore: z.coerce.number().min(0).max(990).default(0),
  publicationType: publicationTypeEnum.default("NONE"),
  publicationTitle: z.string().optional(),
  publicationVenue: z.string().optional(),
});
export type CheckThesisPrerequisitesInput = z.infer<typeof checkThesisPrerequisitesInputSchema>;

export interface ThesisPrerequisitesResult {
  passed: boolean;
  englishPassed: boolean;
  englishScore: number;
  englishMinRequired: number | string;
  englishDetails: string;
  publicationPassed: boolean;
  publicationMinRequired: string;
  publicationDetails: string;
  summaryMessageTh: string;
  summaryMessageEn: string;
}

/**
 * Standard university graduate minimum English score table
 */
export const ENGLISH_MIN_SCORES: Record<EnglishTestType, number> = {
  CU_TEP: 75,
  TOEFL_IBT: 79,
  TOEFL_ITP: 550,
  IELTS: 6.0,
  TU_GET: 75,
  EXEMPT: 0,
};

/**
 * Pure domain logic: Evaluate candidate prerequisites for Thesis Final Defense
 */
export function evaluateThesisPrerequisites(
  input: CheckThesisPrerequisitesInput
): ThesisPrerequisitesResult {
  const { degreeLevel, englishTestType, englishScore, publicationType } = input;

  // 1. Evaluate English Proficiency
  let englishPassed = false;
  let englishMinRequired: number | string = ENGLISH_MIN_SCORES[englishTestType];
  let englishDetails = "";

  if (englishTestType === "EXEMPT") {
    englishPassed = true;
    englishMinRequired = "ได้รับการยกเว้นตามระเบียบ";
    englishDetails = "ได้รับการยกเว้นตามประกาศบัณฑิตวิทยาลัย (สำเร็จการศึกษาจากหลักสูตรนานาชาติ)";
  } else {
    const minScore = ENGLISH_MIN_SCORES[englishTestType];
    englishPassed = englishScore >= minScore;
    if (englishPassed) {
      englishDetails = `ผ่านเกณฑ์มาตรฐานภาษาอังกฤษ (${englishScore} / ขั้นต่ำ ${minScore})`;
    } else {
      const diff = minScore - englishScore;
      englishDetails = `คะแนนยังไม่ผ่านเกณฑ์ (ได้ ${englishScore} / ขาดอีก ${diff > 0 ? diff : 0} คะแนนเพื่อผ่านเกณฑ์ ${minScore})`;
    }
  }

  // 2. Evaluate Academic Publications
  let publicationPassed = false;
  let publicationMinRequired = "";
  let publicationDetails = "";

  if (degreeLevel === "DOCTORAL") {
    publicationMinRequired = "วารสารระดับนานาชาติในฐานข้อมูล Scopus / ISI Web of Science อย่างน้อย 1 เรื่อง";
    if (publicationType === "SCOPUS_ISI_JOURNAL") {
      publicationPassed = true;
      publicationDetails = "ผ่านเกณฑ์: มีผลงานตีพิมพ์ในวารสารระดับนานาชาติ (Scopus / ISI Web of Science)";
    } else {
      publicationPassed = false;
      publicationDetails = "ยังไม่ผ่านเกณฑ์ระดับปริญญาเอก: ต้องตีพิมพ์ในวารสาร Scopus / ISI เท่านั้น";
    }
  } else {
    // MASTER Degree
    publicationMinRequired = "วารสารระดับนานาชาติ Scopus/ISI หรือ TCI กลุ่มที่ 1 หรือ Proceedings การประชุมวิชาการนานาชาติ 1 เรื่อง";
    if (
      publicationType === "SCOPUS_ISI_JOURNAL" ||
      publicationType === "TCI_TIER_1" ||
      publicationType === "INTERNATIONAL_CONFERENCE"
    ) {
      publicationPassed = true;
      publicationDetails = "ผ่านเกณฑ์: มีผลงานวิจัยได้รับการเผยแพร่ตามเกณฑ์มาตรฐานบัณฑิตศึกษาปริญญาโท";
    } else {
      publicationPassed = false;
      publicationDetails = "ยังไม่ผ่านเกณฑ์: ต้องมีผลงานตีพิมพ์ใน TCI กลุ่ม 1, Proceedings นานาชาติ หรือ Scopus/ISI อย่างน้อย 1 เรื่อง";
    }
  }

  const passed = englishPassed && publicationPassed;

  const summaryMessageTh = passed
    ? "นิสิตมีคุณสมบัติครบถ้วนตามระเบียบบัณฑิตวิทยาลัย อนุญาตให้ยื่นขอสอบจบวิทยานิพนธ์ได้"
    : "นิสิตยังมีคุณสมบัติไม่ครบตามระเบียบบัณฑิตวิทยาลัย (กรุณาตรวจสอบผลคะแนนภาษาอังกฤษหรือผลงานตีพิมพ์)";

  const summaryMessageEn = passed
    ? "All graduation prerequisites fulfilled according to university graduate school regulations."
    : "Prerequisites unmet: English score or academic publications do not satisfy requirements for final defense.";

  return {
    passed,
    englishPassed,
    englishScore,
    englishMinRequired,
    englishDetails,
    publicationPassed,
    publicationMinRequired,
    publicationDetails,
    summaryMessageTh,
    summaryMessageEn,
  };
}
